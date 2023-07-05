import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import clsx from 'clsx';
import { convertToRaw, EditorState } from 'draft-js';
import FuseUtils from '@fuse/utils/FuseUtils';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { lighten, styled } from '@mui/material/styles';
import {
  Avatar,
  Box,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Toolbar,
  Typography,
} from '@mui/material/';
import { MentionEditor } from 'app/shared-components/chat';
import { selectUser } from 'app/store/userSlice';
import { useThemeMediaQuery } from '@fuse/hooks';
import { selectUsers } from '../../store/directMessageUsersSlice';
import { selectMember } from '../../store/channelMemberSlice';
import TeamChatAppContext from '../../TeamChatAppContext';
import { getThreadMessage, sendFileMessage, sendMessage } from '../../store/threadSlice';
import TextViewer from '../../components/textViewer';
import ImageViewer from '../../components/imageViewer';
import VideoPlayer from '../../components/videoPlayer';
import FileViewer from '../../components/fileViewer';

const StyledMessageRow = styled('div')(({ theme }) => ({
  '& .text-field-channel': theme.palette.mode === 'dark' && {
    background: 'rgba(0, 0, 0, 0.2) !important',
  },
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
      marginBottom: 20,
      '& .time': {
        display: 'flex',
      },
    },
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
      // minHeight: 63,
    },
    highlighter: {
      padding: 9,
    },
    input: {
      padding: 9,
      paddingLeft: 16,
      paddingRight: 16,
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
const Threadsidebar = (props) => {
  const dispatch = useDispatch();
  const { channelId, contactId } = useParams();
  const {
    setHqPinSidebarOpen,
    setCmPinSidebarOpen,
    setDmPinSidebarOpen,
    setContactSidebarOpen,
    setMemberSidebarOpen,
    setThreadSidebarOpen,
  } = useContext(TeamChatAppContext);
  const {
    messages,
    id: threadId,
    basedata,
    basecreatedAt,
    basecreatedBy,
    basetype,
  } = useSelector(({ teamchatApp }) => teamchatApp.thread);

  const loginUser = useSelector(selectUser);
  const users = useSelector(selectUsers);
  const members = useSelector(selectMember);

  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const [fileLoading, setFileLoading] = useState(false);

  const messageRef = useRef(null);

  const options = useMemo(() => {
    if (channelId) {
      if (!members) {
        return [];
      }
      return members.map((member) => ({
        ...member,
        link: member.email,
        name: member.display,
      }));
    }
    if (!users) {
      return [];
    }
    return users.map((user) => ({
      ...user,
      link: user.email,
      name: user.display,
    }));
  }, [users, members, channelId]);

  useEffect(() => {
    dispatch(getThreadMessage({ threadId }));
    setContactSidebarOpen(false);
  }, [dispatch, setContactSidebarOpen, threadId]);

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
    let threadType;
    if (channelId) {
      threadType = 'channel';
    } else if (contactId) {
      threadType = 'direct';
    } else {
      threadType = 'hq';
    }
    const data = editorState.getCurrentContent();
    const messageText = FuseUtils.formatTextToMention(
      data.getPlainText(),
      convertToRaw(data).entityMap
    );

    if (messageText.trim() === '') {
      return;
    }

    // console.log('threadType ', threadType);
    dispatch(
      sendMessage({
        threadId,
        threadType,
        messageText,
        channelId,
        contactId,
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

    dispatch(sendFileMessage({ formData, threadId, channelId, contactId })).then(() => {
      setTimeout(() => {
        setFileLoading(false);
      }, 4000);
    });
  };

  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('sm'));

  if (!threadId || !messages) {
    return null;
  }
  return (
    <div
      className={clsx(
        isMobile ? 'w-[85vw]' : 'w-full',
        'flex flex-col flex-1 h-screen sm:h-[calc(100vh-64px)] overflow-hidden'
      )}
    >
      <div className="flex flex-col w-full left-0 right-0 top-0 z-30">
        <Box
          className="border-b-1 w-full flex flex-col"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? lighten(theme.palette.background.default, 0.4)
                : lighten(theme.palette.background.default, 0.02),
          }}
        >
          <Toolbar className="flex items-center justify-between px-10 w-full">
            <div className="flex flex-row justify-start space-x-5 items-center">
              <Typography className="px-4 font-medium text-16" variant="subtitle1">
                Thread
              </Typography>
            </div>
            <IconButton
              onClick={() => {
                setThreadSidebarOpen(false);
                setMemberSidebarOpen(false);
                setHqPinSidebarOpen(false);
                setCmPinSidebarOpen(false);
                setDmPinSidebarOpen(false);
              }}
              color="inherit"
              size="large"
            >
              <FuseSvgIcon>heroicons-outline:x</FuseSvgIcon>
            </IconButton>
          </Toolbar>
        </Box>
      </div>
      <div className="flex flex-auto min-h-0">
        <div className="flex flex-1 z-10 flex-col max-w-[400px]">
          <FuseScrollbars ref={messageRef} className="flex flex-1 flex-col overflow-y-scroll">
            <div className="flex flex-col pt-[1.5rem] px-12 pb-[3rem] bg-white">
              <StyledMessageRow
                className={clsx(
                  'flex grow-0 shrink-0 items-start justify-end relative pb-4 chat-row',
                  basecreatedBy.id === loginUser.uuid ? 'me' : 'contact'
                )}
              >
                <Avatar
                  src={basecreatedBy.pictureURL}
                  alt={basecreatedBy.display}
                  className={clsx('w-[3rem] h-[3rem] mr-10')}
                />
                <div
                  className={clsx(
                    'bubble flex relative items-center justify-center p-10 max-w-full shadow text-field-channel'
                  )}
                >
                  {basetype === 'text' && <TextViewer item={basedata} />}
                  {basetype === 'image' && <ImageViewer item={basedata} />}
                  {basetype === 'video' && <VideoPlayer item={basedata} />}
                  {basetype === 'file' && <FileViewer item={basedata} />}
                  <Typography
                    className="time absolute flex w-full text-11 mt-8 -mb-24 ltr:left-0 rtl:right-0 bottom-0 whitespace-nowrap"
                    color="textSecondary"
                  >
                    {basecreatedBy ? <b>{basecreatedBy.display}&nbsp;&nbsp;</b> : null}
                    {basecreatedAt
                      ? formatDistanceToNow(new Date(basecreatedAt), {
                          addSuffix: false,
                        })
                      : null}
                  </Typography>
                </div>
              </StyledMessageRow>
            </div>
            <Divider className="border-[#E5E5E5]" />
            {messages && messages.length > 0 && (
              <div className="flex flex-col pt-[1.5rem] px-12 pb-[3rem]">
                {messages.map((item, i) => {
                  const messageObj = JSON.parse(item.data);
                  return (
                    <StyledMessageRow
                      key={i}
                      className={clsx(
                        'flex grow-0 shrink-0 items-start justify-end relative pb-4 chat-row',
                        item.createdBy.id === loginUser.uuid ? 'me' : 'contact',
                        { 'first-of-group': isFirstMessageOfGroup(item, i) },
                        { 'last-of-group': isLastMessageOfGroup(item, i) },
                        i + 1 === messages.length && 'pb-96'
                      )}
                    >
                      <Avatar
                        src={item.createdBy.pictureURL}
                        alt={item.createdBy.display}
                        className={clsx('w-[3rem] h-[3rem] mr-10', {
                          hiddenAvatar: !isFirstMessageOfGroup(item, i),
                        })}
                      />
                      <div
                        className={clsx(
                          'bubble flex relative items-center justify-center p-10 max-w-full shadow text-field-channel'
                        )}
                      >
                        {item.type && item.type === 'text' && <TextViewer item={item} />}
                        {item.type && item.type === 'image' && <ImageViewer item={item} />}
                        {item.type && item.type === 'video' && <VideoPlayer item={item} />}
                        {item.type && item.type === 'file' && <FileViewer item={item} />}
                        <Typography
                          className="time absolute hidden w-full text-11 mt-8 -mb-24 ltr:left-0 rtl:right-0 bottom-0 whitespace-nowrap"
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
                    </StyledMessageRow>
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
            className="sticky border-t-1 bottom-0 right-0 left-0 py-16 px-16"
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
            <div className="flex items-center relative">
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
                options={options}
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
    </div>
  );
};

export default Threadsidebar;
