import { NextFunction, Request, Response } from 'express'
import { ErrorCode, HttpException } from '../../../middleware/exceptions'

import { orders } from '../../../service/woocommerce'
import { OrganizationEntity } from 'src/model/organization'

export const getOrdersListController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization
    if(!organization ||
      !organization.woocommerceUrl ||
      !organization.woocommerceConsumerKey ||
      !organization.woocommerceConsumerSecret
    ){
      console.error('Woocommerce setting not found')
      return next(new HttpException(400, ErrorCode[400]))
    }
    const product = await orders.getAllOrderList(
      organization.woocommerceUrl,
      organization.woocommerceConsumerKey,
      organization.woocommerceConsumerSecret,
    )
    if (!product) return next(new HttpException(400, ErrorCode[400]))
    return res.status(200).send(product)
  } catch (error) {
    console.error(error)
    return next(new HttpException(400, ErrorCode[400]))
  }
}
