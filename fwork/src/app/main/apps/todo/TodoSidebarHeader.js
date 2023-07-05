import { useDispatch, useSelector } from 'react-redux';
import Icon from '@mui/material/Icon';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

import { selectUsers } from '../users/store/usersSlice';

const TodoSidebarHeader = ({ selectedAccount, setSelectedCount }) => {
  const dispatch = useDispatch();
  const currentUser = useSelector(({ user }) => user.data);
  const accounts = useSelector(selectUsers);

  useEffect(() => {
    setSelectedCount(accounts.find((element) => element.user.email === currentUser.email).user.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, accounts]);

  function handleAccountChange(ev) {
    setSelectedCount(ev.target.value);
  }

  return (
    <div className="flex flex-col justify-center h-full p-24">
      <div className="flex items-center flex-1">
        <Icon
          component={motion.span}
          initial={{ scale: 0 }}
          animate={{ scale: 1, transition: { delay: 0.2 } }}
          className="text-24 md:text-32"
        >
          check_box
        </Icon>
        <Typography
          component={motion.span}
          initial={{ x: -20 }}
          animate={{ x: 0, transition: { delay: 0.2 } }}
          delay={300}
          className="text-16 md:text-24 mx-12 font-semibold"
        >
          To-Do
        </Typography>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0.8 }}
        animate={{ y: 0, opacity: 1, transition: { delay: 0.3 } }}
      >
        <TextField
          id="account-selection"
          sx={{ width: '-webkit-fill-available' }}
          select
          label={accounts.find((element) => element.user.id === selectedAccount)?.user?.display}
          value={selectedAccount}
          onChange={handleAccountChange}
          placeholder="Select Account"
          margin="normal"
          variant="filled"
        >
          {accounts.map((account, value) => (
            <MenuItem key={account.user.id} value={account.user.id}>
              {account.user.email}
            </MenuItem>
          ))}
        </TextField>
      </motion.div>
    </div>
  );
};

export default TodoSidebarHeader;
