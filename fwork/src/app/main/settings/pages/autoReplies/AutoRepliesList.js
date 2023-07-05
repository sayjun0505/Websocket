import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import { selectFilteredAutoReplies } from '../../store/autoRepliesSlice';
import AutoRepliesListItem from './AutoRepliesListItem';
import RepliesListItemHeader from './AutoRepliesListItemHeader';

const AutoRepliesList = (props) => {
  const filteredData = useSelector(selectFilteredAutoReplies);

  if (!filteredData) {
    return null;
  }

  if (filteredData.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center h-full">
        <Typography color="text.secondary" variant="h5">
          There are no auto reply!
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
        <RepliesListItemHeader />
        {filteredData.map((item) => (
          <AutoRepliesListItem key={item.id} reply={item} />
        ))}
      </List>
    </motion.div>
  );
};

export default AutoRepliesList;
