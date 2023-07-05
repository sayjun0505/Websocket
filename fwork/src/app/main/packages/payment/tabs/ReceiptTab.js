import Typography from '@mui/material/Typography';
import { useSelector } from 'react-redux';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { motion } from 'framer-motion';
import format from 'date-fns/format';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

import { selectPayment } from '../../store/paymentSlice';

function ReceiptTab(props) {
  const payment = useSelector(selectPayment);

  if (!payment) return null;

  return (
    <div className="inline-block p-24 sm:p-40 text-left print:p-0 w-full overflow-auto">
      <motion.div
        initial={{ opacity: 0, y: 200 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ bounceDamping: 0 }}
      >
        <Card className=" border-2 w-xl p-64 mx-auto rounded-2xl shadow print:w-auto print:rounded-none print:shadow-none print:bg-transparent">
          <CardContent className="">
            <div className="flex items-start">
              <div className="grid grid-rows-2 place-items-start gap-y-48">
                <div className="grid auto-cols-max grid-flow-col gap-x-32">
                  <div className="place-self-center w-96">
                    <img className="w-96" src="assets/images/logo/logo.svg" alt="logo" />
                  </div>
                  <div className="pl-40 border-l text-md">
                    <Typography className="font-medium">FoxSoft Solutions Co.,Ltd.</Typography>
                    <Typography>263,265,267 ถนนกรุงธนบุรี แขวงคลองต้นไทร</Typography>
                    <Typography>เขตคลองสาน กรุงเทพมหานคร 10600</Typography>
                    <Typography>+66 987 6444</Typography>
                    <Typography>https://foxconnect.app/</Typography>
                  </div>
                </div>
                {payment.activation && payment.activation.createdBy && (
                  <div className="grid auto-cols-max grid-flow-col gap-x-32">
                    <Typography
                      className="place-self-center w-96 text-center text-2xl"
                      color="text.secondary"
                    >
                      Bill To
                    </Typography>
                    <div className="pl-40 border-l text-md">
                      <Typography className="font-medium">
                        {`${payment.activation.createdBy.firstname} ${payment.activation.createdBy.lastname}`}
                      </Typography>
                      <Typography className="break-words whitespace-pre ">
                        {payment.activation.createdBy.address}
                      </Typography>

                      <Typography>{payment.activation.createdBy.mobile}</Typography>
                      <Typography>{payment.activation.createdBy.email}</Typography>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-x-16 gap-y-4 ml-auto">
                <>
                  <Typography
                    className="text-right text-4xl tracking-tight mx-8"
                    color="text.secondary"
                  >
                    RECEIPT
                  </Typography>
                </>
                <div className="grid grid-cols-2 gap-x-16 gap-y-4 ml-auto mt-16">
                  <Typography
                    className="justify-self-end font-medium tracking-tight"
                    color="text.secondary"
                  >
                    RECEIPT DATE
                  </Typography>
                  <Typography className="font-medium">
                    {format(new Date(payment.paymentAt), 'PP')}
                  </Typography>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-x-4 mt-16">
              <Typography className="col-span-7 font-medium text-md" color="text.secondary">
                PACKAGE
              </Typography>
              <Typography
                className=" col-span-2 font-medium text-md text-right"
                color="text.secondary"
              >
                PRICE
              </Typography>
              <Typography className="font-medium text-md text-right" color="text.secondary">
                QTY
              </Typography>
              <Typography
                className="col-span-2 font-medium text-md text-right"
                color="text.secondary"
              >
                TOTAL
              </Typography>

              <div className="col-span-12 my-16 border-b" />

              <div className="col-span-7">
                <Typography className="text-lg font-medium">
                  {payment.activation.package.name}
                </Typography>
                {payment.activation.package && (
                  <div className="mt-8 mx-16  space-y-4">
                    {payment.activation.package.organizationLimit !== null && (
                      <div className="flex">
                        <FuseSvgIcon className="text-green-600" size={20}>
                          heroicons-solid:check
                        </FuseSvgIcon>
                        <Typography className="ml-2 leading-5">
                          <b>
                            {payment.activation.package.organizationLimit === 0
                              ? 'Unlimited'
                              : payment.activation.package.organizationLimit}
                          </b>{' '}
                          {payment.activation.package.organizationLimit === 1
                            ? 'organization'
                            : 'organizations'}
                        </Typography>
                      </div>
                    )}
                    {payment.activation.package.userLimit !== null && (
                      <div className="flex">
                        <FuseSvgIcon className="text-green-600" size={20}>
                          heroicons-solid:check
                        </FuseSvgIcon>
                        <Typography className="ml-2 leading-5">
                          <b>
                            {payment.activation.package.userLimit === 0
                              ? 'Unlimited'
                              : payment.activation.package.userLimit}
                          </b>{' '}
                          {payment.activation.package.userLimit === 1 ? 'user' : 'users'}
                        </Typography>
                      </div>
                    )}
                    {payment.activation.package.messageLimit !== null && (
                      <div className="flex">
                        <FuseSvgIcon className="text-green-600" size={20}>
                          heroicons-solid:check
                        </FuseSvgIcon>
                        <Typography className="ml-2 leading-5">
                          <b>
                            {payment.activation.package.messageLimit === 0
                              ? 'Unlimited'
                              : payment.activation.package.messageLimit}
                          </b>{' '}
                          {payment.activation.package.messageLimit === 1 ? 'message' : 'messages'}
                        </Typography>
                      </div>
                    )}
                    {payment.activation.package.channelLimit !== null && (
                      <div className="flex">
                        <FuseSvgIcon className="text-green-600" size={20}>
                          heroicons-solid:check
                        </FuseSvgIcon>
                        <Typography className="ml-2 leading-5">
                          <b>
                            {payment.activation.package.channelLimit === 0
                              ? 'Unlimited'
                              : payment.activation.package.channelLimit}
                          </b>{' '}
                          {payment.activation.package.channelLimit === 1 ? 'channel' : 'channels'}
                        </Typography>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <Typography className="col-span-2 self-center text-right">
                {payment.amount} THB
              </Typography>
              <Typography className="self-center text-right">1</Typography>
              <Typography className="col-span-2 self-center text-right">
                {payment.amount} THB
              </Typography>

              <div className="col-span-12 mt-64" />

              <Typography
                className="col-span-10 self-center font-medium tracking-tight"
                color="text.secondary"
              >
                SUBTOTAL
              </Typography>
              <Typography className="col-span-2 text-right text-lg">
                {((Number(payment.amount) * 100) / 107).toFixed(2)} THB
              </Typography>

              <div className="col-span-12 my-12 border-b" />

              <Typography
                className="col-span-10 self-center font-medium tracking-tight"
                color="text.secondary"
              >
                TAX
              </Typography>
              <Typography className="col-span-2 text-right text-lg">
                {((Number(payment.amount) / 100) * 7).toFixed(2)} THB
              </Typography>

              <div className="col-span-12 my-12 border-b" />

              <Typography
                className="col-span-10 self-center font-medium tracking-tight"
                color="text.secondary"
              >
                DISCOUNT
              </Typography>
              <Typography className="col-span-2 text-right text-lg">0 THB</Typography>

              <div className="col-span-12 my-12 border-b" />

              <Typography
                className="col-span-10 self-center text-2xl font-medium tracking-tight"
                color="text.secondary"
              >
                TOTAL
              </Typography>
              <Typography className="col-span-2 text-right text-2xl font-medium">
                {Number(payment.amount).toFixed(2)} THB
              </Typography>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default ReceiptTab;
