import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import clsx from 'clsx';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { convertToRaw, EditorState } from 'draft-js';
import FuseUtils from '@fuse/utils/FuseUtils';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import { styled } from '@mui/material/styles';
import AddPhotoAlternate from '@mui/icons-material/AddPhotoAlternate';
import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { MentionEditor } from 'app/shared-components/chat';
import { markMentionRead, sendTeamChatFileMessage, sendTeamChatMessage } from '../store/chatSlice';
import ReadMoreContent from '../components/ReadMore';
import firebaseAuthService from '../../../../auth/services/firebaseService/firebaseAuthService';

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
    marginTop: 8,
    top: '100%',
    left: 0,
    whiteSpace: 'nowrap',
  },

  '&.contact': {
    '& .bubble': {
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.getContrastText(theme.palette.background.paper),
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

    '& .avatar': {
      order: 2,
      margin: '0 0 0 16px',
    },

    '& .bubble': {
      marginLeft: 'auto',
      backgroundColor: theme.palette.primary.main,
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

const MentionStyle = {
  control: {
    // backgroundColor: '#fff',
    fontSize: 14,
    fontWeight: 'normal',
  },

  '&multiLine': {
    control: {
      fontFamily: 'monospace',
      minHeight: 63,
    },
    highlighter: {
      padding: 9,
      // border: '1px solid transparent',
    },
    input: {
      padding: 9,
      border: '1px solid silver',
    },
  },

  '&singleLine': {
    display: 'inline-block',
    width: 180,

    highlighter: {
      padding: 1,
      // border: '2px inset transparent',
    },
    input: {
      padding: 1,
      // border: '2px inset',
    },
  },

  suggestions: {
    list: {
      // backgroundColor: 'white',
      // border: '1px solid rgba(0,0,0,0.15)',
      fontSize: 14,
    },
    item: {
      padding: '5px 15px',
      borderBottom: '1px solid rgba(0,0,0,0.15)',
      '&focused': {
        backgroundColor: '#bebebe',
      },
    },
  },
};

const TeamChat = (props) => {
  const dispatch = useDispatch();

  const chatScrollRef = useRef(null);
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const [userList, setUserList] = useState([]);
  const [tcMessageList, setTCMessageList] = useState([]);
  const [fileLoading, setFileLoading] = useState(false);

  const { selected, selectType } = useSelector(({ todoApp }) => todoApp.current);
  const customer = useSelector(({ todoApp }) => todoApp.customer.customer);
  const userId = useSelector(({ user }) => user.uuid);
  const org = useSelector(({ auth }) => auth.organization.organization);

  useEffect(() => {
    if (props.expanded) dispatch(markMentionRead());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.expanded]);

  useEffect(() => {
    scrollToBottom();
  }, [customer]);

  useEffect(() => {
    if (selected) {
      getUserList();
    }
    if (selected && selected.teamChat && selected.teamChat.length) {
      setTCMessageList(selected.teamChat);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  // Chat Owner handle
  const getUserList = async () => {
    const token = await firebaseAuthService.getAccessToken();
    if (!token) return;
    const response = await axios.get(`/api/${org.id}/user/list`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const userListResult = await response.data;
    const usersMention = await userListResult.map((item) => {
      return {
        ...item.user,
        userId: item.user.id,
        id: item.user.email,
        display: `${item.user.firstname} ${item.user.lastname}`,
      };
    });
    if (usersMention) setUserList(usersMention);
  };

  function scrollToBottom() {
    if (chatScrollRef && chatScrollRef.current && chatScrollRef.current.scrollHeight)
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }

  return (
    <Paper
      className={clsx('flex flex-col relative pb-64 shadow h-full', props.className)}
      sx={{ background: (theme) => theme.palette.background.default }}
    >
      {useMemo(() => {
        const shouldShowContactAvatar = (item, i) => {
          return (
            item.createdBy.id === customer.id &&
            ((tcMessageList[i + 1] && tcMessageList[i + 1].createdBy.id !== customer.id) ||
              !tcMessageList[i + 1])
          );
        };
        const isFirstMessageOfGroup = (item, i) => {
          return (
            i === 0 ||
            (tcMessageList[i - 1] && tcMessageList[i - 1].createdBy.id !== item.createdBy.id)
          );
        };
        const isLastMessageOfGroup = (item, i) => {
          return (
            i === tcMessageList.length - 1 ||
            (tcMessageList[i + 1] && tcMessageList[i + 1].createdBy.id !== item.createdBy.id)
          );
        };

        const handlerTeamChatFileInput = async (event) => {
          setFileLoading(true);
          const formData = new FormData();
          formData.append('file', event.target.files[0]);

          dispatch(sendTeamChatFileMessage({ formData, chat: selected })).then(() => {
            setTimeout(() => {
              setFileLoading(false);
            }, 5000);
          });
        };

        const onMessageSubmit = (ev) => {
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
            sendTeamChatMessage({
              messageText,
              chat: selected,
            })
          ).then(() => {
            setEditorState(EditorState.createEmpty());
          });
        };

        if (selectType !== 'chat') {
          return null;
        }

        return (
          <>
            <FuseScrollbars
              ref={chatScrollRef}
              className="flex flex-1 flex-col overflow-y-auto overscroll-contain pb-16"
              // option={{ suppressScrollX: true, wheelPropagation: false }}
            >
              {!tcMessageList && (
                <div className="flex flex-col flex-1 items-center justify-center p-24">
                  <Icon className="text-128" color="disabled">
                    chat
                  </Icon>
                  <Typography className="px-16 pb-24 mt-24 text-center" color="textSecondary">
                    No Team Chat conversation.
                  </Typography>
                </div>
              )}

              {tcMessageList.length > 0 && (
                <div className="flex flex-col pt-16 ltr:pl-40 rtl:pr-40 pb-40">
                  {tcMessageList.map((item, i) => {
                    return (
                      <StyledMessageRow
                        key={item.createdAt}
                        className={clsx(
                          { me: item.createdBy.id === userId },
                          { contact: item.createdBy.id !== userId },
                          { 'first-of-group': isFirstMessageOfGroup(item, i) },
                          { 'last-of-group': isLastMessageOfGroup(item, i) }
                        )}
                      >
                        {/* {shouldShowContactAvatar(item, i) && <Avatar className="avatar" src={contact.avatar} />} */}
                        <div className="bubble shadow">
                          {/* <div className="message">{item.message}</div> */}
                          {item.type && item.type === 'text' && (
                            <div className="message">
                              {/* <div dangerouslySetInnerHTML={{ __html: textMessage }} /> */}
                              <ReadMoreContent text={JSON.parse(item.data).text} limit={30} />
                            </div>
                          )}
                          {item.type && item.type === 'image' && (
                            <div className="message">
                              <img
                                src={JSON.parse(item.data).url}
                                alt={item.id}
                                className="max-w-xs"
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
                        </div>
                      </StyledMessageRow>
                    );
                  })}
                </div>
              )}

              {tcMessageList.length === 0 && (
                <div className="flex flex-col flex-1">
                  <div className="flex flex-col flex-1 items-center justify-center">
                    <Icon className="text-128" color="disabled">
                      chat
                    </Icon>
                  </div>
                  <Typography className="px-16 pb-24 text-center" color="textSecondary">
                    Start a conversation by typing your message below.
                  </Typography>
                </div>
              )}
            </FuseScrollbars>
            {selected && (
              <form
                onSubmit={onMessageSubmit}
                className="pb-16 px-8 absolute bottom-64 left-0 right-0"
              >
                <Paper className="rounded-24 flex items-center relative shadow">
                  <MentionEditor
                    editorState={editorState}
                    setEditorState={setEditorState}
                    onMessageSubmit={onMessageSubmit}
                    options={
                      userList &&
                      userList.map((user) => ({
                        ...user,
                        link: user.email,
                        name: user.display,
                      }))
                    }
                  />
                  {/* <MentionsInput
                    singleLine
                    value={messageText}
                    onChange={onInputChange}
                    style={MentionStyle}
                    disabled={fileLoading}
                    placeholder="Type your message"
                    a11ySuggestionsListLabel="Suggested mentions"
                    className="flex flex-1 flex-grow flex-shrink-0 mx-16 ltr:mx-48 rtl:mx-48 my-8"
                  >
                    <Mention trigger="@" data={userList} />
                  </MentionsInput> */}
                  <IconButton
                    disabled={fileLoading}
                    className="absolute ltr:right-0 rtl:left-0 top-0 p-6 mx-6"
                    type="submit"
                    size="large"
                  >
                    <Icon className="text-24" color="action">
                      send
                    </Icon>
                  </IconButton>

                  <input
                    accept="image/gif, image/png, image/jpeg, video/mp4"
                    onChange={handlerTeamChatFileInput}
                    className="hidden"
                    id="tcFile"
                    type="file"
                  />

                  {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                  <label htmlFor="tcFile">
                    <IconButton
                      className="absolute ltr:left-0 rtl:right-0 top-0 p-6 mx-6"
                      aria-label="upload picture"
                      component="span"
                      size="large"
                    >
                      {fileLoading ? <CircularProgress size={24} /> : <AddPhotoAlternate />}
                    </IconButton>
                  </label>
                </Paper>
              </form>
            )}
          </>
        );
      }, [
        selectType,
        tcMessageList,
        selected,
        editorState,
        userList,
        fileLoading,
        customer.id,
        dispatch,
        userId,
      ])}
    </Paper>
  );
};

export default TeamChat;
