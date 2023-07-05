/* eslint-disable jsx-a11y/media-has-caption */
import FuseLoading from '@fuse/core/FuseLoading';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';

import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  InputBase,
  Paper,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { lighten, styled } from '@mui/material/styles';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

import { useContext, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Twemoji } from 'react-emoji-render';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import clsx from 'clsx';
import Linkify from 'react-linkify';

import { ContactChannelAvatar } from 'app/shared-components/chat';
import QuickReplyMenu from './QuickReplyMenu';
import PreviewConfirm from './previews/PreviewConfirm';
import PreviewButtons from './previews/PreviewButtons';
import PreviewCarousel from './previews/PreviewCarousel';
import ChatMoreMenu from './ChatMoreMenu';
import ChatAppContext from '../ChatAppContext';
import { useNotification } from '../../../../notification/NotificationContext';
import { getChatsinTabforSocket } from '../store/chatsSlice';
import { getChat, getChatinChatforSocket, selectChat, sendFileMessage, sendMessageinChatforSocket, sendMessage } from '../store/chatSlice';
import { selectChannelById } from '../store/channelsSlice';
import { addSendingMessage, getMessages, getMessagesforSocket, selectMessages } from '../store/messagesSlice';
import { SocketContext } from '../../../../context/socket';
const StyledMessageRow = styled('div')(({ theme }) => ({
  '&.contact': {
    '& .bubble': {
      backgroundColor: '#64748B',
      // backgroundColor: theme.palette.secondary.light,
      color: theme.palette.secondary.contrastText,
      borderTopLeftRadius: 5,
      borderBottomLeftRadius: 5,
      borderTopRightRadius: 20,
      borderBottomRightRadius: 20,
      '& .time': {
        marginLeft: 12,
      },
    },
    '&.first-of-group': {
      '& .bubble': {
        borderTopLeftRadius: 20,
      },
    },
    '&.last-of-group': {
      '& .bubble': {
        borderBottomLeftRadius: 20,
      },
    },
  },
  '&.me': {
    paddingLeft: 40,

    '& .bubble': {
      marginLeft: 'auto',
      backgroundColor: '#2559C7',
      // backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.contrastText,
      borderTopLeftRadius: 20,
      borderBottomLeftRadius: 20,
      borderTopRightRadius: 5,
      borderBottomRightRadius: 5,
      '& .time': {
        justifyContent: 'flex-end',
        right: 0,
        marginRight: 12,
      },
    },
    '&.first-of-group': {
      '& .bubble': {
        borderTopRightRadius: 20,
      },
    },

    '&.last-of-group': {
      '& .bubble': {
        borderBottomRightRadius: 20,
      },
    },
  },
  '&.contact + .me, &.me + .contact': {
    paddingTop: 20,
    marginTop: 20,
  },
  '&.first-of-group': {
    '& .bubble': {
      borderTopLeftRadius: 20,
      paddingTop: 13,
    },
    marginTop: 10,
  },
  '&.last-of-group': {
    '& .bubble': {
      borderBottomLeftRadius: 20,
      paddingBottom: 13,
      '& .time': {
        display: 'flex',
      },
    },
    marginBottom: 20,
  },
}));

const Chat = (props) => {
  const { setMainSidebarOpen, handleCustomerSidebarOpen } = useContext(ChatAppContext);
  const { eventUpdate, tabHasFocus } = useNotification();
  const dispatch = useDispatch();
  const routeParams = useParams();
  const { mode, id: chatId } = routeParams;

  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const chat = useSelector(selectChat);
  const messages = useSelector(selectMessages);
  const channel = useSelector((state) => selectChannelById(state, chat?.channelId));
  const chatRef = useRef(null);
  const [messageText, setMessageText] = useState('');
  const [fileLoading, setFileLoading] = useState(false);
  const organization = window.localStorage.getItem('organization');
  const user = useSelector(state => { return state.user });
  const socket = useContext(SocketContext);
  const params1 = {
    orgId: JSON.parse(organization).organizationId,
    type: 'active',
    label: '',
    reqid: user.uuid,
    page: '',
    size: ''
  }
  useEffect(() => {
    socket.on("getMessagesinChat response", res => {
      dispatch(getMessagesforSocket(res.data))
    })
    socket.on("getChatinChat response", res => {
      dispatch(getChatinChatforSocket(res))
    })
    socket.on("sendMessageinChat response", res => {
      setMessageText('')
      dispatch(sendMessageinChatforSocket(res.send))
      dispatch(getChatsinTabforSocket(res.get.data))
      scrollToBottom();
    });
  }, [socket])

  useEffect(() => {
    if (chatId) {
      let params = {
        page: 0,
        size: 0,
        chatId: chatId,
        reqid: user.uuid,
        orgId: JSON.parse(organization).organizationId
      }
      socket.emit("getChatinChat", params)
    }
  }, [chatId, dispatch]);

  useEffect(() => {
    if ((eventUpdate && eventUpdate < new Date() && chatId) || (tabHasFocus && chatId)) {
      let params = {
        page: 0,
        size: 0,
        chatId: chatId,
        reqid: user.uuid,
        orgId: JSON.parse(organization).organizationId
      }
      socket.emit("getMessagesinChat", params)
    }
  }, [chatId, dispatch, eventUpdate, tabHasFocus]);

  const onImgLoaded = () => {
    scrollToBottom();
  };
  function scrollToBottom() {
    if (!chatRef.current) {
      return;
    }
    chatRef.current.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }

  function isFirstMessageOfGroup(item, i) {
    return (
      i === 0 ||
      (messages[i - 1] && messages[i - 1].direction !== item.direction) ||
      (item.direction === 'outbound' &&
        messages[i - 1].createdBy?.display !== messages[i].createdBy?.display)
    );
  }
  function isLastMessageOfGroup(item, i) {
    return (
      i === messages.length - 1 ||
      (messages[i + 1] && messages[i + 1].direction !== item.direction) ||
      (item.direction === 'outbound' &&
        messages[i].createdBy?.display !== messages[i + 1].createdBy?.display)
    );
  }

  function onInputChange(ev) {
    setMessageText(ev.target.value);
  }

  function onEnterPress(e) {
    if (e.keyCode === 13 && e.shiftKey === false) {
      e.preventDefault();
      onMessageSubmit(e);
    }
  }
  function onMessageSubmit(ev) {
    ev.preventDefault();
    if (messageText === '') {
      return;
    }
    const message = messageText;
    setMessageText('');
    dispatch(
      addSendingMessage({
        id: '',
        data: JSON.stringify({ text: message }),
        type: 'text',
        timestamp: new Date(),
        isError: false,
        isRead: false,
        direction: 'outbound',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );
    let msgdata = {
      orgId: JSON.parse(organization).organizationId,
      reqid: user.uuid,
      chatId: chatId,
      message: {
        data: JSON.stringify({ text: messageText }),
        type: 'text',
      },
      page: '',
      size: '',
      type: 'active',
      label: '',
    }
    socket.emit("sendMessageinChat", msgdata)
  }
  const handleFileInput = (event) => {
    setFileLoading(true);
    const formData = new FormData();
    formData.append('file', event.target.files[0]);
    dispatch(sendFileMessage({ formData, chat })).then(() => {
      setTimeout(() => {
        setFileLoading(false);
      }, 5000);
    });
  };

  if (!chat || !chat.customerId || !channel) {
    return (
      <div className="flex w-full h-full items-center">
        <FuseLoading />
      </div>
    );
  }

  return (
    <>
      <Box
        className="w-full border-b-1"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? lighten(theme.palette.background.default, 0.4)
              : lighten(theme.palette.background.default, 0.02),
        }}
      >
        <Toolbar className="p-12 w-full">
          <div className="flex flex-col w-full space-y-12">
            <div className="flex w-full">
              <div className="flex-none">
                {isMobile ? (
                  <IconButton
                    aria-label="Open drawer"
                    onClick={() => setMainSidebarOpen(true)}
                    className="flex"
                    size="large"
                  >
                    <FuseSvgIcon>heroicons-outline:chat</FuseSvgIcon>
                  </IconButton>
                ) : null}
              </div>

              <div
                className="grow flex flex-row items-center overflow-hidden"
                onClick={handleCustomerSidebarOpen}
                onKeyDown={handleCustomerSidebarOpen}
                role="button"
                tabIndex={0}
              >
                {chat.customer && channel ? (
                  <ContactChannelAvatar contact={chat.customer} channel={channel} />
                ) : null}
                <div className="flex flex-col px-8 truncate">
                  <Typography
                    color="inherit"
                    className="text-16 font-semibold truncate"
                    component="span"
                  >
                    {chat.customer.display}
                  </Typography>
                  {channel ? (
                    <Tooltip title={channel.name} arrow>
                      <Chip
                        size="small"
                        className="w-min my-1 rounded bg-[#6D6D6D] text-[#FFFFFF]"
                        label={`${channel.name}`}
                      />
                    </Tooltip>
                  ) : null}
                </div>
              </div>
              <div className="flex-none">
                <ChatMoreMenu className="flex-none mx-8" chat={chat} />
              </div>
            </div>
          </div>
        </Toolbar>
      </Box>

      <div className="flex flex-auto h-full min-h-0 w-full">
        <div className={clsx('flex flex-1 z-10 flex-col relative w-full', props.className)}>
          <FuseScrollbars ref={chatRef} className="flex flex-1 flex-col overflow-y-auto">
            {messages && messages.length > 0 ? (
              <div className="flex flex-col pt-16 px-16 pb-40 ">
                {messages.map((item, i) => {
                  if (item.isDelete || !item.data || item.data === '') {
                    return (
                      <StyledMessageRow
                        id={item.id}
                        key={i}
                        className={clsx(
                          'flex flex-col grow-0 shrink-0 justify-end relative px-16 w-full',
                          { 'pt-24': isFirstMessageOfGroup(item, i) },
                          i + 1 === messages.length && 'pb-96',
                          item.direction === 'outbound' && 'items-end',
                          item.direction === 'inbound' && 'items-start'
                        )}
                      >
                        <div className="flex rounded-full border-2 border-solid p-12 items-center justify-center max-w-[90%]">
                          <span className="break-words whitespace-pre-wrap max-w-full ">
                            This message has been deleted...
                          </span>
                        </div>
                      </StyledMessageRow>
                    );
                  }
                  const messageObj = JSON.parse(item.data);

                  return (
                    <StyledMessageRow
                      key={i}
                      className={clsx(
                        'flex flex-col grow-0 shrink-0 items-start justify-end relative px-16 max-w-[950px] left-1/2 -translate-x-1/2',
                        { me: item.direction === 'outbound' },
                        { contact: item.direction === 'inbound' },
                        { 'first-of-group': isFirstMessageOfGroup(item, i) },
                        { 'last-of-group': isLastMessageOfGroup(item, i) },
                        i + 1 === messages.length ? 'pb-96' : ' pb-4'
                      )}
                    >
                      <div
                        className={clsx(
                          'flex flex-row space-x-14 items-baseline',
                          item.direction === 'outbound' && ' ml-auto'
                        )}
                      >
                        {item.reaction && item.reaction.emoji ? (
                          <div className=" flex w-32 h-32 items-center justify-center rounded-full bg-gray-200  mt-10 mb-4 ">
                            <Twemoji svg text={item.reaction.emoji} />
                          </div>
                        ) : null}
                        {item.replyTo && item.replyTo.data ? (
                          <div className=" flex space-x-12 items-end p-6 rounded-lg border-2 border-solid mt-10 mb-4">
                            {item.replyTo.type === 'text' && (
                              <Linkify
                                componentDecorator={(decoratedHref, decoratedText, key) => (
                                  <a
                                    target="blank"
                                    href={decoratedHref}
                                    key={key}
                                    className="!text-cyan-400"
                                  >
                                    {decoratedText}
                                  </a>
                                )}
                              >
                                <span className="break-words whitespace-pre-wrap max-w-full">
                                  {JSON.parse(item.replyTo.data).text}
                                </span>
                              </Linkify>
                            )}
                            {(item.replyTo.type === 'story' ||
                              item.replyTo.type === 'story_mention' ||
                              item.replyTo.type === 'image' ||
                              item.replyTo.type === 'video') && (
                                <div className="flex flex-col">
                                  {(item.replyTo.type === 'story' ||
                                    item.replyTo.type === 'story_mention') && (
                                      <Typography variant="caption" color="GrayText">
                                        Reply to story
                                      </Typography>
                                    )}
                                  <video
                                    width="320"
                                    height="auto"
                                    muted
                                    controls
                                    preload="auto"
                                    src={messageObj.url}
                                  />
                                </div>
                              )}
                            {(item.replyTo.type === 'story_image' ||
                              item.replyTo.type === 'story_image_mention' ||
                              item.replyTo.type === 'image') && (
                                <div className="flex flex-col">
                                  {(item.replyTo.type === 'story_image' ||
                                    item.replyTo.type === 'story_image_mention') && (
                                      <Typography variant="caption" color="GrayText">
                                        Reply to story
                                      </Typography>
                                    )}
                                  <img
                                    src={JSON.parse(item.replyTo.data).url}
                                    alt={JSON.parse(item.replyTo.data).id}
                                    className="h-auto max-h-xs"
                                    onLoad={onImgLoaded}
                                  />
                                </div>
                              )}
                            {(item.replyTo.type === 'story_video' ||
                              item.replyTo.type === 'story_video_mention' ||
                              item.replyTo.type === 'video') && (
                                <div className="flex flex-col">
                                  {(item.replyTo.type === 'story_video' ||
                                    item.replyTo.type === 'story_video_mention') && (
                                      <Typography variant="caption" color="GrayText">
                                        Reply to story
                                      </Typography>
                                    )}
                                  <video
                                    width="320"
                                    height="auto"
                                    controls
                                    preload="auto"
                                    src={JSON.parse(item.replyTo.data).url}
                                  />
                                </div>
                              )}

                            <FuseSvgIcon className="text-48" size={14} color="action">
                              heroicons-solid:reply
                            </FuseSvgIcon>
                          </div>
                        ) : null}
                        {item.type &&
                          (item.type === 'story_image_mention' ||
                            item.type === 'story_video_mention' ||
                            item.type === 'story_mention') ? (
                          <div className=" flex space-x-12 items-baseline p-6 rounded-lg border-2 border-solid  mt-10 mb-4">
                            <span className="break-words whitespace-pre-wrap max-w-full">
                              Mentioned you in their story
                            </span>
                          </div>
                        ) : null}
                      </div>
                      <div className="bubble flex flex-col relative items-center justify-center p-12 shadow max-w-[90%]">
                        {item.type && item.type === 'story_mention' && (
                          <video
                            width="320"
                            height="auto"
                            muted
                            preload="auto"
                            src={messageObj.url}
                          />
                        )}
                        {item.type && item.type === 'story_image_mention' && (
                          <img
                            src={messageObj.url}
                            alt={messageObj.id}
                            className="h-auto max-h-xs"
                            onLoad={onImgLoaded}
                          />
                        )}
                        {item.type && item.type === 'story_video_mention' && (
                          <video
                            width="320"
                            height="auto"
                            controls
                            preload="auto"
                            src={messageObj.url}
                          />
                        )}
                        {item.type && item.type === 'image' && (
                          <img
                            src={messageObj.url}
                            alt={messageObj.id}
                            className="h-auto max-h-xs"
                            onLoad={onImgLoaded}
                          />
                        )}
                        {item.type && item.type === 'video' && (
                          <video
                            width="320"
                            height="auto"
                            muted
                            controls
                            preload="auto"
                            src={messageObj.url}
                          />
                        )}
                        {item.type && item.type === 'sticker' && (
                          <img
                            src={messageObj.url}
                            alt="Sticker"
                            className="h-auto max-h-xs"
                            onLoad={onImgLoaded}
                          />
                        )}
                        {item.type && item.type === 'text' && (
                          <Linkify
                            componentDecorator={(decoratedHref, decoratedText, key) => (
                              <a
                                target="blank"
                                href={decoratedHref}
                                key={key}
                                className="!text-cyan-400"
                              >
                                {decoratedText}
                              </a>
                            )}
                          >
                            <span className="break-words whitespace-pre-wrap max-w-full">
                              {messageObj.text}
                            </span>
                          </Linkify>
                        )}

                        {item.type && item.type === 'confirm' && (
                          <PreviewConfirm template={messageObj.confirm} />
                        )}

                        {item.type && item.type === 'buttons' && (
                          <PreviewButtons template={messageObj.buttons} />
                        )}

                        {item.type && item.type === 'carousel' && (
                          <PreviewCarousel template={messageObj.carousel} />
                        )}

                        {item.type && item.type === 'flex' && (
                          <div className=" break-all">This is a flex template message</div>
                        )}

                        <Typography
                          component="span"
                          className="time absolute hidden w-full text-11 mt-8 -mb-24 ltr:left-0 rtl:right-0 bottom-0 whitespace-nowrap"
                          color="textSecondary"
                        >
                          {item.direction === 'outbound' && item.createdBy ? (
                            <b>{item.createdBy.display}&nbsp;&nbsp;</b>
                          ) : null}
                          {item.createdAt
                            ? formatDistanceToNow(new Date(item.createdAt), {
                              addSuffix: false,
                            })
                            : null}
                        </Typography>
                      </div>
                    </StyledMessageRow>
                  );
                })}
              </div>
            ) : null}
          </FuseScrollbars>
          {chat && chat.status && chat.status !== 'resolved' ? (
            <Paper
              square
              component="form"
              autoComplete="off"
              onSubmit={onMessageSubmit}
              className="absolute border-t-1 bottom-0 right-0 left-0 py-16 px-16"
              sx={{
                backgroundColor: (theme) =>
                  theme.palette.mode === 'light'
                    ? lighten(theme.palette.background.default, 0.4)
                    : lighten(theme.palette.background.default, 0.02),
              }}
            >
              <div className="flex items-center relative max-w-[950px] left-1/2 -translate-x-1/2">
                <QuickReplyMenu channel={channel.channel} />

                {fileLoading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : (
                  <IconButton size="large" component="label">
                    <input
                      hidden
                      accept="image/gif, image/png, image/jpeg, video/mp4"
                      onChange={handleFileInput}
                      type="file"
                    />
                    <FuseSvgIcon>heroicons-outline:paper-clip</FuseSvgIcon>
                  </IconButton>
                )}

                <InputBase
                  multiline
                  maxRows={4}
                  autoFocus
                  id="message-input"
                  className="flex-1 flex grow shrink-0 mx-8 px-16 border-2 rounded-xl max-w-full"
                  fullWidth
                  placeholder="Type your message"
                  onChange={onInputChange}
                  value={messageText}
                  sx={{ backgroundColor: 'background.paper' }}
                  onKeyDown={onEnterPress}
                />
                <IconButton className="" onClick={onMessageSubmit} size="large">
                  <FuseSvgIcon className="rotate-90" color="action">
                    heroicons-outline:paper-airplane
                  </FuseSvgIcon>
                </IconButton>
              </div>
            </Paper>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default Chat;
