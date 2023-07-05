import { useContext, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import clsx from 'clsx';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

import { styled } from '@mui/material/styles';
import { Avatar, AvatarGroup, Divider, Tooltip, Typography } from '@mui/material/';

import FuseUtils from '@fuse/utils/FuseUtils';
import { selectUsers } from '../store/directMessageUsersSlice';

import { selectThreadData, setThreadId } from '../store/threadSlice';
import TeamChatAppContext from '../TeamChatAppContext';
import VideoPlayer from './videoPlayer';
import FileViewer from './fileViewer';
import TextViewer from './textViewer';
import ImageViewer from './imageViewer';

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
    '& .bubble': {
      backgroundColor: '#64748B',
      // backgroundColor: theme.palette.secondary.light,
      color: theme.palette.secondary.contrastText,
      borderTopLeftRadius: 5,
      borderBottomLeftRadius: 5,
      borderTopRightRadius: 20,
      borderBottomRightRadius: 20,
    },
  },
  '&.me': {
    '& .hiddenAvatar': {
      visibility: 'hidden',
    },
    '& .replies': {
      flexDirection: 'row-reverse',
    },
    '& .bubble': {
      backgroundColor: '#2559C7',
      // backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.contrastText,
      borderRadius: 10,
      placeSelf: 'flex-end',
    },
    '& .time': {
      placeSelf: 'self-end',
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
const ReplyMessage = (props) => {
  const { item, loginUser, messages } = props;
  const dispatch = useDispatch();
  const messageRef = useRef(null);
  const {
    setContactSidebarOpen,
    setMemberSidebarOpen,
    setHqPinSidebarOpen,
    setCmPinSidebarOpen,
    setDmPinSidebarOpen,
    setThreadSidebarOpen,
    setHqThreadsSidebarOpen,
    setCmThreadsSidebarOpen,
    setDmThreadsSidebarOpen,
  } = useContext(TeamChatAppContext);
  const users = useSelector(selectUsers);
  const replies = useSelector(selectThreadData);

  const threadsMessage = useMemo(
    () => messages.filter((message) => !message.isDelete && message.isReply),
    [messages]
  );
  const threadIds = useMemo(
    () =>
      threadsMessage.map((msg) => {
        return msg.id;
      }),
    [threadsMessage]
  );

  useEffect(() => {
    setContactSidebarOpen(false);
    setMemberSidebarOpen(false);
    setHqPinSidebarOpen(false);
    setCmPinSidebarOpen(false);
    setDmPinSidebarOpen(false);
    setHqThreadsSidebarOpen(false);
    setCmThreadsSidebarOpen(false);
    setDmThreadsSidebarOpen(false);
  }, [
    dispatch,
    setCmPinSidebarOpen,
    setCmThreadsSidebarOpen,
    setContactSidebarOpen,
    setDmPinSidebarOpen,
    setDmThreadsSidebarOpen,
    setHqPinSidebarOpen,
    setHqThreadsSidebarOpen,
    setMemberSidebarOpen,
  ]);

  if (!item || !replies[item.id] || !replies[item.id][0]) {
    return null;
  }

  return (
    <StyledMessageRow
      className={clsx(
        'flex grow-0 shrink-0 items-start justify-end relative chat-row -translate-x-1/2 left-1/2 max-w-[950px] pb-20',
        replies[item.id][0].createdBy.id === loginUser.uuid ? 'me' : 'contact'
      )}
    >
      <Avatar
        src={replies[item.id][0].createdBy.pictureURL}
        alt={replies[item.id][0].createdBy.display}
        className="w-[3rem] h-[3rem] mr-10 hiddenAvatar"
      />
      <div className="flex flex-col w-full">
        <div
          className={clsx(
            'bubble flex flex-col relative justify-center max-w-[90%] shadow text-field-channel'
          )}
        >
          <div className="flex p-10 space-x-10">
            <Avatar
              src={item.createdBy ? item.createdBy.pictureURL : item.sendUser.pictureURL}
              alt={item.createdBy ? item.createdBy.display : item.sendUser.display}
              className="w-[3rem] h-[3rem]"
            >
              {item.createdBy ? item.createdBy.display.charAt(0) : item.sendUser.display.charAt(0)}
            </Avatar>
            <div className="flex flex-col w-full max-w-[90%]">
              <Typography className="text-12 font-semibold">
                {item.createdBy ? item.createdBy.display : item.sendUser.display}
              </Typography>
              {item.type && item.type === 'text' && <TextViewer item={item} reply />}
              {item.type && item.type === 'image' && <ImageViewer item={item} />}
              {item.type && item.type === 'video' && <VideoPlayer item={item} />}
              {item.type && item.type === 'file' && <FileViewer item={item} />}
              {item.isEdit ? (
                <Typography className="text-12 text-grey-300 ml-5">(Edited)</Typography>
              ) : null}
            </div>
          </div>
          <Divider className="border-[#E5E5E5]" />
          <div className="p-10">
            {replies[item.id][0].type && replies[item.id][0].type === 'text' && (
              <TextViewer item={replies[item.id][0]} />
            )}
            {replies[item.id][0].type && replies[item.id][0].type === 'image' && (
              <ImageViewer item={replies[item.id][0]} />
            )}
            {replies[item.id][0].type && replies[item.id][0].type === 'video' && (
              <VideoPlayer item={replies[item.id][0]} />
            )}
            {replies[item.id][0].type && replies[item.id][0].type === 'file' && (
              <FileViewer item={replies[item.id][0]} />
            )}
          </div>
        </div>
        <div
          className="replies flex items-center cursor-pointer text-11 mt-8 space-x-5"
          onClick={() => {
            dispatch(
              setThreadId({
                messageText: item,
                createdBy: item.createdBy ? item.createdBy : item.sendUser,
                createdAt: item.createdAt,
                threadId: item.id,
                type: item.type,
              })
            );
            setThreadSidebarOpen(true);
          }}
          aria-hidden="true"
        >
          <FuseSvgIcon className="flex flex-col min-w-[16px] min-h-[16px]" size={16} color="action">
            {replies[item.id][0].createdBy.id === loginUser.uuid
              ? 'material-outline:subdirectory_arrow_left'
              : 'material-outline:subdirectory_arrow_right'}
          </FuseSvgIcon>
          <Typography className="flex flex-col text-12 text-blue-600">
            {replies[item.id].length !== 1 ? `${replies[item.id].length} replies` : `1 reply`}
          </Typography>
          <AvatarGroup max={4} classes={{ avatar: 'w-20 h-20 text-10 -ml-2' }}>
            {FuseUtils.removeDuplicateMembers(replies[item.id]).map((member) => {
              return (
                <Tooltip title={member.createdBy.display} key={member.createdBy.id}>
                  <Avatar src={member.createdBy.pictureURL} alt={member.createdBy.display}>
                    {member.createdBy.display.charAt(0)}
                  </Avatar>
                </Tooltip>
              );
            })}
          </AvatarGroup>
        </div>
        <Typography className="time text-11 mt-4" color="textSecondary">
          {replies[item.id][0].createdBy ? (
            <b>{replies[item.id][0].createdBy.display}&nbsp;&nbsp;</b>
          ) : null}
          {replies[item.id][0].createdAt
            ? formatDistanceToNow(new Date(replies[item.id][0].createdAt), {
                addSuffix: false,
              })
            : null}
        </Typography>
      </div>
    </StyledMessageRow>
  );
};

export default ReplyMessage;
