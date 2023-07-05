import FuseScrollbars from '@fuse/core/FuseScrollbars';
import FuseUtils from '@fuse/utils';
import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Icon from '@mui/material/Icon';
import AddCommentIcon from '@mui/icons-material/AddComment';
import AddPhotoAlternate from '@mui/icons-material/AddPhotoAlternate';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Input from '@mui/material/Input';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import Popover from '@mui/material/Popover';
import Divider from '@mui/material/Divider';

import clsx from 'clsx';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getChatMessage, sendFileMessage, sendMessage } from './store/chatSlice';
import { addSendingMessage } from './store/currentSlice';

import QuickReplyContent from './components/QuickReplyContent';
import ReadMoreContent from './components/ReadMore';

const StyledMessageRow = styled('div')(({ theme }) => ({
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

const TodoChat = (props) => {
  const dispatch = useDispatch();
  const chatRef = useRef(null);

  const selected = useSelector(({ todoApp }) => todoApp.current.selected);
  const [seemoreFlg, setSeemoreFlg] = useState(false);
  const [isBottom, setIsBottom] = useState(false);
  const [chatFileLoading, setChatFileLoading] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    if (selected && !isBottom) {
      scrollToBottom();
    }
  }, [selected]);

  const onImgLoaded = () => {
    // scrollToBottom();
  };

  function seeMoreAction() {
    setSeemoreFlg(true);
    dispatch(getChatMessage({ chatId: selected.id, pNum: selected.pageNumber })).then((payload) => {
      setSeemoreFlg(false);
    });
  }

  function scrollToBottom() {
    if (chatRef && chatRef.current && chatRef.current.scrollHeight) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
    setIsBottom(true);
  }
  function shouldShowContactAvatar(item, i) {
    return (
      item.direction === 'inbound' &&
      ((selected.message[i + 1] && selected.message[i + 1].direction !== 'inbound') ||
        !selected.message[i + 1])
    );
  }
  function isFirstMessageOfGroup(item, i) {
    return (
      i === 0 || (selected.message[i - 1] && selected.message[i - 1].direction !== item.direction)
    );
  }
  function isLastMessageOfGroup(item, i) {
    return (
      i === selected.message.length - 1 ||
      (selected.message[i + 1] && selected.message[i + 1].direction !== item.direction)
    );
  }
  function onInputChange(ev) {
    setMessageText(ev.target.value);
  }

  function onMessageSubmit(ev) {
    ev.preventDefault();
    if (messageText.trim() === '') {
      return;
    }

    dispatch(
      sendMessage({
        messageText,
        chat: selected,
      })
    ).then((payload) => {
      scrollToBottom();
    });

    dispatch(
      addSendingMessage({
        id: FuseUtils.generateGUID(),
        data: JSON.stringify({ text: messageText }),
        type: 'text',
        timestamp: new Date(),
        isError: false,
        isRead: false,
        direction: 'outbound',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );

    setMessageText('');
  }

  // Quick Reply
  const handleReplyClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleReplyClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const handlerFileUpload = (event) => {
    setChatFileLoading(true);
    const formData = new FormData();
    formData.append('file', event.target.files[0]);

    dispatch(sendFileMessage({ formData, chat: selected })).then(() => {
      setTimeout(() => {
        setChatFileLoading(false);
      }, 5000);
    });
  };

  return (
    <div className={clsx('flex flex-col relative', props.className)}>
      <FuseScrollbars ref={chatRef} className="flex flex-1 flex-col overflow-y-auto">
        {selected && selected.message.length > 0 ? (
          <>
            {selected.remainCount > 0 && !seemoreFlg ? (
              <div
                role="button"
                aria-hidden="true"
                className="text-center mt-10 cursor-pointer text-blue"
                onClick={seeMoreAction}
              >
                See more
              </div>
            ) : (
              <div className="text-center mt-10">
                <CircularProgress color="inherit" size={20} />
              </div>
            )}

            <div className="flex flex-col pt-16 px-16 ltr:pl-56 rtl:pr-56 pb-40">
              {selected.message.map((item, i) => {
                const messageObj = JSON.parse(item.data);
                return (
                  <StyledMessageRow
                    key={item.id}
                    className={clsx(
                      'flex flex-col flex-grow-0 flex-shrink-0 items-start justify-end relative px-16 pb-4',
                      { me: item.direction === 'outbound' },
                      { contact: item.direction === 'inbound' },
                      { 'first-of-group': isFirstMessageOfGroup(item, i) },
                      { 'last-of-group': isLastMessageOfGroup(item, i) },
                      i + 1 === selected.message.length && 'pb-80'
                    )}
                  >
                    {shouldShowContactAvatar(item, i) && (
                      <Avatar
                        className="avatar absolute ltr:left-0 rtl:right-0 m-0 -mx-32"
                        src={selected.customer.pictureURL}
                        alt={selected.customer.display}
                      />
                    )}
                    <div className="bubble flex relative items-center justify-center p-12 max-w-screen-sm shadow">
                      {item.type && item.type === 'image' && (
                        <img
                          src={messageObj.url}
                          alt={messageObj.id}
                          className="w-full h-auto"
                          onLoad={onImgLoaded}
                        />
                      )}
                      {item.type && item.type === 'sticker' && (
                        <img
                          src={messageObj.url}
                          alt="Sticker"
                          className="w-full h-auto"
                          onLoad={onImgLoaded}
                        />
                      )}
                      {/* {item.type && item.type === 'text' && <div className="break-all">{messageObj.text}</div>} */}
                      {item.type && item.type === 'text' && (
                        <ReadMoreContent text={messageObj.text} limit={50} />
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
          </>
        ) : (
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
      {selected && selected.status !== 'none' && (
        <form
          autoComplete="off"
          onSubmit={onMessageSubmit}
          className="absolute bottom-0 right-0 left-0 py-16 px-8"
        >
          <Paper className="flex items-center relative rounded-24 shadow">
            <Input
              autoFocus={false}
              id="message-input"
              disableUnderline
              className="flex flex-grow flex-shrink-0 mx-16 ltr:ml-96 rtl:mr-96 ltr:mr-48 rtl:ml-48 my-8"
              onChange={onInputChange}
              value={messageText}
              disabled={chatFileLoading}
              placeholder="Enter a Message"
            />
            <IconButton
              disabled={chatFileLoading}
              className="absolute ltr:right-0 rtl:left-0 top-0"
              type="submit"
              size="large"
            >
              <Icon className="text-24" color="action">
                send
              </Icon>
            </IconButton>

            <input
              accept="image/gif, image/png, image/jpeg, video/mp4"
              onChange={handlerFileUpload}
              className="hidden"
              id="icon-button-file-chat"
              type="file"
            />
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label htmlFor="icon-button-file-chat">
              <IconButton
                className="absolute ltr:left-48 rtl:right-48 top-0"
                aria-label="upload picture"
                component="span"
                size="large"
              >
                {chatFileLoading ? <CircularProgress size={24} /> : <AddPhotoAlternate />}
              </IconButton>
            </label>

            <Divider
              className="absolute ltr:left-48 rtl:right-48 top-0 h-32 my-8"
              orientation="vertical"
            />
            <IconButton
              className="absolute ltr:left-0 rtl:right-0 top-0"
              onClick={handleReplyClick}
              aria-describedby={id}
              size="large"
            >
              <AddCommentIcon />
            </IconButton>
          </Paper>

          <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleReplyClose}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
          >
            <QuickReplyContent handleReplyClose={handleReplyClose} />
          </Popover>
        </form>
      )}
    </div>
  );
};

export default TodoChat;
