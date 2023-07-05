import { useContext, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import clsx from 'clsx';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { SocketContext } from '../../../../context/socket';
import { lighten, styled } from '@mui/material/styles';
import {
  Avatar,
  Box,
  CircularProgress,
  IconButton,
  InputBase,
  Paper,
  Toolbar,
  Typography,
} from '@mui/material/';

import { selectUser } from 'app/store/userSlice';
import { ContactAvatar } from 'app/shared-components/chat';
import {
  getMessage, setMessageforSocket,
  // getSSEDirectMessage,
  selectDirectMessage,
  sendDirectMessage,
  sendFileMessage,
} from '../store/directMessageSlice';
import { setUsersforSocket } from '../store/directMessageUsersSlice';
import { updateNavigationItem } from '../../../../store/fuse/navigationSlice';
import DirectMessageMoreMenu from './DirectMessageMoreMenu';
import TeamChatAppContext from '../TeamChatAppContext';
import DirectFeatureMenu from './featureMenu-D/featureMenu-D';
import { getDmReplies, selectThreadData } from '../store/threadSlice';
import VideoPlayer from '../components/videoPlayer';
import FileViewer from '../components/fileViewer';
import TextViewer from '../components/textViewer';
import ImageViewer from '../components/imageViewer';
import ReplyMessage from '../components/replyMessage';
import { useNotification } from '../../../../notification/NotificationContext';
import { showMessage } from 'app/store/fuse/messageSlice';
import {addSendingMessage} from '../store/directMessageSlice';
const StyledMessageRow = styled('div')(({ theme, isuser }) => ({
  // eslint-disable-next-line no-nested-ternary
  color: isuser ? (theme.palette.mode === 'light' ? '#677489' : '#ffffff') : '#677489',
  // eslint-disable-next-line no-nested-ternary
  outlineColor: isuser ? (theme.palette.mode === 'light' ? '#ebeff5' : '#ffffff') : '#ebeff5',

  // '& .text-field-channel': theme.palette.mode === 'dark' && {
  //   background: 'rgba(0, 0, 0, 0.2) !important',
  // },
  '&.contact': {
    justifyContent: 'flex-start',
    '& .hiddenAvatar': {
      visibility: 'hidden',
    },
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
      '& .replies': {
        flexDirection: 'row-reverse',
        '& .reply': {
          marginRight: 5,
        },
      },
    },
    '& .bubble-D': {
      '& .time': {
        marginLeft: 12,
      },
      '& .replies': {
        flexDirection: 'row-reverse',
        '& .reply': {
          marginRight: 5,
        },
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
    flexDirection: 'row-reverse',
    justifyContent: 'flex-start',
    '& .MuiAvatar-root': {
      display: 'none',
    },
    '& .bubble': {
      backgroundColor: '#2559C7',
      // backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.contrastText,
      borderRadius: 10,
      '& .time': {
        justifyContent: 'flex-end',
      },
      '& .replies': {
        '& .reply': {
          marginLeft: 5,
        },
      },
    },

    '& .bubble-D': {
      '& .time': {
        justifyContent: 'flex-end',
      },
      '& .replies': {
        '& .reply': {
          marginLeft: 5,
        },
      },
    },

    '&.first-of-group': {
      '& .bubble': {
        borderRadius: 10,
      },
    },

    '&.last-of-group': {
      '& .bubble': {
        borderRadius: 10,
      },
    },
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
      marginBottom: 40,
      '& .time': {
        display: 'flex',
      },
    },
    '& .bubble-D': {
      paddingBottom: 13,
      marginBottom: 40,
      '& .time': {
        display: 'flex',
      },
    },
  },
  '&.isReplies': {
    marginBottom: 20,
  },
}));

const DirectMessage = (props) => {
  console.error("props",props)
  const dispatch = useDispatch();
  const socket = useContext(SocketContext);
  const [socketConnected, setSocketConnected] = useState(false);
  const { contactId } = useParams();
  const {
    setMainSidebarOpen,
    setMemberSidebarOpen,
    setContactSidebarOpen,
    setThreadSidebarOpen,
    setHqPinSidebarOpen,
    setCmPinSidebarOpen,
  } = useContext(TeamChatAppContext);
  const { eventUpdate, eventData, tabHasFocus } = useNotification();
  const user = useSelector(state => { return state.user });
  const directMessage = useSelector(selectDirectMessage);
  const loginUser = useSelector(selectUser);
  const replies = useSelector(selectThreadData);
  const [messageText, setMessageText] = useState('');
  const [fileLoading, setFileLoading] = useState(false);
  const organization = window.localStorage.getItem('organization');
  const [users, setUsers] = useState([]);
  const [isRead, setIsRead] = useState('');
  const messageRef = useRef(null);
  const params = {
    oid: JSON.parse(organization).organizationId,
    uid: user.uuid,
    cid: contactId
  }
  useEffect(() => {
    socket.on("getMessage response", res => {
      dispatch(setMessageforSocket(res));
    })
    socket.on("getUsers response", res => {
      dispatch(setUsersforSocket(res));
    })
    socket.on("getNavigationUsers response", users => {
      if(users.length>0){
        setUsers(users)
      }
    })
    socket.on("getOrganizationState response", res => {
      console.error("----------------------")
      setIsRead(res)
    })    
  }, [socket])
  useEffect(() => {
    if (users) {
      dispatch(
        updateNavigationItem('directMessages', {
          children: users.map((user) => {
            if (user.unread > 0) {
              return {
                id: `directMessages.${user.userId}`,
                title: user.display,
                type: 'item',
                profile: user,
                url: `apps/teamChat/dm/${user.userId}`,
                badge: {
                  title: user.unread,
                  bg: '#8180E7',
                  fg: '#FFFFFF',
                },
              };
            }
            return {
              id: `directMessages.${user.userId}`,
              title: user.display,
              type: 'item',
              profile: user,
              url: `apps/teamChat/dm/${user.userId}`,
              badge: null,
            };
          }),
        })
      );
    } else {
      dispatch(
        updateNavigationItem('directMessages', {
          children: null,
        })
      );
    }
  },[users])
  useEffect(() => {
    if (isRead.teamChat > 0) {
      dispatch(
        updateNavigationItem('apps.teamchat', {
          badge: {
            title: isRead.teamChat,
            bg: '#8180E7',
            fg: '#FFFFFF',
          },
        })
      );
    } else {
      dispatch(
        updateNavigationItem('apps.teamchat', {
          badge: null,
        })
      );
    }
  },[isRead])
  useEffect(() => {
    if (contactId) {
      socket.emit("getMessage", params)
      socket.emit("getUsers", params)
      socket.emit("getNavigationUsers", params)
      socket.emit("getOrganizationState", params)
      setMemberSidebarOpen(false);
      setHqPinSidebarOpen(false);
      setCmPinSidebarOpen(false);
      dispatch(getDmReplies());
    }
  }, [contactId, dispatch, setCmPinSidebarOpen, setHqPinSidebarOpen, setMemberSidebarOpen]);

  

  useEffect(() => {
    if (tabHasFocus && contactId) {
      // console.log('✉️ [Teamchat][TAB] get direct messages:', contactId);
      socket.emit("getMessage", params)
      socket.emit("getUsers", params)
      socket.emit("getNavigationUsers", params)
      socket.emit("getOrganizationState", params)
    }
  }, [contactId, socket, tabHasFocus]);

  function scrollToBottom() {
    if (!messageRef.current) {
      return;
    }
    messageRef.current.scrollTo({
      top: messageRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }

  function isFirstMessageOfGroup(item, i) {
    return (
      i === 0 ||
      (directMessage.messages[i - 1] &&
        directMessage.messages[i - 1].sendUser?.id !== item.sendUser.id)
    );
  }

  function isLastMessageOfGroup(item, i) {
    if (i === directMessage.messages.length - 1) {
      return true;
    }
    if (directMessage.messages[i + 1]) {
      if (directMessage.messages[i + 1].sendUser?.id !== item.sendUser.id) {
        return true;
      }
    }
    return false;
  }

  function onMessageSubmit(ev) {
    ev.preventDefault();
    if (messageText.trim() === '') {
      return;
    }
    
    sendMessage(ev);
    scrollToBottom();
  }
  const sendMessage = async (e) => {
    if (e.key === "Enter" && messageText) {
      console.error("4")
      socket.emit("stop typing", contactId)      
      try {
        setMessageText(""); 
        let msgdata={
          organizationId:JSON.parse(organization).organizationId,
          sendUser:user.uuid,
          receiveUser:contactId,
          data:messageText
        } 
        socket.emit("new message", msgdata) 
        dispatch(
          addSendingMessage({
            data: JSON.stringify({ text: messageText }),
            type: 'text',
            createdAt: new Date(),
            sendUser: {
              id: user.uuid,
              display: user.data.display,
              picture: user.data.picture,
            },
          })
        );
        
      } catch (err) {
        dispatch(
          showMessage({
            message: 'Send TeamChat message error. Socket server not response',
            variant: 'error',
          })
        );
        return;
      }
    }
  };
  const handleFileInput = (event) => {
    setFileLoading(true);
    const formData = new FormData();
    formData.append('file', event.target.files[0]);

    dispatch(sendFileMessage({ formData, receiveUser: contactId })).then(() => {
      setTimeout(() => {
        setFileLoading(false);
      }, 4000);
    });
  };

  function onInputChange(ev) {
    typingHandler(ev)
  }
  const typingHandler = (e) => {
    setMessageText(e.target.value);
    if (!socketConnected) return;
    if (!typing) {
      setTyping(true);
      socket.emit("typing", contactId);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", contactId);
        setTyping(false);
      }
    }, timerLength);
  };
  function onEnterPress(e) {
    if (e.keyCode === 13 && e.shiftKey === false) {
      e.preventDefault();
      onMessageSubmit(e);
    }
  }

  if (!contactId || !directMessage) {
    return null;
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
        <Toolbar className="flex items-center justify-between pl-10 pr-24 min-h-60 w-full">
          <div className="flex items-center">
            <IconButton
              aria-label="Open drawer"
              onClick={() => setMainSidebarOpen(true)}
              className="flex lg:hidden"
              size="large"
            >
              <FuseSvgIcon>heroicons-outline:chat</FuseSvgIcon>
            </IconButton>
            <div
              className="flex items-center cursor-pointer"
              onClick={() => {
                setContactSidebarOpen(true);
                setMemberSidebarOpen(false);
              }}
              onKeyDown={() => {
                setContactSidebarOpen(true);
                setMemberSidebarOpen(false);
              }}
              role="button"
              tabIndex={0}
            >
              {directMessage && directMessage.contact && (
                <>
                  <ContactAvatar
                    contact={directMessage.contact}
                    className="w-[3.5rem] h-[3.5rem]"
                  />
                  <Typography
                    color="inherit"
                    className="text-16 font-semibold px-4 truncate max-w-200"
                  >
                    {directMessage.contact.display}
                  </Typography>
                </>
              )}
            </div>
          </div>
          <DirectMessageMoreMenu className="-mx-8" messages={directMessage.messages} />
        </Toolbar>
      </Box>

      <div className="flex flex-auto h-full min-h-0 w-full">
        <div className={clsx('flex flex-1 z-10 flex-col relative', props.className)}>
          <FuseScrollbars ref={messageRef} className="flex flex-1 flex-col overflow-y-auto">
            {directMessage.messages && directMessage.messages.length > 0 && (
              <div className="flex flex-col w-full pt-16 pl-10 pr-24 pb-40">
                {directMessage.messages.map((item, i) => {
                  const messageObj = JSON.parse(item.data);
                  if (!item?.sendUser?.id) {
                    return null;
                  }
                  return (
                    <>
                      <StyledMessageRow
                        id={item.id}
                        key={i}
                        className={clsx(
                          'flex grow-0 shrink-0 items-start justify-end relative chat-row -translate-x-1/2 left-1/2 max-w-[950px]',
                          item.sendUser.id === loginUser.uuid ? 'me' : 'contact',
                          item.isDelete ? 'pb-8' : 'pb-4',
                          { 'first-of-group': isFirstMessageOfGroup(item, i) },
                          { 'last-of-group': isLastMessageOfGroup(item, i) },
                          !item.isReply && i + 1 === directMessage.messages.length && 'pb-96'
                        )}
                      >
                        <Avatar
                          src={item.sendUser.pictureURL}
                          alt={item.sendUser.display}
                          className={clsx('w-[3rem] h-[3rem] mr-10', {
                            hiddenAvatar: !isFirstMessageOfGroup(item, i),
                          })}
                        />
                        {item.isDelete ? (
                          <StyledMessageRow
                            className={clsx(
                              'bubble-D flex relative items-center justify-center p-10 text-field-channel rounded-r-full rounded-l-full outline'
                            )}
                            isuser={item.sendUser.id === loginUser.uuid ? 1 : 0}
                          >
                            <Typography>{messageObj.text}</Typography>
                            <Typography
                              className={clsx(
                                'time absolute hidden w-full text-11 mt-8 ltr:left-0 rtl:right-0 bottom-0 whitespace-nowrap -mb-24'
                              )}
                              color="textSecondary"
                            >
                              {isLastMessageOfGroup(item, i) && item.sendUser ? (
                                <b>{item.sendUser.display}&nbsp;&nbsp;</b>
                              ) : null}
                              {item.createdAt
                                ? formatDistanceToNow(new Date(item.createdAt), {
                                  addSuffix: false,
                                })
                                : null}
                            </Typography>
                          </StyledMessageRow>
                        ) : (
                          <div
                            className={clsx(
                              'bubble flex relative items-center justify-center p-10 max-w-[90%] shadow text-field-channel'
                            )}
                          >
                            {item.type && item.type === 'text' && <TextViewer item={item} />}
                            {item.type && item.type === 'image' && <ImageViewer item={item} />}
                            {item.type && item.type === 'video' && <VideoPlayer item={item} />}
                            {item.type && item.type === 'file' && <FileViewer item={item} />}
                            {item.isEdit ? (
                              <Typography className="text-12 text-grey-300 ml-5">
                                (Edited)
                              </Typography>
                            ) : null}
                            <Typography
                              className={clsx(
                                'time absolute hidden w-full text-11 mt-8 ltr:left-0 rtl:right-0 bottom-0 whitespace-nowrap -mb-24'
                              )}
                              color="textSecondary"
                            >
                              {isLastMessageOfGroup(item, i) && item.sendUser ? (
                                <b>{item.sendUser.display}&nbsp;&nbsp;</b>
                              ) : null}
                              {item.createdAt
                                ? formatDistanceToNow(new Date(item.createdAt), {
                                  addSuffix: false,
                                })
                                : null}
                            </Typography>
                          </div>
                        )}
                        {!item.isDelete && (
                          <DirectFeatureMenu
                            item={item}
                            loginUser={loginUser}
                            directMessage={directMessage}
                            contactId={contactId}
                          />
                        )}
                      </StyledMessageRow>
                      {!item.isDelete && item.isReply && (
                        <ReplyMessage
                          item={item}
                          replies={replies}
                          loginUser={loginUser}
                          messages={directMessage.messages}
                        />
                      )}
                    </>
                  );
                })}
              </div>
            )}
          </FuseScrollbars>
          {directMessage && directMessage.messages && (
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
                {fileLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  <IconButton size="large" component="label">
                    <input
                      hidden
                      accept="image/gif, image/png, image/jpeg, video/mp4, application/pdf, application/msword, application/vnd.ms-excel,application/vnd.ms-powerpoint, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,
                      application/vnd.openxmlformats-officedocument.presentationml.slideshow,
                      application/vnd.openxmlformats-officedocument.presentationml.presentation"
                      onChange={handleFileInput}
                      type="file"
                    />
                    <FuseSvgIcon>heroicons-outline:paper-clip</FuseSvgIcon>
                  </IconButton>
                )}

                <InputBase
                  multiline
                  maxRows={2}
                  autoFocus={false}
                  id="message-input"
                  className="flex-1 flex grow shrink-0 h-44 mx-8 px-16 border-2 rounded-full"
                  placeholder="Type your message"
                  onChange={onInputChange}
                  value={messageText}
                  disabled={fileLoading}
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
      </div>
    </>
  );
};

export default DirectMessage;
