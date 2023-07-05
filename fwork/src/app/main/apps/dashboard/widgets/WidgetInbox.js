/* eslint-disable array-callback-return */
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Divider, List, Paper, Typography } from '@mui/material';

import { getChats } from '../../chat/store/chatsSlice';
import ChatList from './ChatList';
import { getChannels } from '../../chat/store/channelsSlice';

const WidgetInbox = (props) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [chats, setChats] = useState([]);

  useEffect(() => {
    dispatch(getChannels());
    dispatch(getChats({}))
      .unwrap()
      .then((payload) => {
        setIsLoading(false);
        setChats(payload.slice(0, 5));
      });
  }, []);

  if (!chats || isLoading) {
    return null;
  }

  return (
    <Paper className="w-full rounded-xl shadow flex flex-col justify-between max-w-full">
      <div className="flex items-end justify-start py-10">
        <Typography className="text-16 pl-16 font-medium" color="textSecondary">
          Inbox
        </Typography>
        <Typography className="text-12 font-medium pl-10 text-gray-500">(Recent Chats)</Typography>
      </div>
      <Divider className="border-[#E5E5E5]" />
      <List className="w-full min-h-[42rem]">
        {chats &&
          chats.map((chat, i) => {
            return <ChatList key={i} chat={chat} />;
          })}
      </List>
    </Paper>
  );
};

export default WidgetInbox;
