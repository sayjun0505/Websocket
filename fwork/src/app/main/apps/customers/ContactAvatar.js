import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import { styled } from '@mui/material/styles';

const SmallAvatar = styled(Avatar)(({ theme }) => ({
  width: 22,
  height: 22,
  border: `2px solid ${theme.palette.background.paper}`,
}));

const ContactAvatar = ({ contact, channel, className }) => {
  if (!contact) return null;
  if (!channel || !channel.channel) {
    return <Avatar src={contact.pictureURL} alt={contact.display} sx={{ width: 48, height: 48 }} />;
  }
  return (
    <Badge
      overlap="circular"
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      badgeContent={
        <>
          {channel.channel === 'line' && (
            <SmallAvatar alt={channel.channel} src="assets/images/logo/LINE.png" />
          )}
          {channel.channel === 'facebook' && (
            <SmallAvatar alt={channel.channel} src="assets/images/logo/Facebook.png" />
          )}
          {channel.channel === 'instagram' && (
            <SmallAvatar alt={channel.channel} src="assets/images/logo/Instagram.png" />
          )}
        </>
      }
    >
      <Avatar src={contact.pictureURL} alt={contact.display} sx={{ width: 48, height: 48 }} />
    </Badge>
  );
};

export default ContactAvatar;
