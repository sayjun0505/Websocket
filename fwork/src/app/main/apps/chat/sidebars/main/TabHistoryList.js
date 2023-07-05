import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import FuseLoading from '@fuse/core/FuseLoading';
import FuseUtils from '@fuse/utils';
import { AppBar, Box, Input, List, Paper, Toolbar } from '@mui/material';
import { lighten } from '@mui/material/styles';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { motion } from 'framer-motion';

import { getHistories, selectHistories } from '../../store/historiesSlice';
import HistoryListItem from './HistoryListItem';
import ChatAppContext from '../../ChatAppContext';
import { useNotification } from '../../../../../notification/NotificationContext';

const container = {
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const TabHistoryList = (props) => {
  const dispatch = useDispatch();
  const { eventUpdate, tabHasFocus } = useNotification(ChatAppContext);
  const histories = useSelector(selectHistories);

  const [statusMenuEl, setStatusMenuEl] = useState(null);
  const [moreMenuEl, setMoreMenuEl] = useState(null);

  useEffect(() => {
    dispatch(getHistories());
  }, [dispatch]);

  useEffect(() => {
    if (eventUpdate && eventUpdate < new Date()) {
      dispatch(getHistories());
    }
  }, [dispatch, eventUpdate]);

  useEffect(() => {
    if (tabHasFocus) {
      dispatch(getHistories());
    }
  }, [dispatch, tabHasFocus]);

  const [searchText, setSearchText] = useState('');

  function handleSearchText(event) {
    setSearchText(event.target.value);
  }

  return (
    <>
      <AppBar position="static" color="default" elevation={0}>
        <Box
          className="pt-16 border-b-1 h-72"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? lighten(theme.palette.background.default, 0.4)
                : lighten(theme.palette.background.default, 0.02),
          }}
        >
          <Toolbar className="flex flex-col space-y-8">
            {useMemo(
              () => (
                <Paper className="flex p-4 items-center w-full px-16 py-4 border-1 h-40 rounded-full shadow-none">
                  <FuseSvgIcon color="action" size={20}>
                    heroicons-solid:search
                  </FuseSvgIcon>

                  <Input
                    placeholder="Search customer"
                    className="flex flex-1 px-8"
                    disableUnderline
                    fullWidth
                    value={searchText}
                    inputProps={{
                      'aria-label': 'Search',
                    }}
                    onChange={handleSearchText}
                  />
                </Paper>
              ),
              [searchText]
            )}
          </Toolbar>
        </Box>
      </AppBar>
      <List className="w-full p-0 overflow-hidden">
        {useMemo(() => {
          function getFilteredArray(arr, _searchText) {
            if (_searchText.length === 0) {
              return arr;
            }
            return FuseUtils.filterArrayByString(arr, _searchText);
          }
          const filteredHistoryList = getFilteredArray([...histories], searchText);

          return (
            <motion.div
              className="flex flex-col flex-shrink-0 w-full"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {filteredHistoryList.map((history, index) => (
                <motion.div variants={item} key={index}>
                  <HistoryListItem history={history} />
                </motion.div>
              ))}
            </motion.div>
          );
        }, [histories, searchText])}
      </List>
    </>
  );
};

export default TabHistoryList;
