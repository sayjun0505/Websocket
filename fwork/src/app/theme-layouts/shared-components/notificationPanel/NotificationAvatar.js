import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import { styled } from '@mui/material/styles';

const SmallAvatar = styled(Avatar)(({ theme }) => ({
  width: 22,
  height: 22,
  border: `2px solid ${theme.palette.background.paper}`,
}));

const NotificationAvatar = ({ contact, type }) => {
  // console.log('display', contact.display);
  // console.log('@@ pictureURL', contact.pictureURL);
  // console.log('@@ type', type);
  if (type === 'teamchatNewThreadMessage') {
    return (
      <Avatar sx={{ backgroundColor: '#3578ea', width: 48, height: 48 }}>
        <FuseSvgIcon className="text-48" size={24}>
          heroicons-outline:reply
        </FuseSvgIcon>
      </Avatar>
    );
  }
  return (
    <Badge
      overlap="circular"
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      badgeContent={
        <>
          {/* Inbox */}
          {type === 'line' && <SmallAvatar alt={type} src="assets/images/logo/LINE.png" />}
          {type === 'facebook' && <SmallAvatar alt={type} src="assets/images/logo/Facebook.png" />}
          {type === 'instagram' && (
            <SmallAvatar alt={type} src="assets/images/logo/Instagram.png" />
          )}
          {type === 'inboxMention' && (
            <Box
              sx={{
                backgroundColor: '#f70776',
                width: 22,
                height: 22,
                color: 'white',
                border: `2px solid white`,
              }}
              className="flex shrink-0 items-center justify-center w-22 h-22 rounded-full"
            >
              <FuseSvgIcon className="text-48" size={12}>
                heroicons-outline:at-symbol
              </FuseSvgIcon>
            </Box>
          )}
          {type === 'inboxOwner' && (
            <Box
              sx={{
                backgroundColor: '#f70776',
                width: 22,
                height: 22,
                color: 'white',
                border: `2px solid white`,
              }}
              className="flex shrink-0 items-center justify-center w-22 h-22 rounded-full"
            >
              <FuseSvgIcon className="text-48" size={12}>
                heroicons-solid:user-add
              </FuseSvgIcon>
            </Box>
          )}
          {/* Teamchat */}
          {type === 'teamchatDirectMessage' && (
            <Box
              sx={{
                backgroundColor: '#567189',
                width: 22,
                height: 22,
                color: 'white',
                border: `2px solid white`,
              }}
              className="flex shrink-0 items-center justify-center w-22 h-22 rounded-full"
            >
              <FuseSvgIcon className="text-48" size={12}>
                heroicons-outline:chat-alt
              </FuseSvgIcon>
            </Box>
          )}
          {type === 'teamchatAddMember' && (
            <Box
              sx={{
                backgroundColor: '#3578ea',
                width: 22,
                height: 22,
                color: 'white',
                border: `2px solid white`,
              }}
              className="flex shrink-0 items-center justify-center w-22 h-22 rounded-full"
            >
              <FuseSvgIcon className="text-48" size={12}>
                heroicons-solid:user-add
              </FuseSvgIcon>
            </Box>
          )}
          {type === 'teamchatMessage' && (
            <Box
              sx={{
                backgroundColor: '#3578ea',
                width: 22,
                height: 22,
                color: 'white',
                border: `2px solid white`,
              }}
              className="flex shrink-0 items-center justify-center w-22 h-22 rounded-full"
            >
              <FuseSvgIcon className="text-48" size={12}>
                heroicons-outline:chat-alt
              </FuseSvgIcon>
            </Box>
          )}
          {type === 'teamchatMention' && (
            <Box
              sx={{
                backgroundColor: '#3578ea',
                width: 22,
                height: 22,
                color: 'white',
                border: `2px solid white`,
              }}
              className="flex shrink-0 items-center justify-center w-22 h-22 rounded-full"
            >
              <FuseSvgIcon className="text-48" size={12}>
                heroicons-outline:at-symbol
              </FuseSvgIcon>
            </Box>
          )}
          {type === 'teamchatReplyMessage' && (
            <Box
              sx={{
                backgroundColor: '#3578ea',
                width: 22,
                height: 22,
                color: 'white',
                border: `2px solid white`,
              }}
              className="flex shrink-0 items-center justify-center w-22 h-22 rounded-full"
            >
              <FuseSvgIcon className="text-48" size={12}>
                heroicons-outline:reply
              </FuseSvgIcon>
            </Box>
          )}
          {type === 'teamchatNewThread' && (
            <Box
              sx={{
                backgroundColor: '#3578ea',
                width: 22,
                height: 22,
                color: 'white',
                border: `2px solid white`,
              }}
              className="flex shrink-0 items-center justify-center w-22 h-22 rounded-full"
            >
              <FuseSvgIcon className="text-48" size={12}>
                heroicons-outline:reply
              </FuseSvgIcon>
            </Box>
          )}
          {type === 'teamchatNewThreadMessage' && (
            <Box
              sx={{
                backgroundColor: '#3578ea',
                width: 22,
                height: 22,
                color: 'white',
                border: `2px solid white`,
              }}
              className="flex shrink-0 items-center justify-center w-22 h-22 rounded-full"
            >
              <FuseSvgIcon className="text-48" size={12}>
                heroicons-outline:reply
              </FuseSvgIcon>
            </Box>
          )}
          {/* Kanbanboard */}
          {type === 'cardDueDate' && (
            <Box
              sx={{
                backgroundColor: '#ff9b63',
                width: 22,
                height: 22,
                color: 'white',
                border: `2px solid white`,
              }}
              className="flex shrink-0 items-center justify-center w-22 h-22 rounded-full"
            >
              <FuseSvgIcon className="text-48" size={12}>
                heroicons-outline:view-boards
              </FuseSvgIcon>
            </Box>
          )}
          {type === 'cardAddMember' && (
            <Box
              sx={{
                backgroundColor: '#ff9b63',
                width: 22,
                height: 22,
                color: 'white',
                border: `2px solid white`,
              }}
              className="flex shrink-0 items-center justify-center w-22 h-22 rounded-full"
            >
              <FuseSvgIcon className="text-48" size={12}>
                heroicons-solid:user-add
              </FuseSvgIcon>
            </Box>
          )}
          {type === 'cardMention' && (
            <Box
              sx={{
                backgroundColor: '#ff9b63',
                width: 22,
                height: 22,
                color: 'white',
                border: `2px solid white`,
              }}
              className="flex shrink-0 items-center justify-center w-22 h-22 rounded-full"
            >
              <FuseSvgIcon className="text-48" size={12}>
                heroicons-outline:at-symbol
              </FuseSvgIcon>
            </Box>
          )}
        </>
      }
    >
      <Avatar src={contact.pictureURL} alt={contact.display} sx={{ width: 48, height: 48 }} />
    </Badge>
  );
};

export default NotificationAvatar;
