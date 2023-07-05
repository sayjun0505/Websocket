import { NextFunction, Request, Response } from 'express'
import Stripe from 'stripe'

import * as crypto from 'crypto'
import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { channelModel } from '../../model/channel'
import {
  activationModel,
  OrganizationEntity,
  packageModel,
  paymentModel,
  UserEntity,
  userModel,
} from '../../model/organization'
import {
  chatModel,
  MessageEntity,
  messageModel,
  MESSAGE_TYPE,
} from '../../model/chat'
import { ChannelEntity } from '../../model/channel/channel.entity'
import { lineService } from '../../service/channel'
import { gcsService } from '../../service/google'
import { MESSAGE_DIRECTION } from '../../model/chat/message.entity'
import { ChatEntity } from '../../model/chat/chat.entity'
import { CustomerEntity } from '../../model/customer/customer.entity'
import { customerModel } from '../../model/customer'
import * as channelService from '../../service/channel'
import * as replyService from '../../service/reply'
import { notificationUtil, workingHoursUtil } from '../../util'
import { sseController } from '../sse'
import { PaymentEntity } from '../../model/organization/payment.entity'
import {
  ActivationEntity,
  ACTIVATION_STATUS,
  PAYMENT_OPTION,
} from '../../model/organization/activation.entity'

// // Verifying signatures
// const verifyingSignature =async (params:type) => {

// }

export const receivePaymentResponse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_URL)) {
    errorMessage('UTILS', 'stripe', 'missing env')
    throw new HttpException(500, ErrorCode[500])
  }

  // const webhookSecret: string = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeSecretKey: string = process.env.STRIPE_SECRET_KEY

  const webhookSecret: string =
    'whsec_60972dbf4df69bfc08478fc2a1ffbfb2ca7bb6f48bf938d758599554edff16f9'
  // const stripe = new Stripe(
  //   'sk_test_51LcX5NGgxyNY7P9PJyQSzuCiEsh3fxAGBWZdI1jn79KYLvLFMA2j8hY76G7EeAyEHMVqyLTNanEMtfimIR52Hb4300g4fZTHSc',
  //   {
  //     apiVersion: '2022-11-15',
  //   },
  // )
  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2022-11-15',
  })

  // const sig = req.headers['stripe-signature']
  // if (!sig) {
  //   res.status(400).send(`Webhook Error: ❌ validate fail`)
  //   return
  // }

  const payloadString = JSON.stringify(req.body, null, 2)
  const sig = stripe.webhooks.generateTestHeaderString({
    payload: payloadString,
    secret: webhookSecret,
  })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(payloadString, sig, webhookSecret)
  } catch (err: any) {
    // On error, log and return the error message
    console.log(`❌ Error message: ${err.message}`)
    res.status(400).send(`Webhook Error: ${err.message}`)
    return
  }

  // Successfully constructed event
  console.log('✅ Success:', event.id)

  if (event.type === 'invoice.paid') {
    const invoice = event.data.object as Stripe.Invoice
    console.log(`💵 invoice data: `, invoice.id)
    const _subscription = invoice.subscription
    const _customer = invoice.customer
    if (!_subscription) {
      console.log(`❌ Subscription id not found`)
      return
    }
    const subscription = await stripe.subscriptions.retrieve(
      String(_subscription),
    )
    if (subscription.status !== 'active' || !invoice.customer_email) {
      console.log(`❌ Subscription status:${subscription.status}`)
      return
    }
    if (!invoice.customer_email) return
    const user = await userModel.getUserWithEmail(invoice.customer_email)
    if (!user) {
      console.log(`❌ [Subscription] user(${invoice.customer_email}) not found`)
      return
    }
    // console.log('[invoice] ', invoice.lines.data)
    subscription.items.data.forEach(async (item) => {
      if (!item.price || !item.price.product || !item.price.recurring) return
      const productId = item.price.product
      const pkg = await packageModel.getPackageWithStripeProductId(
        String(productId),
      )
      if (!pkg) return
      const expiration = new Date()
      // Extend expiration date
      if (item.price.recurring.interval === 'day') {
        expiration.setDate(
          expiration.getDate() + item.price.recurring.interval_count,
        )
      } else if (item.price.recurring.interval === 'month') {
        expiration.setMonth(
          expiration.getMonth() + item.price.recurring.interval_count,
        )
      } else if (item.price.recurring.interval === 'week') {
        expiration.setDate(
          expiration.getDay() + item.price.recurring.interval_count * 7,
        )
      } else if (item.price.recurring.interval === 'year') {
        expiration.setFullYear(
          expiration.getFullYear() + item.price.recurring.interval_count,
        )
      }
      try {
        // Create Activation
        const newActivation: ActivationEntity = {
          ...new ActivationEntity(),
          status: ACTIVATION_STATUS.ACTIVE,
          packageId: pkg.id,
          subId: String(_subscription),
          customerId: String(_customer),
          expiration,
          createdBy: user,
        }
        // Add Activation to database
        const activation = await activationModel.saveActivation(newActivation)
        console.log(`💵 activation: `, activation.id)
      } catch (error) {
        errorMessage('CONTROLLER', 'webhook', 'receivePaymentResponse', error)
        // return next(new HttpException(400, ErrorCode[400]))
        return
      }
    })
  } else if (event.type === 'customer.subscription.updated') {
    const subscriptionUpdated = event.data.object as Stripe.Subscription
    if (subscriptionUpdated && subscriptionUpdated.items.data[0].price) {
      console.log('🎃 Subscription Updated', subscriptionUpdated)
      // Update plan
      const productId = String(subscriptionUpdated.items.data[0].price.product)
      // console.log('🎃 Updated productId ', productId)
      const productPackage = await packageModel.getPackageWithStripeProductId(
        productId,
      )
      // console.log('🎃 Updated Package ', productPackage)
      if (productPackage) {
        activationModel.updateActivationPackage(
          subscriptionUpdated.id,
          productPackage.id,
        )
      }

      // console.log(
      //   '🎃 Updated recurring ',
      //   subscriptionUpdated.items.data[0].price.recurring,
      // )
      if (subscriptionUpdated.items.data[0].price.recurring) {
        const expiration = new Date()
        // Extend expiration date
        if (
          subscriptionUpdated.items.data[0].price.recurring.interval === 'day'
        ) {
          expiration.setDate(
            expiration.getDate() +
              subscriptionUpdated.items.data[0].price.recurring.interval_count,
          )
        } else if (
          subscriptionUpdated.items.data[0].price.recurring.interval === 'month'
        ) {
          expiration.setMonth(
            expiration.getMonth() +
              subscriptionUpdated.items.data[0].price.recurring.interval_count,
          )
        } else if (
          subscriptionUpdated.items.data[0].price.recurring.interval === 'week'
        ) {
          expiration.setDate(
            expiration.getDay() +
              subscriptionUpdated.items.data[0].price.recurring.interval_count *
                7,
          )
        } else if (
          subscriptionUpdated.items.data[0].price.recurring.interval === 'year'
        ) {
          expiration.setFullYear(
            expiration.getFullYear() +
              subscriptionUpdated.items.data[0].price.recurring.interval_count,
          )
        }

        console.log(
          '🎃 Updated expiration ',
          subscriptionUpdated.id,
          expiration,
        )
        activationModel.updateActivationExpiration(
          subscriptionUpdated.id,
          expiration,
        )
      }
    }
  } else if (event.type === 'customer.subscription.deleted') {
    const subscriptionDeleted = event.data.object as Stripe.Subscription
    if (subscriptionDeleted && !subscriptionDeleted.cancel_at_period_end) {
      console.log('😱 Subscription Deleted', subscriptionDeleted.id)
      activationModel.deleteActivationWithStripeSubscriptionId(
        subscriptionDeleted.id,
      )
    }
  } else {
    console.warn(`🤷‍♀️ Unhandled event type: ${event.type}`)
  }

  // Cast event data to Stripe object
  // if (event.type === 'payment_intent.succeeded') {
  //   const stripeObject: Stripe.PaymentIntent = event.data
  //     .object as Stripe.PaymentIntent
  //   console.log(`💰 PaymentIntent status: ${stripeObject.status}`)
  //   // console.log('💰 data: ', stripeObject)
  // } else if (event.type === 'charge.succeeded') {
  //   const charge = event.data.object as Stripe.Charge
  //   console.log(`💵 Charge id: ${charge.id}`)
  // } else if (event.type === 'checkout.session.completed') {
  //   const checkout = event.data.object as Stripe.Charge
  //   console.log(`## 💵 checkout id: ${checkout.id}`)
  //   console.log(`## 💵 checkout data: `, checkout)
  // } else if (event.type === 'invoice.paid') {
  //   const invoice = event.data.object as Stripe.Charge
  //   console.log(`## 💵 invoice.paid: ${invoice.id}`)
  //   console.log(`## 💵 invoice data: `, invoice)
  // } else if (event.type === 'invoice.payment_succeeded') {
  //   const dataObject: Stripe.Invoice = event.data.object as Stripe.Invoice
  //   console.log(`@@ 💵 Invoice id: ${dataObject.id}`)
  //   // console.log(`@@ 💵 Invoice data: `, dataObject)
  //   if (dataObject.billing_reason === 'subscription_create') {
  //     // The subscription automatically activates after successful payment
  //     // Set the payment method used to pay the first invoice
  //     // as the default payment method for that subscription
  //     const subscription_id = String(dataObject.subscription)
  //     const payment_intent_id = String(dataObject.payment_intent)
  //     if (!subscription_id || !payment_intent_id) {
  //       res.json({ received: true })
  //       return
  //     }

  //     // Retrieve the payment intent used to pay the subscription
  //     const payment_intent = await stripe.paymentIntents.retrieve(
  //       payment_intent_id,
  //     )

  //     // stripe.subscriptions.retrieve()
  //     try {
  //       const subscription = await stripe.subscriptions.update(
  //         subscription_id,
  //         {
  //           default_payment_method: String(payment_intent.payment_method),
  //         },
  //       )

  //       console.log('subscription:', subscription)

  //       console.log(
  //         'Default payment method set for subscription:' +
  //           payment_intent.payment_method,
  //       )
  //     } catch (err) {
  //       console.log(err)
  //       console.log(
  //         `⚠️  Falied to update the default payment method for subscription: ${subscription_id}`,
  //       )
  //     }
  //   }
  // } else {
  //   console.warn(`🤷‍♀️ Unhandled event type: ${event.type}`)
  // }

  // Return a response to acknowledge receipt of the event
  res.json({ received: true })
  return
}
