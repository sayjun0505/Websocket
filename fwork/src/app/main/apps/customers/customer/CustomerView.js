import Button from '@mui/material/Button';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FuseLoading from '@fuse/core/FuseLoading';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { selectPermission } from 'app/store/permissionSlice';
import { getCustomer, selectCustomer } from '../store/customerSlice';
import { selectLabels } from '../store/labelsSlice';

const CustomerView = () => {
  const customer = useSelector(selectCustomer);
  const permission = useSelector(selectPermission);
  const labels = useSelector(selectLabels);
  const routeParams = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getCustomer(routeParams.id));
  }, [dispatch, routeParams]);

  if (!customer) {
    return <FuseLoading />;
  }

  return (
    <div className="relative flex flex-col flex-auto items-center p-24 pt-96 sm:p-48 sm:pt-96 mt-48">
      <div className="w-full max-w-3xl">
        <div className="flex flex-auto items-end -mt-64">
          <Avatar
            sx={{
              borderWidth: 4,
              borderStyle: 'solid',
              borderColor: 'background.paper',
              backgroundColor: 'background.default',
              color: 'text.secondary',
            }}
            className="w-128 h-128 text-64 font-bold"
            src={customer.avatar || customer.pictureURL}
            alt={customer.display}
          >
            {customer.display.charAt(0)}
          </Avatar>
          <div className="flex items-center ml-auto mb-4">
            <Button
              variant="contained"
              color="secondary"
              component={NavLinkAdapter}
              to="edit"
              disabled={!(permission && permission.customer && permission.customer.update)}
            >
              <FuseSvgIcon size={20}>heroicons-outline:pencil-alt</FuseSvgIcon>
              <span className="mx-8">Edit</span>
            </Button>
          </div>
        </div>

        <Typography className="max-w-xs mt-12 text-4xl font-bold truncate">
          {customer.display}
        </Typography>

        <div className="flex flex-wrap items-center mt-8">
          {customer.customerLabel.map((label) => (
            <Chip
              key={label.id}
              label={label.label}
              className="mr-12 mb-12"
              size="small"
            />
          ))}
        </div>

        <Divider className="mt-16 mb-24" />

        <div className="flex flex-col space-y-32">
          {customer.firstname && customer.lastname && (
            <div className="flex items-center">
              <FuseSvgIcon>heroicons-outline:user</FuseSvgIcon>
              <div className="ml-24 leading-6">{`${customer.firstname} ${customer.lastname}`}</div>
            </div>
          )}

          {customer.display && (
            <div className="flex items-center">
              <FuseSvgIcon>heroicons-outline:identification</FuseSvgIcon>
              <div className="ml-24 leading-6">{customer.display}</div>
            </div>
          )}

          {customer.channel && (customer.channel.line || customer.channel.facebook) && (
            <div className="flex items-center">
              <FuseSvgIcon>heroicons-outline:globe</FuseSvgIcon>
              <div className="ml-24 leading-6">
                {customer.channel.line && 'LINE'}
                {customer.channel.facebook && 'Facebook'}
              </div>
            </div>
          )}

          {customer.channel && (customer.channel.line || customer.channel.facebook) && (
            <div className="flex items-center">
              <FuseSvgIcon>heroicons-outline:chat-alt-2</FuseSvgIcon>
              <div className="ml-24 leading-6">
                {(customer.channel.line && customer.channel.line.name) ||
                  (customer.channel.facebook && customer.channel.facebook.name)}
              </div>
            </div>
          )}

          {customer.tel && (
            <div className="flex items-center">
              <FuseSvgIcon>heroicons-outline:phone</FuseSvgIcon>
              <div className="ml-24 leading-6">{customer.tel}</div>
            </div>
          )}

          {customer.email && (
            <div className="flex items-center">
              <FuseSvgIcon>heroicons-outline:mail</FuseSvgIcon>
              <div className="ml-24 leading-6">{customer.email}</div>
            </div>
          )}

          {customer.remarks && (
            <div className="flex">
              <FuseSvgIcon>heroicons-outline:menu-alt-2</FuseSvgIcon>
              <div
                className="max-w-none ml-24 prose dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: customer.remarks }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerView;
