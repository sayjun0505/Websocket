import { useContext } from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import ChannelsContext from './ChannelsContext';

const ChannelSettingListItem = (props) => {
  const { channel } = props;
  const { setRightSidebarOpen, rightSidebarOpen } = useContext(ChannelsContext);

  if (!channel) return null;
  return (
    <>
      <ListItem
        className="px-32 py-16"
        sx={{ bgcolor: 'background.paper' }}
        button
        component={NavLinkAdapter}
        to={`/settings/channels/${channel.channel}/${channel.id}`}
        onClick={() => {
          setRightSidebarOpen(true);
        }}
      >
        <ListItemText
          classes={{ root: 'm-0', primary: 'font-medium leading-5 truncate' }}
          primary={channel.data.name}
          secondary={
            <Typography
              className="inline capitalize"
              component="span"
              variant="body2"
              color="text.secondary"
            >
              {channel.channel}
            </Typography>
          }
        />
      </ListItem>
      <Divider />
    </>
  );
};

export default ChannelSettingListItem;
