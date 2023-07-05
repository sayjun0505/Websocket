// import TextField from '@mui/material/TextField';
// import { Controller, useFormContext } from 'react-hook-form';
// import Accordion from '@mui/material/Accordion';
// import AccordionDetails from '@mui/material/AccordionDetails';
// import AccordionSummary from '@mui/material/AccordionSummary';
import Avatar from '@mui/material/Avatar';
// import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// import { useState } from 'react';
import format from 'date-fns/format';
import { useSelector } from 'react-redux';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

import { selectPayment } from '../../store/paymentSlice';

function DetailsTab(props) {
  const payment = useSelector(selectPayment);

  if (!payment) return null;

  return (
    <div>
      {payment.activation && payment.activation.createdBy && (
        <div className="pb-48">
          <div className="pb-16 flex items-center">
            <FuseSvgIcon color="action">heroicons-outline:user-circle</FuseSvgIcon>
            <Typography className="h2 mx-12 font-medium" color="text.secondary">
              Customer
            </Typography>
          </div>

          <div className="mb-24">
            <div className="table-responsive mb-48">
              <table className="simple">
                <thead>
                  <tr>
                    <th>
                      <Typography className="font-semibold">Name</Typography>
                    </th>
                    <th>
                      <Typography className="font-semibold">Email</Typography>
                    </th>
                    {payment.activation.createdBy.mobile && (
                      <th>
                        <Typography className="font-semibold">Phone</Typography>
                      </th>
                    )}
                    {payment.activation.package && (
                      <th>
                        <Typography className="font-semibold">Package Type</Typography>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="flex items-center">
                        {payment.activation.createdBy.picture && (
                          <Avatar
                            src={payment.activation.createdBy.picture}
                            alt={payment.activation.createdBy.display}
                          />
                        )}
                        <Typography className="truncate mx-8">
                          {`${payment.activation.createdBy.firstname} ${payment.activation.createdBy.lastname}`}
                        </Typography>
                      </div>
                    </td>
                    <td>
                      <Typography className="truncate">
                        {payment.activation.createdBy.email}
                      </Typography>
                    </td>
                    {payment.activation.createdBy.mobile && (
                      <td>
                        <Typography className="truncate">
                          {payment.activation.createdBy.mobile}
                        </Typography>
                      </td>
                    )}
                    {payment.activation.package && (
                      <td>
                        <Typography className="truncate">
                          {payment.activation.package.name}
                        </Typography>
                      </td>
                    )}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div className="pb-48">
        <div className="pb-16 flex items-center">
          <FuseSvgIcon color="action">heroicons-outline:clock</FuseSvgIcon>
          <Typography className="h2 mx-12 font-medium" color="text.secondary">
            Payment Status
          </Typography>
        </div>

        <div className="table-responsive">
          <table className="simple">
            <thead>
              <tr>
                <th>
                  <Typography className="font-semibold">Status</Typography>
                </th>
                <th>
                  <Typography className="font-semibold">Updated On</Typography>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <span className="truncate">{payment.resultCode}</span>
                </td>
                <td>
                  <span className="truncate">{format(new Date(payment.paymentAt), 'PP')}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="pb-48">
        <div className="pb-16 flex items-center">
          <FuseSvgIcon color="action">heroicons-outline:currency-dollar</FuseSvgIcon>
          <Typography className="h2 mx-12 font-medium" color="text.secondary">
            Payment
          </Typography>
        </div>

        <div className="table-responsive">
          <table className="simple">
            <thead>
              <tr>
                <th>
                  <Typography className="font-semibold">ReferenceNo</Typography>
                </th>
                <th>
                  <Typography className="font-semibold">Payment Method</Typography>
                </th>
                <th>
                  <Typography className="font-semibold">Amount</Typography>
                </th>
                <th>
                  <Typography className="font-semibold">Date</Typography>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <span className="truncate">{payment.gbpReferenceNo}</span>
                </td>
                <td>
                  <span className="truncate">{payment.paymentType}</span>
                </td>
                <td>
                  <span className="truncate">{payment.amount}</span>
                </td>
                <td>
                  <span className="truncate">{format(new Date(payment.paymentAt), 'PP')}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DetailsTab;
