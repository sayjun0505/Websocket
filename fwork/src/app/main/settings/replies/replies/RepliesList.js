import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import { selectFilteredReplies } from '../store/repliesSlice';
import RepliesListItem from './RepliesListItem';

function RepliesList(props) {
  const filteredData = useSelector(selectFilteredReplies);

  if (!filteredData) {
    return null;
  }

  if (filteredData.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center h-full">
        <Typography color="text.secondary" variant="h5">
          There are no replies!
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
          <RepliesListItem key={item.id} reply={item} />
        ))}
      </List>
    </motion.div>
  );
}

export default RepliesList;
