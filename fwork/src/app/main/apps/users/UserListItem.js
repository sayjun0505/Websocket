import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';

const UserListItem = (props) => {
  const { user } = props;
  // console.log('[UserListItem] ', user);

  return (
    <>
      <ListItem
        className="px-32 py-16"
        sx={{ bgcolor: 'background.paper' }}
        button
        component={NavLinkAdapter}
        to={`/settings/users/${user.user.id}`}
      >
        <ListItemAvatar>
          <Avatar
            src={user.user.avatar || user.user.pictureURL || user.user.pictureURL}
            alt={user.user.display}
          >
            {user.user.display.charAt(0)}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          classes={{ root: 'm-0', primary: 'font-medium leading-5 truncate' }}
          primary={`${user.user.firstname} ${user.user.lastname}`}
          secondary={
            <Typography
              className="inline capitalize"
              component="span"
              variant="body2"
              color="text.secondary"
            >
              {user.role}
            </Typography>
          }
        />
      </ListItem>
      <Divider />
    </>
  );
};

export default UserListItem;
