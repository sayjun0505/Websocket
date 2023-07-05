import Typography from '@mui/material/Typography';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import format from 'date-fns/format';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';

const ActivationListItem = (props) => {
  const { activation } = props;
  return (
    <>
      <ListItem
        className="px-32 py-16 w-full"
        sx={{ bgcolor: 'background.paper' }}
        button
        component={NavLinkAdapter}
        to={`/packages/${activation.id}`}
      >
        <ListItemText
          classes={{ root: 'm-0', primary: 'font-medium leading-5 truncate relative' }}
          primary={
            <>
              <Typography variant="h5" className="whitespace-nowrap mb-0">
                {activation.description}: {activation.package.name}
              </Typography>

              {activation.expiration && (
                <Typography
                  className="whitespace-nowrap mb-8 font-medium text-12"
                  color="text.secondary"
                >
                  Expiration Date: {format(new Date(activation.expiration), 'PP')}
                </Typography>
              )}

              {/* Show Activation status on Top Right */}
              <div className="absolute absolute top-0 right-0 flex flex-col items-end space-y-8">
                {activation.status === 'active' && (
                  <Chip size="small" label="Active" color="success" variant="filled" />
                )}
                {activation.status === 'waitingPayment' && (
                  <Chip size="small" label="Awaiting Payment" variant="filled" />
                )}
                {activation.status === 'waitingConfirm' && (
                  <Chip size="small" label="Awaiting Confirmation" variant="filled" />
                )}
                {activation.status === 'expired' && (
                  <Chip size="small" label="Expired" color="warning" variant="filled" />
                )}
                {activation.status === 'invite' && (
                  <Chip size="small" label="Invite" color="primary" variant="filled" />
                )}

                <Typography
                  className="inline"
                  component="span"
                  variant="body2"
                  color="text.secondary"
                >
                  {activation.organization}/{activation.package.organizationLimit} organizations
                </Typography>
              </div>

              {/* Show Package detail */}
              {activation.package && (
                <div className="mt-8 space-y-4">
                  {activation.package.organizationLimit !== null && (
                    <div className="flex">
                      <FuseSvgIcon className="text-green-600" size={20}>
                        heroicons-solid:check
                      </FuseSvgIcon>
                      <Typography className="ml-2 leading-5">
                        <b>
                          {activation.package.organizationLimit === 0
                            ? 'Unlimited'
                            : activation.package.organizationLimit}
                        </b>{' '}
                        {activation.package.organizationLimit === 1
                          ? 'organization'
                          : 'organizations'}
                      </Typography>
                    </div>
                  )}
                  {activation.package.userLimit !== null && (
                    <div className="flex">
                      <FuseSvgIcon className="text-green-600" size={20}>
                        heroicons-solid:check
                      </FuseSvgIcon>
                      <Typography className="ml-2 leading-5">
                        <b>
                          {activation.package.userLimit === 0
                            ? 'Unlimited'
                            : activation.package.userLimit}
                        </b>{' '}
                        {activation.package.userLimit === 1 ? 'user' : 'users'}
                      </Typography>
                    </div>
                  )}
                  {activation.package.messageLimit !== null && (
                    <div className="flex">
                      <FuseSvgIcon className="text-green-600" size={20}>
                        heroicons-solid:check
                      </FuseSvgIcon>
                      <Typography className="ml-2 leading-5">
                        <b>
                          {activation.package.messageLimit === 0
                            ? 'Unlimited'
                            : activation.package.messageLimit}
                        </b>{' '}
                        {activation.package.messageLimit === 1 ? 'message' : 'messages'}
                      </Typography>
                    </div>
                  )}
                  {activation.package.channelLimit !== null && (
                    <div className="flex">
                      <FuseSvgIcon className="text-green-600" size={20}>
                        heroicons-solid:check
                      </FuseSvgIcon>
                      <Typography className="ml-2 leading-5">
                        <b>
                          {activation.package.channelLimit === 0
                            ? 'Unlimited'
                            : activation.package.channelLimit}
                        </b>{' '}
                        {activation.package.channelLimit === 1 ? 'channel' : 'channels'}
                      </Typography>
                    </div>
                  )}
                </div>
              )}
            </>
          }
        />
      </ListItem>
      <Divider />
    </>
  );
};

export default ActivationListItem;
