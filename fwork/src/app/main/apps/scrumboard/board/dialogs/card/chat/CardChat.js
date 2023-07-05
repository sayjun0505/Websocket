import FuseScrollbars from '@fuse/core/FuseScrollbars';
import FuseLoading from '@fuse/core/FuseLoading';
import { lighten, styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { useEffect, useRef, useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';
import Input from '@mui/material/Input';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import CircularProgress from '@mui/material/CircularProgress';
import Toolbar from '@mui/material/Toolbar';
import Chip from '@mui/material/Chip';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Hidden from '@mui/material/Hidden';
import Linkify from 'react-linkify';

import { selectUser } from 'app/store/userSlice';
import { ContactChannelAvatar } from 'app/shared-components/chat';
import {
  addSendingMessage,
  getChat, getChatinScrum,
  selectChat,
  sendFileMessage,
  sendMessage,sendMessageinScrum,
} from '../../../../store/chatSlice';

import { SocketContext } from '../../../../../../../context/socket';
import {  getCardsforSocket} from '../../../../store/cardsSlice';
// import { getCustomer } from '../store/customerSlice';
import ChatMoreMenu from './ChatMoreMenu';
// import QuickReplyMenu from './QuickReplyMenu';

const StyledMessageRow = styled('div')(({ theme }) => ({
  '&.contact': {
    '& .bubble': {
      backgroundColor: theme.palette.secondary.light,
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
      backgroundColor: theme.palette.primary.light,
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
  },
  '&.last-of-group': {
    '& .bubble': {
      borderBottomLeftRadius: 20,
      paddingBottom: 13,
      '& .time': {
        display: 'flex',
      },
    },
  },
}));

const CardChat = (props) => {
  const { chatId } = props;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const chat = useSelector(selectChat);
  const loginUser = useSelector(selectUser);
  const chatRef = useRef(null);
  const [customer, setCustomer] = useState();
  const [messageText, setMessageText] = useState('');
  const [channelName, setChannelName] = useState('');
  const [fileLoading, setFileLoading] = useState(false);
  const [historySelected, setHistorySelected] = useState();
  const user = useSelector(state => { return state.user });
  const scrumboardApp = useSelector(state => { return state.scrumboardApp });
  const organization = window.localStorage.getItem('organization');
  const socket = useContext(SocketContext);
  useEffect(() => {
    socket.on("getChatinScrum response", res => {
      dispatch(getChatinScrum(res))
    })
    socket.on("getCards response", res => {
      dispatch(getCardsforSocket(res))
    })
    socket.on("sendMessageinScrum response", res => {
      // socket.emit("getChatinScrum", { chatId: chatId, bid: scrumboardApp.board.id, reqid: user.uuid, orgId: JSON.parse(organization).organizationId })
      // dispatch(sendMessageinScrum(res))
      // socket.emit("getCards", {  boardId: scrumboardApp.board.id, reqid: user.uuid, orgId: JSON.parse(organization).organizationId })
    })
  }, [socket])

  useEffect(() => {
    if (chatId) {
      socket.emit("getChatinScrum", { chatId: chatId, bid: scrumboardApp.board.id, reqid: user.uuid, orgId: JSON.parse(organization).organizationId })
    }
  }, [chatId, dispatch]);

  useEffect(() => {
    if (chat) {
      setTimeout(scrollToBottom());
      if (chat.customer) setCustomer(chat.customer);

      if (chat.channel) {
        if (chat.channel.channel === 'line' && chat.channel.line)
          setChannelName(chat.channel.line.name);
        if (chat.channel.channel === 'facebook' && chat.channel.facebook)
          setChannelName(chat.channel.facebook.name);
      }
    }
  }, [dispatch, chat]);

  useEffect(() => {
    if (chat) {
      setTimeout(scrollToBottom);
    }
  }, [chat]);

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
    return i === 0 || (chat.message[i - 1] && chat.message[i - 1].direction !== item.direction);
  }
  function isLastMessageOfGroup(item, i) {
    return (
      i === chat.message.length - 1 ||
      (chat.message[i + 1] && chat.message[i + 1].direction !== item.direction)
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
    socket.emit("sendMessageinScrum", {
      chatId: chat.id, 
      message: {
        data: JSON.stringify({ text: messageText }),
        type: 'text',
      }, 
      reqid: user.uuid, 
      orgId: JSON.parse(organization).organizationId
    })
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

  if (!loginUser || !chat || !customer) {
    return (
      <div className="flex w-full h-full items-center">
        <FuseLoading />
      </div>
    );
  }

  return (
    <div className="flex flex-col border-1 rounded-[4px] mb-24">
      <Box
        className="w-full border-1 mb-10"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? lighten(theme.palette.background.default, 0.4)
              : lighten(theme.palette.background.default, 0.02),
        }}
      >
        <Toolbar className="flex items-center justify-between px-16 py-8 w-full">
          <div className="flex flex-col w-full items-center space-y-4">
            <div className="flex flex-row w-full items-center">
              <div className="flex w-full items-center">
                <div
                  className="flex items-center cursor-pointer"
                // onClick={() => {
                //   setCustomerSidebarOpen(1);
                // }}
                // onKeyDown={() => setCustomerSidebarOpen(1)}
                // role="button"
                // tabIndex={0}
                >
                  <ContactChannelAvatar contact={customer} channel={chat.channel} />
                  <div className="flex flex-col px-8">
                    <Typography color="inherit" className="text-16 font-semibold px-4">
                      <>
                        <Hidden mdDown>{`${customer.display}`}</Hidden>
                        <Hidden mdUp>{`${customer?.display?.substring(0, 15)}`}</Hidden>
                      </>
                    </Typography>
                    <Chip
                      size="small"
                      // variant="outlined"
                      // color="secondary"
                      className="w-min my-1 rounded bg-[#6D6D6D] text-[#FFFFFF]"
                      label={channelName}
                    />
                  </div>
                </div>
              </div>
              <ChatMoreMenu className="mx-8" />
            </div>
          </div>
        </Toolbar>
      </Box>

      <div className="flex flex-auto min-h-200 max-h-320 w-full mb-10">
        <div className={clsx('flex flex-1 z-10 flex-col relative', props.className)}>
          <FuseScrollbars ref={chatRef} className="flex flex-1 flex-col overflow-y-auto">
            {chat?.message.length > 0 && (
              <div className="flex flex-col p-16">
                {chat.message.map((item, i) => {
                  const messageObj = JSON.parse(item.data);
                  return (
                    <StyledMessageRow
                      key={i}
                      className={clsx(
                        'flex flex-col grow-0 shrink-0 items-start justify-end relative px-16 pb-4',
                        { me: item.direction === 'outbound' },
                        { contact: item.direction === 'inbound' },
                        { 'first-of-group': isFirstMessageOfGroup(item, i) },
                        { 'last-of-group': isLastMessageOfGroup(item, i) },
                        i + 1 === chat.message.length && 'pb-0'
                      )}
                    >
                      <div className="bubble flex relative items-center justify-center p-12 max-w-[90%] shadow">
                        {item.type && item.type === 'image' && (
                          <img
                            src={messageObj.url}
                            alt={messageObj.id}
                            className="max-w-xs h-auto"
                            onLoad={onImgLoaded}
                          />
                        )}
                        {item.type && item.type === 'sticker' && (
                          <img
                            src={messageObj.url}
                            alt="Sticker"
                            className="max-w-xs h-auto"
                            onLoad={onImgLoaded}
                          />
                        )}
                        {item.type && item.type === 'text' && (
                          <Linkify>
                            <p className="break-words whitespace-pre-wrap max-w-full">
                              {messageObj.text}
                            </p>
                          </Linkify>
                        )}
                        {/* 
                        {item.type && item.type === 'confirm' && (
                          <div className=" break-all">This is a confirm message</div>
                          // <PreviewConfirm template={messageObj.confirm} />
                        )}

                        {item.type && item.type === 'buttons' && (
                          <div className=" break-all">This is a button message</div>
                          // <PreviewButtons template={messageObj.buttons} />
                        )}

                        {item.type && item.type === 'carousel' && (
                          <div className=" break-all">This is a carousel message</div>
                          // <PreviewCarousel template={messageObj.carousel} />
                        )}

                        {item.type && item.type === 'flex' && (
                          <div className=" break-all">This is a flex template message</div>
                        )} */}

                        {item.type &&
                          (item.type === 'buttons' ||
                            item.type === 'confirm' ||
                            item.type === 'carousel' ||
                            item.type === 'flex') && (
                            <div className=" break-all">This is a template message</div>
                          )}

                        <Typography
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
            )}
          </FuseScrollbars>
        </div>
      </div>
      {chat && chat.status === 'open' && (
        <Paper
          square
          component="form"
          autoComplete="off"
          onSubmit={onMessageSubmit}
          className="flex flex-auto border-t-1 right-0 left-0 py-16 px-16"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? lighten(theme.palette.background.default, 0.4)
                : lighten(theme.palette.background.default, 0.02),
          }}
        >
          <div className="flex items-center relative w-full">
            {/* <IconButton className="" size="large">
                    <FuseSvgIcon className="text-24" color="action">
                      heroicons-outline:chat-alt
                    </FuseSvgIcon>
                  </IconButton> */}
            {/* <QuickReplyMenu className="-mx-8" /> */}

            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label htmlFor="icon-button-file">
              <Input
                accept="image/gif, image/png, image/jpeg, video/mp4"
                id="icon-button-file"
                type="file"
                className="hidden"
                onChange={handleFileInput}
              />
              <IconButton color="primary" aria-label="upload picture" component="span">
                {fileLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  <FuseSvgIcon className="text-24" color="action">
                    heroicons-outline:paper-clip
                  </FuseSvgIcon>
                )}
              </IconButton>
            </label>

            <InputBase
              multiline
              maxRows={4}
              autoFocus
              id="message-input"
              className="flex-1 flex grow shrink-0 mx-8 px-16 border-2 rounded-xl max-w-full"
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
      )}
    </div>
  );
};

export default CardChat;
