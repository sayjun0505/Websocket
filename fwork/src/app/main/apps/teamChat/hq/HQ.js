import { useContext, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import clsx from 'clsx';
import { convertToRaw, EditorState } from 'draft-js';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import FuseUtils from '@fuse/utils/FuseUtils';

import { lighten, styled } from '@mui/material/styles';
import {
  Avatar,
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Toolbar,
  Typography,
} from '@mui/material/';

import { selectUser } from 'app/store/userSlice';
import { MentionEditor } from 'app/shared-components/chat';

import { selectUsers } from '../store/directMessageUsersSlice';

import {
  getHQMessages,
  selectData,
  selectMessages,
  sendFileMessage,
  sendMessage,
} from '../store/hqSlice';
import { getHqReplies } from '../store/threadSlice';
import HqMoreMenu from './HqMoreMenu';
import TeamChatAppContext from '../TeamChatAppContext';
import FeatureMenu from './featureMenu/featureMenu';
import VideoPlayer from '../components/videoPlayer';
import FileViewer from '../components/fileViewer';
import TextViewer from '../components/textViewer';
import ImageViewer from '../components/imageViewer';
import ReplyMessage from '../components/replyMessage';
import { useNotification } from '../../../../notification/NotificationContext';

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
let container;
const MentionStyle = {
  control: {
    fontSize: 14,
    fontWeight: 'normal',
  },

  '&multiLine': {
    control: {
      // fontFamily: 'monospace',
      // minHeight: 63,
    },
    highlighter: {
      padding: 9,
    },
    input: {
      padding: 9,
      paddingLeft: 16,
      paddingRight: 16,
      // border: '1px solid silver',
    },
  },

  '&singleLine': {
    display: 'inline-block',
    width: 180,

    highlighter: {
      padding: 1,
    },
    input: {
      padding: 1,
    },
  },

  suggestions: {
    list: {
      fontSize: 14,
    },
    item: {
      padding: '5px 15px',
      borderBottom: '1px solid rgba(0,0,0,0.15)',
      '&focused': {
        backgroundColor: '#bebebe',
      },
      color: '#434343',
    },
  },
};
// className="flex-1 flex grow shrink-0 h-44 mx-8 px-16 border-2 rounded-full"
const HQ = (props) => {
  const dispatch = useDispatch();
  const messageRef = useRef(null);
  const {
    setContactSidebarOpen,
    setMainSidebarOpen,
    setMemberSidebarOpen,
    setThreadSidebarOpen,
    setCmPinSidebarOpen,
    setDmPinSidebarOpen,
  } = useContext(TeamChatAppContext);
  const { eventUpdate, eventData, tabHasFocus } = useNotification();
  const { organizationId } = useSelector(({ organization }) => organization);
  const messages = useSelector(selectMessages);
  const users = useSelector(selectUsers);
  const hqData = useSelector(selectData);
  const loginUser = useSelector(selectUser);
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const [fileLoading, setFileLoading] = useState(false);

  useEffect(() => {
    dispatch(getHQMessages());
    setContactSidebarOpen(false);
    setCmPinSidebarOpen(false);
    setDmPinSidebarOpen(false);
    dispatch(getHqReplies());
  }, [dispatch, setCmPinSidebarOpen, setContactSidebarOpen, setDmPinSidebarOpen]);

  useEffect(() => {
    if (
      eventData &&
      eventData.organizationId &&
      eventData.organizationId === organizationId &&
      eventUpdate &&
      eventUpdate < new Date()
    ) {
      // console.log('✉️ [Teamchat][SSE] get HQ messages:', organizationId);
      dispatch(getHQMessages());
    }
  }, [organizationId, dispatch, eventUpdate, eventData, tabHasFocus]);

  useEffect(() => {
    if (tabHasFocus && organizationId) {
      // console.log('✉️ [Teamchat][TAB] get HQ messages:', organizationId);
      dispatch(getHQMessages());
    }
  }, [dispatch, organizationId, tabHasFocus]);



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
    return i === 0 || (messages[i - 1] && messages[i - 1].createdBy.id !== item.createdBy.id);
  }

  function isLastMessageOfGroup(item, i) {
    return (
      i === messages.length - 1 ||
      (messages[i + 1] && messages[i + 1].createdBy.id !== item.createdBy.id)
    );
  }

  function onMessageSubmit(ev) {
    ev.preventDefault();
    const data = editorState.getCurrentContent();
    const messageText = FuseUtils.formatTextToMention(
      data.getPlainText(),
      convertToRaw(data).entityMap
    );
    if (messageText.trim() === '') {
      return;
    }

    dispatch(
      sendMessage({
        messageText,
      })
    ).then(() => {
      setEditorState(EditorState.createEmpty());
    });
    scrollToBottom();
  }

  const handleFileInput = (event) => {
    setFileLoading(true);
    const formData = new FormData();
    formData.append('file', event.target.files[0]);

    dispatch(sendFileMessage({ formData })).then(() => {
      setTimeout(() => {
        setFileLoading(false);
      }, 4000);
    });
  };

  if (!hqData || !messages) {
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
                setMemberSidebarOpen(true);
                setContactSidebarOpen(false);
              }}
              onKeyDown={() => {
                setMemberSidebarOpen(true);
                setContactSidebarOpen(false);
              }}
              role="button"
              tabIndex={0}
            >
              <Typography style={{ fontWeight: 600 }} className="truncate max-w-200">
                General Chat (Chat HQ)
              </Typography>
            </div>
          </div>
          <HqMoreMenu className="-mx-8" messages={messages} />
        </Toolbar>
      </Box>

      <div className="flex flex-auto h-full min-h-0 w-full">
        <div className={clsx('flex flex-1 z-10 flex-col relative w-full')}>
          <FuseScrollbars ref={messageRef} className="flex flex-1 flex-col overflow-y-auto">
            {messages && messages.length > 0 && (
              <div className="flex flex-col w-full pt-16 pl-10 pr-24 pb-40">
                {messages.map((item, i) => {
                  const messageObj = JSON.parse(item.data);
                  if (!item?.createdBy?.id) {
                    return null;
                  }
                  return (
                    <>
                      <StyledMessageRow
                        id={item.id}
                        key={i}
                        className={clsx(
                          'flex grow-0 shrink-0 items-start justify-end relative chat-row -translate-x-1/2 left-1/2 max-w-[950px]',
                          item.createdBy.id === loginUser.uuid ? 'me' : 'contact',
                          item.isDelete ? 'pb-8' : 'pb-4',
                          { 'first-of-group': isFirstMessageOfGroup(item, i) },
                          { 'last-of-group': isLastMessageOfGroup(item, i) },
                          !item.isReply && i + 1 === messages.length && 'pb-96'
                        )}
                      >
                        <Avatar
                          src={item.createdBy.pictureURL}
                          alt={item.createdBy.display}
                          className={clsx('w-[3rem] h-[3rem] mr-10', {
                            hiddenAvatar: !isFirstMessageOfGroup(item, i),
                          })}
                        />
                        {item.isDelete ? (
                          <StyledMessageRow
                            className={clsx(
                              'bubble-D flex relative items-center justify-center p-10 text-field-channel rounded-r-full rounded-l-full outline'
                            )}
                            isuser={item.createdBy.id === loginUser.uuid ? 1 : 0}
                          >
                            <Typography>{messageObj.text}</Typography>
                            <Typography
                              className={clsx(
                                'time absolute hidden w-full text-11 mt-8 ltr:left-0 rtl:right-0 bottom-0 whitespace-nowrap -mb-24'
                              )}
                              color="textSecondary"
                            >
                              {isLastMessageOfGroup(item, i) && item.createdBy ? (
                                <b>{item.createdBy.display}&nbsp;&nbsp;</b>
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
                              'bubble flex relative items-end justify-center p-10 max-w-[90%] shadow text-field-channel'
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
                              {isLastMessageOfGroup(item, i) && item.createdBy ? (
                                <b>{item.createdBy.display}&nbsp;&nbsp;</b>
                              ) : null}
                              {item.createdAt
                                ? formatDistanceToNow(new Date(item.createdAt), {
                                    addSuffix: false,
                                  })
                                : null}
                            </Typography>
                          </div>
                        )}
                        {!item.isDelete && <FeatureMenu item={item} loginUser={loginUser} />}
                      </StyledMessageRow>
                      {!item.isDelete && item.isReply && (
                        <ReplyMessage item={item} loginUser={loginUser} messages={messages} />
                      )}
                    </>
                  );
                })}
              </div>
            )}
          </FuseScrollbars>
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
            ref={(el) => {
              container = el;
            }}
          >
            <div className="flex items-center relative max-w-[950px] left-1/2 -translate-x-1/2">
              {fileLoading ? (
                <CircularProgress color="inherit" size={20} />
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

              <MentionEditor
                editorState={editorState}
                setEditorState={setEditorState}
                onMessageSubmit={onMessageSubmit}
                options={
                  users &&
                  users.map((user) => ({
                    ...user,
                    link: user.email,
                    name: user.display,
                  }))
                }
              />
              <IconButton className="" onClick={onMessageSubmit} size="large">
                <FuseSvgIcon className="rotate-90" color="action">
                  heroicons-outline:paper-airplane
                </FuseSvgIcon>
              </IconButton>
            </div>
          </Paper>
        </div>
      </div>
    </>
  );
};

export default HQ;
