import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import { selectFilteredChannels } from './store/channelsSlice';
import ChannelSettingListItem from './ChannelSettingListItem';

const ChannelsSettingList = (props) => {
  const filteredData = useSelector(selectFilteredChannels);

  if (!filteredData) {
    return null;
  }

  if (filteredData.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center h-full flex-col">
        <Typography color="text.secondary" variant="h5">
          No channels have connected
        </Typography>

        <Typography color="text.secondary" variant="body2">
          You can connect all your business messaging
        </Typography>
        <Typography color="text.secondary" variant="body2">
          accounts in one place. Let's connect a channel.
        </Typography>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
      className="flex flex-col flex-auto w-full max-h-full"
    >
      <List className="w-full m-0 p-0">
        {filteredData.map((item) => (
          <ChannelSettingListItem key={item.id} channel={item} />
        ))}
      </List>
    </motion.div>
  );
};

export default ChannelsSettingList;
