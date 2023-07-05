import Button from '@mui/material/Button';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';

import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FuseLoading from '@fuse/core/FuseLoading';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Chip from '@mui/material/Chip';

import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import format from 'date-fns/format';

import { getActivation, selectActivation } from '../store/activationSlice';
import { selectPackages } from '../store/packagesSlice';
import { auth } from '../../../auth/services/firebaseService/firebaseApp';

const PaymentListItem = ({ payment }) => {
  const date = new Date(payment.paymentAt);
  date.setHours(date.getHours() - 7);
  // console.log('[Date] ', date);
  // console.log('[Date] ', format(date, 'dd/MM/yyyy HH:mm:ss'));
  return (
    <>
      <ListItem
        className="px-32 py-16"
        sx={{ bgcolor: 'background.paper' }}
        button
        // component={NavLinkAdapter}
        // to={`/packages/${activation.id}`}
      >
        <ListItemText
          classes={{ root: 'm-0', primary: 'font-medium leading-5 truncate' }}
          primary={
            <>
              {payment.gbpReferenceNo}
              {payment.resultCode === '00' && (
                <Chip
                  size="small"
                  label="Success"
                  color="success"
                  variant="filled"
                  className="mx-12"
                />
              )}
            </>
          }
          secondary={
            <div className="flex flex-col">
              <Typography
                className="inline"
                component="span"
                variant="body2"
                color="text.secondary"
              >
                Amount: {payment.amount}
              </Typography>
              <Typography
                className="inline"
                component="span"
                variant="body2"
                color="text.secondary"
              >
                Payment at: {format(date, 'dd-MMMM-yyyy HH:mm:ss')}
              </Typography>
            </div>
          }
        />
      </ListItem>
      <Divider />
    </>
  );
};

const PackageView = () => {
  const activation = useSelector(selectActivation);
  const packages = useSelector(selectPackages);
  const routeParams = useParams();
  const dispatch = useDispatch();

  const [token, setToken] = useState(null);
  const [customerPortalURL, setCustomerPortalURL] = useState(null);

  useEffect(() => {
    auth.currentUser.getIdToken().then((idToken) => {
      setToken(idToken);
    });
  }, []);

  useEffect(() => {
    dispatch(getActivation(routeParams.id));
  }, [dispatch, routeParams]);

  useEffect(() => {
    if (activation && activation.customerId && token) {
      axios
        .post(
          `/api/activation/createCustomerPortalSession`,
          { customerId: activation.customerId },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
          // console.log('response url', response.data.url);
          if (response.status === 200 && response.data && response.data.url) {
            setCustomerPortalURL(response.data.url);
          }
        })
        .catch((error) => {
          // console.log('Get customer portal error', error);
        });
    } else {
      setCustomerPortalURL(null);
    }
  }, [dispatch, token, activation]);

  // useEffect(() => {
  //   return () => {
  //     dispatch(resetActivation());
  //   };
  // }, []);

  if (!activation || !activation.package) {
    return <FuseLoading />;
  }

  return (
    <div className="relative flex flex-col flex-auto items-center p-24 pt-96 sm:p-48 sm:pt-96 mt-48">
      <div className="w-full max-w-3xl">
        <div className="flex flex-auto items-end -mt-64">
          <div className="flex items-center ml-auto mb-4 space-x-8">
            {/* {activation.price !== 0 && (
              <Button variant="contained" color="success" component={NavLinkAdapter} to="payment">
                <span className="mx-8">Payment</span>
              </Button>
            )} */}
            {customerPortalURL && (
              <Button variant="contained" color="success" target="_blank" href={customerPortalURL}>
                <span className="mx-8">Edit Subscription</span>
              </Button>
            )}
            <Button variant="contained" color="secondary" component={NavLinkAdapter} to="edit">
              <FuseSvgIcon size={20}>heroicons-outline:pencil-alt</FuseSvgIcon>
              <span className="mx-8">Edit Description</span>
            </Button>
          </div>
        </div>

        <Typography className="max-w-xs mt-12 text-4xl font-bold truncate">
          {activation.package.name}
        </Typography>

        <div className="flex flex-wrap items-center mt-8">
          {activation.status === 'active' && (
            <Chip size="small" label="Active" color="success" variant="filled" />
          )}
          {activation.status === 'waitingPayment' && (
            <Chip
              size="small"
              label="Awaiting Payment"
              // color="info"
              variant="outlined"
            />
          )}

          {activation.status === 'waitingConfirm' && (
            <Chip
              size="small"
              label="Awaiting Confirmation"
              // color="info"
              variant="outlined"
            />
          )}

          {activation.status === 'expired' && (
            <Chip size="small" label="Expired" color="warning" variant="outlined" />
          )}
        </div>

        <Divider className="mt-16 mb-24" />

        <div className="flex flex-col space-y-32">
          {activation && activation.package && !activation.package.isFree && (
            <div className="flex items-center">
              <div className="flex items-baseline whitespace-nowrap">
                <Typography className="mr-8 text-2xl">THB</Typography>
                <Typography className="text-6xl font-semibold leading-tight tracking-tight">
                  {activation.price ? `${activation.price}` : `Contact us`}
                </Typography>
              </div>
            </div>
          )}

          <div className="flex flex-col">
            {activation &&
              activation.package &&
              !activation.package.isFree &&
              activation.price > 0 && (
                <div className="mb-24">
                  <Typography className="font-semibold">Payment:</Typography>
                  <div className="mt-16 space-y-8">
                    {activation.paymentType && (
                      <div className="flex">
                        <Typography className="ml-16 leading-5">{`- ${activation.paymentType}`}</Typography>
                      </div>
                    )}
                    {activation.paymentOption === 'yearly' && (
                      <div className="flex">
                        <Typography className="ml-16 leading-5">- Yearly billing</Typography>
                      </div>
                    )}
                    {activation.paymentOption === 'quarterly' && (
                      <div className="flex">
                        <Typography className="ml-16 leading-5">- Quarterly billing</Typography>
                      </div>
                    )}
                    {activation.paymentOption === 'halfYearly' && (
                      <div className="flex">
                        <Typography className="ml-16 leading-5">- Half-Yearly billing</Typography>
                      </div>
                    )}
                    {activation.paymentOption === 'monthly' && (
                      <div className="flex">
                        <Typography className="ml-16 leading-5">- Monthly billing</Typography>
                      </div>
                    )}
                  </div>
                </div>
              )}
            <Typography className="font-semibold">
              {activation.package.name} package features, including:
            </Typography>
            <div className="mt-16 space-y-8">
              {activation.package && activation.package.organizationLimit && (
                <div className="flex">
                  <FuseSvgIcon className="text-green-600" size={20}>
                    heroicons-solid:check
                  </FuseSvgIcon>
                  <Typography className="ml-2 leading-5">
                    <b>{activation.package.organizationLimit}</b> organizations
                  </Typography>
                </div>
              )}
              {activation.package && activation.package.organizationLimit && (
                <div className="flex">
                  <FuseSvgIcon className="text-green-600" size={20}>
                    heroicons-solid:check
                  </FuseSvgIcon>
                  <Typography className="ml-2 leading-5">
                    <b>{activation.package.userLimit}</b> users
                  </Typography>
                </div>
              )}
              {activation.package && activation.package.organizationLimit && (
                <div className="flex">
                  <FuseSvgIcon className="text-green-600" size={20}>
                    heroicons-solid:check
                  </FuseSvgIcon>
                  <Typography className="ml-2 leading-5">
                    <b>{activation.package.messageLimit}</b> messages
                  </Typography>
                </div>
              )}
              {activation.package && activation.package.organizationLimit && (
                <div className="flex">
                  <FuseSvgIcon className="text-green-600" size={20}>
                    heroicons-solid:check
                  </FuseSvgIcon>
                  <Typography className="ml-2 leading-5">
                    <b>{activation.package.channelLimit}</b> channels
                  </Typography>
                </div>
              )}
            </div>
          </div>

          {activation.inviteCode && (
            <Typography className="ml-2 leading-5">
              Invite Code: <b>{activation.inviteCode}</b>
            </Typography>
          )}

          {/* Payment List */}
          {activation &&
            activation.package &&
            !activation.package.isFree &&
            activation.payments &&
            activation.payments.length > 0 && (
              <Button variant="outlined" component={NavLinkAdapter} to="history">
                Payment History
              </Button>
            )}
        </div>
      </div>
    </div>
  );
};

export default PackageView;
