import Typography from '@mui/material/Typography';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import format from 'date-fns/format';

const InviteCodeListItem = (props) => {
  const { invite } = props;
  return (
    <>
      <ListItem
        className="px-32 py-16 w-full "
        sx={{ bgcolor: 'background.paper' }}
        // button
        // component={NavLinkAdapter}
        // to={`/packages/${activation.id}`}
      >
        <ListItemText
          classes={{ root: 'm-0', primary: 'font-medium leading-5 truncate relative' }}
          primary={
            <>
              <Typography variant="h5" className="whitespace-nowrap mb-0">
                {invite.description}: {invite.package.name || ''}
              </Typography>

              {invite.expiration && (
                <Typography
                  className="whitespace-nowrap mb-8 font-medium text-12"
                  color="text.secondary"
                >
                  Expiration Date: {format(new Date(invite.expiration), 'PP')}
                </Typography>
              )}

              {/* Show Activation status on Top Right */}
              <div className="absolute absolute top-0 right-0 flex flex-col items-end space-y-8">
                {invite.status === 'active' && (
                  <Chip size="small" label="Active" color="success" variant="filled" />
                )}
                {invite.status === 'waitingPayment' && (
                  <Chip size="small" label="Awaiting Payment" variant="filled" />
                )}
                {invite.status === 'waitingConfirm' && (
                  <Chip size="small" label="Awaiting Confirmation" variant="filled" />
                )}
                {invite.status === 'expired' && (
                  <Chip size="small" label="Expired" color="warning" variant="filled" />
                )}
                {invite.status === 'invite' && (
                  <Chip size="small" label="Invite" color="primary" variant="filled" />
                )}

                {/* <Typography
                  className="inline"
                  component="span"
                  variant="body2"
                  color="text.secondary"
                >
                  {activation.organization}/{activation.package.organizationLimit} organizations
                </Typography> */}
              </div>

              {/* Show invite code */}
              {invite.inviteCode && (
                <Typography variant="h6" className="whitespace-nowrap mb-0">
                  Invite Code: {invite.inviteCode}
                </Typography>
              )}
            </>
          }
        />
      </ListItem>
      <Divider />
    </>
  );
};

export default InviteCodeListItem;
