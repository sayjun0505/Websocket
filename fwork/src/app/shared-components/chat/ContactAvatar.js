import { styled } from '@mui/material/styles';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import _ from '@lodash';
import Statuses from './Statuses';

const StyledBadge = styled(Badge)(({ theme, ...props }) => ({
  width: 40,
  height: 40,
  fontSize: 20,
  '& .MuiAvatar-root': {
    fontSize: 'inherit',
    color: theme.palette.text.secondary,
    fontWeight: 600,
  },
  '& .MuiBadge-badge': {
    backgroundColor: props.statuscolor,
    boxShadow: props.statuscolor ? `0 0 0 2px ${theme.palette.background.paper}` : 'none',
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      content: '""',
    },
  },
}));

const ContactAvatar = ({ contact, className }) => {
  const status = _.find(Statuses, { value: contact.isOnline });
  return (
    <StyledBadge
      className={className}
      overlap="circular"
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      variant="dot"
      statuscolor={status?.color}
    >
      <Avatar src={contact.pictureURL} alt={contact.display.charAt(0)} className="w-full h-full">
        {!contact.pictureURL || contact.pictureURL === '' ? contact.display.charAt(0) : ''}
      </Avatar>
    </StyledBadge>
  );
};

export default ContactAvatar;
