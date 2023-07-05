import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import { getInviteCode, selectInviteCode } from '../store/inviteCodeSlice';
import InviteCodeListItem from './InviteCodeListItem';

const InviteCodeList = (props) => {
  const dispatch = useDispatch();
  const inviteCode = useSelector(selectInviteCode);

  useEffect(() => {
    dispatch(getInviteCode());
  }, []);

  if (!inviteCode) {
    return null;
  }

  if (inviteCode.length && inviteCode.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center h-full">
        <Typography color="text.secondary" variant="h5">
          There are no Invite Code!
        </Typography>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
      className="flex flex-col flex-auto w-full max-h-full items-center"
    >
      <List className="w-full m-0 p-0">
        {inviteCode.map((item) => (
          <InviteCodeListItem key={item.id} invite={item} />
        ))}
      </List>
    </motion.div>
  );
};

export default InviteCodeList;
