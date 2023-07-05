import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import { selectFilteredUsers, selectGroupedFilteredUsers } from './store/usersSlice';
import UserListItem from './UserListItem';

function UsersList(props) {
  const filteredData = useSelector(selectFilteredUsers);
  const groupedFilteredUsers = useSelector(selectGroupedFilteredUsers);

  if (!filteredData) {
    return null;
  }

  if (filteredData.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center h-full">
        <Typography color="text.secondary" variant="h5">
          There are no users!
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
      {Object.entries(groupedFilteredUsers).map(([key, group]) => {
        return (
          <div key={key} className="relative">
            <Typography color="text.secondary" className="px-32 py-4 text-14 font-medium">
              {key}
            </Typography>
            <Divider />
            <List className="w-full m-0 p-0">
              {group.children.map((item) => (
                <UserListItem key={item.id} user={item} />
              ))}
            </List>
          </div>
        );
      })}
    </motion.div>
  );
}

export default UsersList;
