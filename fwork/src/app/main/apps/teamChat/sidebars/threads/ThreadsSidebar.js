/* eslint-disable no-undef */
/* eslint-disable no-nested-ternary */
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import {
  Avatar,
  AvatarGroup,
  Box,
  IconButton,
  Paper,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';

import { lighten, styled } from '@mui/material/styles';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import FuseUtils from '@fuse/utils/FuseUtils';

import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import clsx from 'clsx';
import { useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useThemeMediaQuery } from '@fuse/hooks';
import TeamChatAppContext from '../../TeamChatAppContext';
import TextViewer from '../../components/textViewer';
import ImageViewer from '../../components/imageViewer';
import VideoPlayer from '../../components/videoPlayer';
import FileViewer from '../../components/fileViewer';
import { setThreadId } from '../../store/threadSlice';
import { setCmReplyMessage } from '../../store/channelSlice';
import { setDmReplyMessage } from '../../store/directMessageSlice';
import { setHqReplyMessage } from '../../store/hqSlice';

const StyledMessageRow = styled('div')(({ theme }) => ({
  '&.contact': {
    '& .bubble': {
      backgroundColor: '#64748B',
      // backgroundColor: theme.palette.secondary.light,
      color: theme.palette.secondary.contrastText,
    },
  },
  '&.me': {
    '& .bubble': {
      backgroundColor: '#2559C7',
      // backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.contrastText,
    },
  },
}));

const ThreadsSidebar = (props) => {
  const { threadsMessage, loginUser, replies } = props;
  const dispatch = useDispatch();
  const { channelId, contactId } = useParams();
  const chatScroll = useRef(null);
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
    setThreadsSidebarOpen,
    setPinsSidebarOpen,
  } = useContext(TeamChatAppContext);

  const unReply = (index) => {
    if (channelId) {
      dispatch(
        setCmReplyMessage({
          message: { id: index, isReply: false },
          channelId,
        })
      );
    } else if (contactId) {
      dispatch(
        setDmReplyMessage({
          message: { id: index, isReply: false },
          contactId,
        })
      );
    } else {
      dispatch(
        setHqReplyMessage({
          id: index,
          isReply: false,
        })
      );
    }
  };

  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('sm'));

  return (
    <div
      className={clsx(
        isMobile ? 'w-[85vw]' : 'w-full',
        'flex flex-col h-screen sm:h-[calc(100vh-64px)] overflow-hidden'
      )}
    >
      <Box
        className="border-b-1 w-full flex flex-col"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? lighten(theme.palette.background.default, 0.4)
              : lighten(theme.palette.background.default, 0.02),
        }}
      >
        <Toolbar className="flex items-center justify-between px-10">
          <div className="flex flex-row justify-start space-x-5 items-center">
            <Typography className="px-4 font-medium text-16" variant="subtitle1">
              Threads
            </Typography>
          </div>
          <IconButton
            onClick={() => {
              setContactSidebarOpen(false);
              setMemberSidebarOpen(false);
              setHqPinSidebarOpen(false);
              setCmPinSidebarOpen(false);
              setDmPinSidebarOpen(false);
              setThreadSidebarOpen(false);
              setHqThreadsSidebarOpen(false);
              setCmThreadsSidebarOpen(false);
              setDmThreadsSidebarOpen(false);
              setThreadsSidebarOpen(false);
              setPinsSidebarOpen(false);
            }}
            color="inherit"
            size="large"
          >
            <FuseSvgIcon>heroicons-outline:x</FuseSvgIcon>
          </IconButton>
        </Toolbar>
      </Box>
      <div className="flex flex-col overflow-y-scroll">
        <FuseScrollbars
          ref={chatScroll}
          className="flex flex-1 flex-col"
          option={{ suppressScrollX: true, wheelPropagation: false }}
        >
          <div className="flex flex-col w-full py-10 px-[1.5rem]">
            {threadsMessage
              .sort((a, b) => {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
              })
              .map((item, i) => {
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
                    className={clsx(
                      item.createdBy
                        ? item.createdBy.id === loginUser.uuid
                          ? 'me'
                          : 'contact'
                        : item.sendUser.id === loginUser.uuid
                        ? 'me'
                        : 'contact'
                    )}
                  >
                    <Paper
                      className="w-full rounded-10 shadow flex flex-col justify-between p-10 mb-16 cursor-pointer"
                      sx={{
                        backgroundColor: (theme) =>
                          theme.palette.mode === 'light'
                            ? lighten(theme.palette.background.default, 0.4)
                            : lighten(theme.palette.background.default, 0.02),
                      }}
                    >
                      <div className="flex justify-end items-center">
                        <IconButton color="inherit" size="small" onClick={() => unReply(item.id)}>
                          <FuseSvgIcon size={15} className="min-w-[15px] min-h-[15px]">
                            heroicons-outline:x
                          </FuseSvgIcon>
                        </IconButton>
                      </div>
                      <div
                        className="pt-5 flex space-x-5"
                        onClick={() => {
                          dispatch(
                            setThreadId({
                              messageText: item,
                              createdBy: item.createdBy ? item.createdBy : item.sendUser,
                              createdAt: item.createdAt,
                              threadId: item.id,
                              type: item.type,
                              channelId,
                              contactId,
                            })
                          );
                          setThreadSidebarOpen(true);
                          setContactSidebarOpen(false);
                          setMemberSidebarOpen(false);
                          setHqPinSidebarOpen(false);
                          setCmPinSidebarOpen(false);
                          setDmPinSidebarOpen(false);
                          setHqThreadsSidebarOpen(false);
                          setCmThreadsSidebarOpen(false);
                          setDmThreadsSidebarOpen(false);
                        }}
                        aria-hidden="true"
                      >
                        <Avatar
                          src={
                            item.createdBy ? item.createdBy.pictureURL : item.sendUser.pictureURL
                          }
                          alt={item.createdBy ? item.createdBy.display : item.sendUser.display}
                          className="w-24 h-24"
                        >
                          {item.createdBy
                            ? item.createdBy.display.charAt(0)
                            : item.sendUser.display.charAt(0)}
                        </Avatar>
                        <div className="flex flex-col w-full">
                          <div className="bubble shadow flex w-full p-10 rounded-12 line-clamp-2">
                            {item.type && item.type === 'text' && <TextViewer item={item} />}
                            {item.type && item.type === 'image' && <ImageViewer item={item} />}
                            {item.type && item.type === 'video' && <VideoPlayer item={item} />}
                            {item.type && item.type === 'file' && <FileViewer item={item} />}
                          </div>
                          <div className="flex justify-between items-center pt-5">
                            <div className="flex space-x-5 items-center">
                              <FuseSvgIcon
                                className="min-w-[16px] min-h-[16px]"
                                size={16}
                                color="action"
                              >
                                material-outline:subdirectory_arrow_right
                              </FuseSvgIcon>
                              <Typography className="flex text-12 text-blue-600">
                                {replies[item.id].length !== 1
                                  ? `${replies[item.id].length} replies`
                                  : `1 reply`}
                              </Typography>
                              <AvatarGroup max={4} classes={{ avatar: 'w-20 h-20 text-10 -ml-2' }}>
                                {FuseUtils.removeDuplicateMembers(replies[item.id]).map(
                                  (member) => {
                                    return (
                                      <Tooltip
                                        title={member.createdBy.display}
                                        key={member.createdBy.id}
                                      >
                                        <Avatar
                                          src={member.createdBy.pictureURL}
                                          alt={member.createdBy.display}
                                        >
                                          {member.createdBy.display.charAt(0)}
                                        </Avatar>
                                      </Tooltip>
                                    );
                                  }
                                )}
                              </AvatarGroup>
                            </div>
                            <Typography className="text-11" color="textSecondary">
                              {item.createdAt &&
                                `${formatDistanceToNow(new Date(item.createdAt), {
                                  addSuffix: false,
                                })}`}
                            </Typography>
                          </div>
                        </div>
                      </div>
                    </Paper>
                  </StyledMessageRow>
                );
              })}
          </div>
        </FuseScrollbars>
      </div>
    </div>
  );
};

export default ThreadsSidebar;
