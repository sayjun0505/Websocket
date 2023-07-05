import { useContext, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';
import { convertToRaw, EditorState } from 'draft-js';
import FuseUtils from '@fuse/utils/FuseUtils';
import { lighten, styled } from '@mui/material/styles';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';

import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import clsx from 'clsx';
import Linkify from 'react-linkify';
import Fade from '@mui/material/Fade';
import PushPinRoundedIcon from '@mui/icons-material/PushPinRounded';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { selectUser } from 'app/store/userSlice';
import { MentionEditor } from 'app/shared-components/chat';
import { selectUsers } from '../../store/usersSlice';
import {
  getComments,
  selectComments,
  sendCommentFileMessage,
  sendCommentMessage,
  updatePinComment,
} from '../../store/commentsSlice';
import ChatAppContext from '../../ChatAppContext';
// import {
//   // pinTeamChatMessage,
//   selectChat,
//   sendTeamChatFileMessage,
//   sendTeamChatMessage,
//   // unPinTeamChatMessage,
//   updateTeamChat,
// } from '../../store/chatSlice';

const StyledMessageRow = styled('div')(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-end',
  padding: '0 16px 4px 16px',
  flex: '0 0 auto',

  '& .avatar': {
    position: 'absolute',
    left: -32,
    margin: 0,
  },

  '& .bubble': {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    maxWidth: '100%',
  },

  '& .message': {
    whiteSpace: 'pre-wrap',
    lineHeight: 1.2,
  },

  '& .time': {
    position: 'absolute',
    display: 'none',
    width: '100%',
    fontSize: 11,
    marginTop: 2,
    top: '100%',
    left: 0,
    whiteSpace: 'nowrap',
  },

  '&.contact': {
    '& .bubble': {
      backgroundColor: '#64748B',
      // backgroundColor: theme.palette.secondary.light,
      color: theme.palette.secondary.contrastText,
      borderTopLeftRadius: 5,
      borderBottomLeftRadius: 5,
      borderTopRightRadius: 20,
      borderBottomRightRadius: 20,
      // marginLeft: '-4rem',
      '& .pin': {
        display: 'none',
      },
      '& .pinned': {
        right: '-8rem',
      },
      ':hover': {
        backgroundColor: '#d5ecff',
        '& .pin': {
          display: 'flex',
          right: '-5rem',
        },
      },
      // '& .time': {
      //   marginLeft: 12,
      // },
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

    '& .avatar': {
      order: 2,
      margin: '0 0 0 16px',
    },

    '& .bubble': {
      marginLeft: 'auto',
      backgroundColor: '#2559C7',
      // backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.contrastText,
      borderTopLeftRadius: 20,
      borderBottomLeftRadius: 20,
      borderTopRightRadius: 5,
      borderBottomRightRadius: 5,
      '& .pin': {
        display: 'none',
      },
      '& .pinned': {
        left: '-8rem',
      },
      ':hover': {
        backgroundColor: '#1d2838b0',
        '& .pin': {
          display: 'flex',
          left: '-5rem',
        },
      },
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
  '&.contact + .contact': {
    '&.first-of-group': {
      '& .bubble': {
        marginTop: 20,
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
      '& .time': {
        display: 'flex',
      },
    },
  },

  '&.pin': {
    '& .bubble': {
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.getContrastText(theme.palette.background.paper),
      borderRadius: 20,
    },
  },
}));

const MentionStyle = {
  control: {
    fontSize: 14,
    fontWeight: 'normal',
    maxHeight: 70,
    overflowX: 'hidden',
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
      overflowX: 'hidden',
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

const CommentSidebar = (props) => {
  const dispatch = useDispatch();
  const routeParams = useParams();
  const location = useLocation();
  const { id: chatId } = routeParams;
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

  const { customerSidebarOpen, commentSidebarOpen, handleRightSidebarClose } =
    useContext(ChatAppContext);

  // const chat = useSelector(selectChat);
  // const { user } = useSelector(selectUser);
  const { uuid } = useSelector(selectUser);
  const users = useSelector(selectUsers);
  // const userOptions = useSelector(selectUsers);
  const comments = useSelector(selectComments);
  // const customer = useSelector(selectCustomer);

  const chatScroll = useRef(null);
  // const [messageText, setMessageText] = useState('');
  // const [userList, setUserList] = useState([]);
  const [tcMessageList, setTCMessageList] = useState([]);
  const [pinMessageList, setPinMessageList] = useState([]);
  const [fileLoading, setFileLoading] = useState(false);
  const [togglePinMenu, setTogglePinMenu] = useState(false);
  const [togglePinMessage, setTogglePinMessage] = useState(false);
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

  useEffect(() => {
    if (chatId) {
      // console.log('✊🏻 [CommentSidebar] chatId ', chatId);
      dispatch(getComments({ chatId }));
    }
  }, [chatId, dispatch]);

  useEffect(() => {
    // console.log('✊🏻 [comments] length  ', comments.length);
    if (comments && comments.length > 0) {
      setTCMessageList(comments);
      let pinList = [];
      pinList = comments.filter((message) => message.isPin);
      setPinMessageList(pinList);
    }
  }, [comments]);
  useEffect(() => {
    if (!commentSidebarOpen) {
      setTCMessageList([]);
    }
  }, [commentSidebarOpen]);

  function scrollToBottom() {
    if (chatScroll && chatScroll.current && chatScroll.current.scrollHeight)
      chatScroll.current.scrollTop = chatScroll.current.scrollHeight;
  }

  const handlerTeamChatFileInput = async (event) => {
    setFileLoading(true);
    const formData = new FormData();
    formData.append('file', event.target.files[0]);
    dispatch(sendCommentFileMessage({ formData, chatId })).then(() => {
      setTimeout(() => {
        setFileLoading(false);
      }, 5000);
    });
  };

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
      sendCommentMessage({
        messageText,
        chatId,
      })
    ).then(() => {
      setEditorState(EditorState.createEmpty());
    });
    scrollToBottom();
  }

  const handlePin = async (comment) => {
    dispatch(
      updatePinComment({
        id: comment.id,
        isPin: true,
      })
    );
  };

  const handleUnPin = async (comment) => {
    dispatch(
      updatePinComment({
        id: comment.id,
        isPin: false,
      })
    );
  };

  const handleTogglePinMessage = () => {
    setTogglePinMessage(!togglePinMessage);
  };

  const isFirstMessageOfGroup = (item, i) => {
    return (
      i === 0 || (tcMessageList[i - 1] && tcMessageList[i - 1].createdBy.id !== item.createdBy.id)
    );
  };
  const isLastMessageOfGroup = (item, i) => {
    return (
      i === tcMessageList.length - 1 ||
      (tcMessageList[i + 1] && tcMessageList[i + 1].createdBy.id !== item.createdBy.id)
    );
  };

  return (
    <div
      className={clsx(
        isMobile ? 'w-[333px]' : 'w-[398px]',
        'flex flex-col flex-1 h-[calc(100vh-64px)] overflow-hidden'
      )}
    >
      <div className="flex flex-col flex-1 w-full left-0 right-0 top-0 z-30">
        {pinMessageList && pinMessageList.length > 0 && (
          <Box
            style={{ width: '-webkit-fill-available' }}
            sx={{
              backgroundColor: (theme) =>
                theme.palette.mode === 'light'
                  ? lighten(theme.palette.primary.light, 0.85)
                  : lighten(theme.palette.primary.light, 0.02),
            }}
          >
            <div
              className="flex flex-row items-center p-10 py-5"
              id="pin-menu"
              onClick={handleTogglePinMessage}
              onKeyDown={handleTogglePinMessage}
              aria-hidden="true"
              role="button"
              tabIndex={0}
            >
              <div>
                <PushPinRoundedIcon
                  htmlColor="black"
                  fontSize="small"
                  style={{ paddingRight: '0.3rem' }}
                />
                {pinMessageList?.length} Pinned
              </div>
              <FuseSvgIcon className="text-48" size={24} color="action">
                {togglePinMessage
                  ? 'material-solid:arrow_drop_up'
                  : 'material-solid:arrow_drop_down'}
              </FuseSvgIcon>
            </div>
            <Fade in={togglePinMessage}>
              <div
                className="flex flex-col p-14"
                style={
                  togglePinMessage
                    ? { display: 'flex', flexDirection: 'column' }
                    : { display: 'none' }
                }
              >
                {pinMessageList.map((item, i) => {
                  let textMessage = '';
                  if (item.type && item.type === 'text') {
                    textMessage = FuseUtils.formatMentionToText(JSON.parse(item.data).text);
                  } else if (item.type === 'file') {
                    textMessage = 'File';
                  } else if (item.type === 'image') {
                    textMessage = 'Image';
                  } else {
                    textMessage = 'Unknown type';
                  }

                  return (
                    <div
                      key={i}
                      className="w-full rounded-xl "
                      sx={{
                        backgroundColor: (theme) =>
                          theme.palette.mode === 'light'
                            ? lighten(theme.palette.primary.light, 0.85)
                            : lighten(theme.palette.primary.light, 0.02),
                        color: (theme) =>
                          theme.palette.mode === 'light'
                            ? theme.palette.primary.contrastText
                            : theme.palette.primary.contrastText,
                      }}
                    >
                      <StyledMessageRow
                        data-to-scrollspy-id={item.id}
                        className={clsx(
                          'flex flex-col grow-0 shrink-0 items-start justify-end relative px-16 pb-4',
                          'pin'
                        )}
                      >
                        <div className="bubble flex relative items-center justify-center p-12 max-w-[90%]">
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
                                {textMessage}
                              </span>
                            </Linkify>
                          )}
                          {item.type && item.type === 'image' && (
                            <div className="message">
                              <img
                                src={JSON.parse(item.data).url}
                                alt={item.id}
                                className=" h-auto min-w-0"
                              />
                            </div>
                          )}
                        </div>
                        <Typography className="contents text-xs" color="textSecondary">
                          {item.createdBy ? <b>{item.createdBy.display}&nbsp;&nbsp;</b> : null}
                          {item.createdAt
                            ? formatDistanceToNow(new Date(item.createdAt), {
                                addSuffix: false,
                              })
                            : null}
                        </Typography>
                        <IconButton
                          color="inherit"
                          size="small"
                          className="absolute top-0 right-[1rem]"
                          onClick={() => handleUnPin(item)}
                        >
                          <FuseSvgIcon size={14}>heroicons-outline:x</FuseSvgIcon>
                        </IconButton>
                      </StyledMessageRow>
                    </div>
                  );
                })}
              </div>
            </Fade>
          </Box>
        )}
      </div>

      <div className="flex flex-auto min-h-0 h-full w-full">
        <div className="flex flex-1 z-10 flex-col max-w-[400px]">
          <FuseScrollbars ref={chatScroll} className="flex flex-1 flex-col overflow-y-scroll">
            <div className="flex flex-col h-full">
              {(!tcMessageList || tcMessageList.length <= 0) && (
                <div className="flex flex-col flex-1 items-center justify-center p-24 w-full">
                  <FuseSvgIcon size={128} color="disabled">
                    heroicons-outline:chat
                  </FuseSvgIcon>
                  <Typography className="px-16 pb-24 mt-24 text-center " color="text.secondary">
                    No Comment.
                  </Typography>
                </div>
              )}
              <div className="flex flex-col pt-16 pb-120">
                {tcMessageList.map((item, i) => {
                  let textMessage = '';
                  if (item.type && item.type === 'text') {
                    textMessage = FuseUtils.formatMentionToText(JSON.parse(item.data).text);
                  } else if (item.type === 'file') {
                    textMessage = 'File';
                  } else if (item.type === 'image') {
                    textMessage = 'Image';
                  } else {
                    textMessage = 'Unknown type';
                  }
                  return (
                    <StyledMessageRow
                      key={i}
                      id={item.id}
                      className={clsx(
                        { me: item?.createdBy.id === uuid },
                        { contact: item?.createdBy.id !== uuid },
                        { 'first-of-group': isFirstMessageOfGroup(item, i) },
                        { 'last-of-group': isLastMessageOfGroup(item, i) }
                      )}
                    >
                      <div className="bubble shadow max-w-[90%]">
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
                              {textMessage}
                            </span>
                          </Linkify>
                        )}
                        {item.type && item.type === 'image' && (
                          <div className="message">
                            <img
                              src={JSON.parse(item.data).url}
                              alt={item.id}
                              className="h-auto min-w-0"
                            />
                          </div>
                        )}
                        <Typography className="time" color="textSecondary">
                          {item.createdBy ? <b>{item.createdBy.display}&nbsp;&nbsp;</b> : null}
                          {item.createdAt
                            ? formatDistanceToNow(new Date(item.createdAt), {
                                addSuffix: false,
                              })
                            : null}
                        </Typography>

                        {item.isPin ? (
                          <Button
                            variant="text"
                            size="small"
                            className="text-gray absolute pinned"
                            startIcon={
                              <PushPinRoundedIcon htmlColor="#5dd4fcc7" fontSize="small" />
                            }
                            onClick={() => handleUnPin(item)}
                          >
                            Pinned
                          </Button>
                        ) : (
                          <Button
                            variant="contained"
                            size="small"
                            className="text-white bg-[#00bfff8a] hover:bg-[#5dd4fc60] pin absolute"
                            startIcon={<PushPinRoundedIcon htmlColor="white" fontSize="small" />}
                            onClick={() => handlePin(item)}
                          >
                            Pin
                          </Button>
                        )}
                      </div>
                    </StyledMessageRow>
                  );
                })}
              </div>
            </div>
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
          >
            <div className=" flex space-x-4 items-center relative break-word overflow-x-hidden">
              <div className="flex-none">
                {fileLoading ? (
                  <div className="p-12">
                    <CircularProgress color="inherit" size={24} />
                  </div>
                ) : (
                  <IconButton size="large" component="label">
                    <input
                      hidden
                      accept="image/gif, image/png, image/jpeg, video/mp4, application/pdf, application/msword, application/vnd.ms-excel,application/vnd.ms-powerpoint, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,
                        application/vnd.openxmlformats-officedocument.presentationml.slideshow,
                        application/vnd.openxmlformats-officedocument.presentationml.presentation"
                      onChange={handlerTeamChatFileInput}
                      type="file"
                    />
                    <FuseSvgIcon>heroicons-outline:paper-clip</FuseSvgIcon>
                  </IconButton>
                )}
              </div>
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
              <div className="flex-none">
                <IconButton
                  className=""
                  onClick={onMessageSubmit}
                  size="large"
                  disabled={fileLoading}
                >
                  <FuseSvgIcon className="rotate-90" color="action">
                    heroicons-outline:paper-airplane
                  </FuseSvgIcon>
                </IconButton>
              </div>
            </div>
          </Paper>
        </div>
      </div>
    </div>
  );
};

export default CommentSidebar;
