import { useContext, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import clsx from 'clsx';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { Chip, ClickAwayListener, ListItem, Popover, Tooltip, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/system';

import Linkify from 'react-linkify';
import format from 'date-fns/format';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import { ContactChannelAvatar } from 'app/shared-components/chat';
import { updateUnread } from '../../store/chatsSlice';
import { selectChannelById } from '../../store/channelsSlice';
import ChatAppContext from '../../ChatAppContext';

const StyledListItem = styled(ListItem)(({ theme, active }) => ({
  '&.active': {
    backgroundColor: theme.palette.background.default,
  },
  '&.label': {
    borderRadius: 6,
  },
}));

const ChatListItem = (props) => {
  const { chat } = props;
  const dispatch = useDispatch();
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const { setMainSidebarOpen } = useContext(ChatAppContext);
  const routeParams = useParams();
  const [lastMessageText, setLastMessageText] = useState('');
  const [label, setLabel] = useState([]);
  const [moreLabel, setMoreLabel] = useState([]);

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
          } else if (lastMessage.type === 'video') {
            setLastMessageText('Video');
          } else if (lastMessage.type === 'file') {
            setLastMessageText('File');
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

      // check more Label
      if (chat.customer && chat.customer.customerLabel && chat.customer.customerLabel.length > 0) {
        let labelLength = 0;
        const label1 = []; // Main Label
        const label2 = []; // More Label

        chat.customer.customerLabel.forEach(async (element, index) => {
          labelLength += element.label.length < 10 ? element.label.length : 9;

          if (
            ((isMobile && labelLength < 10) || (!isMobile && labelLength < 17)) &&
            label1.length < 3
          ) {
            label1.push(element);
          } else {
            label2.push(element);
          }
          if (index + 1 === chat.customer.customerLabel.length) {
            setLabel(label1);
            setMoreLabel(label2);
          }
        });
      }
    }
  }, [chat, isMobile]);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleMoreLabelClick = (event) => {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };
  const handleMoreLabelClose = () => {
    setAnchorEl(null);
  };

  if (!chat || !channel) {
    return null;
  }

  return (
    <StyledListItem
      className="flex items-center min-h-80 w-full px-[1rem] py-[1.2rem] !no-underline"
      active={(routeParams.id === chat.id)?'true':'false'}
      component={NavLinkAdapter}
      to={`/apps/chat/${chat.id}`}
      button
      end
      activeClassName="active"
      onClick={() => {
        if (isMobile) {
          setTimeout(() => {
            setMainSidebarOpen(false);
          }, 0);
        }
        dispatch(updateUnread({ ...chat, unread: 0 }));
      }}
    >
      <div className="flex items-center flex-row w-full space-x-12">
        <ContactChannelAvatar contact={chat.customer} channel={channel} />
        <div className="flex flex-col grow">
          <div className="flex justify-between items-center">
            <Typography
              variant="subtitle1"
              color="text.primary"
              className={clsx(
                'truncate font-semibold text-[1.4rem]',
                isMobile ? 'max-w-[20rem]' : 'max-w-[25rem]'
              )}
            >
              {chat.customer.display}
            </Typography>
            {chat.lastMessage && chat.lastMessage.createdAt && (
              <Typography className="whitespace-nowra font-medium text-12" color="text.secondary">
                {new Date().getTime() - 1 * 24 * 60 * 60 * 1000 <
                new Date(chat.lastMessage.createdAt)
                  ? format(new Date(chat.lastMessage.createdAt), 'p')
                  : format(new Date(chat.lastMessage.createdAt), 'dd/MM/yy')}
              </Typography>
            )}
          </div>
          <div className="flex justify-between">
            <Typography
              variant="body2"
              className={clsx('truncate', isMobile ? 'max-w-[20rem]' : 'max-w-[25rem]')}
              color="text.secondary"
            >
              <Linkify>{lastMessageText}</Linkify>
            </Typography>
            <div className="items-center flex flex-row space-x-6">
              {Boolean(chat.newMention) && (
                <Box
                  sx={{
                    backgroundColor: 'red',
                    color: 'secondary.contrastText',
                  }}
                  className="flex items-center justify-center min-w-20 h-20 rounded-full font-medium text-10 text-center"
                >
                  {chat.newMention && '@'}
                </Box>
              )}
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
          <div className="flex flex-row space-x-4 max-w-240 pt-4">
            <Tooltip title={channel.name} arrow>
              <Chip
                size="small"
                className="w-min my-1 rounded bg-[#6D6D6D] text-[#FFFFFF] truncate max-w-96 text-[1.2rem]"
                label={`${channel.name}`}
              />
            </Tooltip>
            {label &&
              label.length > 0 &&
              label.map((item, index) => {
                return (
                  <Chip
                    key={index}
                    size="small"
                    variant="outlined"
                    className="w-min m-1 truncate rounded w-42 text-[1.2rem]"
                    label={item.label}
                    sx={{
                      borderColor: '#8180E7',
                      color: '#8180E7',
                    }}
                  />
                );
              })}
            {moreLabel && moreLabel.length > 0 && (
              <>
                <Chip
                  id="morechatlabel-button"
                  size="small"
                  className="w-min my-1 rounded text-20 text-white bg-[#8180E7]"
                  label="+"
                  onClick={handleMoreLabelClick}
                />
                <Popover
                  id="popover-morechatlabel"
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  open={open}
                  anchorEl={anchorEl}
                  onClose={handleMoreLabelClose}
                >
                  <ClickAwayListener
                    onClickAway={() => {
                      handleMoreLabelClose();
                    }}
                  >
                    <div className="flex flex-col space-y-6 p-8">
                      {moreLabel &&
                        moreLabel.length > 0 &&
                        moreLabel.map((item, index) => {
                          return (
                            <Chip
                              key={index}
                              size="small"
                              variant="outlined"
                              className="w-min m-1 truncate rounded w-42 text-[1.2rem]"
                              label={item.label}
                              sx={{
                                borderColor: '#8180E7',
                                color: '#8180E7',
                              }}
                            />
                          );
                        })}
                    </div>
                  </ClickAwayListener>
                </Popover>
              </>
            )}
          </div>
        </div>
      </div>
    </StyledListItem>
  );
};

export default ChatListItem;
