import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import clsx from 'clsx';
import { ListItem, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/system';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';

import Linkify from 'react-linkify';
import format from 'date-fns/format';

import { ContactChannelAvatar } from 'app/shared-components/chat';
import { updateUnread } from '../../chat/store/chatsSlice';
import { selectChannelById } from '../../chat/store/channelsSlice';

const StyledListItem = styled(ListItem)(({ theme, active }) => ({
  '&.active': {
    backgroundColor: theme.palette.background.default,
  },
  '&.label': {
    borderRadius: 6,
  },
}));

const ChatList = (props) => {
  const { chat } = props;
  const dispatch = useDispatch();
  const routeParams = useParams();
  const [lastMessageText, setLastMessageText] = useState('');
  const channel = useSelector((state) => selectChannelById(state, chat.channelId));

  useMemo(() => {
    if (chat) {
      // Convert lastMessage to Text
      if (chat.lastMessage) {
        const { lastMessage } = chat;
        if (!lastMessage.isDelete && lastMessage.data && lastMessage.data !== '') {
          const lastMsgObj = JSON.parse(lastMessage.data);
          if (lastMessage.type === 'text') {
            const { text } = lastMsgObj;
            if (text.length > 30) {
              setLastMessageText(`${text.substring(0, 30)}...`);
            } else {
              setLastMessageText(text.substring(0, 30));
            }
          } else if (lastMessage.type === 'sticker') {
            setLastMessageText('Sticker');
          } else if (lastMessage.type === 'image') {
            setLastMessageText('Image');
          } else if (lastMessage.type === 'story') {
            setLastMessageText('Reacted to your story');
          } else if (lastMessage.type === 'story_mention') {
            setLastMessageText('Mention you in a story');
          } else {
            setLastMessageText('Unknown type');
          }
        } else {
          setLastMessageText('This message has been deleted...');
        }
      }
    }
  }, [chat]);

  if (!chat || !channel) {
    return null;
  }

  return (
    <StyledListItem
      button
      className="flex items-center max-h-80 w-full"
      active={routeParams.id === chat.id ? 1 : 0}
      component={NavLinkAdapter}
      to={`/apps/chat/${chat.id}`}
      end
      activeClassName="active"
      onClick={() => {
        dispatch(updateUnread({ ...chat, unread: 0 }));
      }}
    >
      <div className="flex items-center flex-row w-full space-x-12 px-[1.5rem] min-h-[7rem] border-1 border-[#F5F5F5] shadow rounded-sm">
        <ContactChannelAvatar contact={chat.customer} channel={channel} />
        <div className="flex flex-col grow">
          <div className="flex justify-between items-center">
            <Typography
              variant="subtitle1"
              color="text.primary"
              className={clsx('truncate font-semibold text-14')}
            >
              {chat.customer?.display}
            </Typography>
            {chat.lastMessage && chat.lastMessage.createdAt && (
              <Typography className="whitespace-nowra font-medium text-12" color="text.secondary">
                {format(new Date(chat.lastMessage.createdAt), 'dd/MM/yy')}
              </Typography>
            )}
          </div>
          <div className="flex justify-between pt-10">
            <Typography variant="body2" className="truncate" color="text.secondary">
              <Linkify>{lastMessageText}</Linkify>
            </Typography>
            <div className="items-center flex flex-row space-x-6">
              {Boolean(chat.unread) && (
                <Box
                  sx={{
                    backgroundColor: 'secondary.main',
                    color: 'secondary.contrastText',
                  }}
                  className="flex items-center justify-center min-w-20 h-20 rounded-full font-medium text-10 text-center"
                >
                  {chat.unread}
                </Box>
              )}
            </div>
          </div>
        </div>
      </div>
    </StyledListItem>
  );
};

export default ChatList;
