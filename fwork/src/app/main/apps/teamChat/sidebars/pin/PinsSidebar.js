/* eslint-disable no-nested-ternary */
import { useContext, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Box, IconButton, Paper, Toolbar, Typography } from '@mui/material';

import { lighten, styled } from '@mui/material/styles';
import { selectUser } from 'app/store/userSlice';
import FuseScrollbars from '@fuse/core/FuseScrollbars';

import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import clsx from 'clsx';
import { useParams } from 'react-router-dom';
import { useThemeMediaQuery } from '@fuse/hooks';
import TeamChatAppContext from '../../TeamChatAppContext';
import TextViewer from '../../components/textViewer';
import ImageViewer from '../../components/imageViewer';
import VideoPlayer from '../../components/videoPlayer';
import FileViewer from '../../components/fileViewer';
import { setCmPinMessage } from '../../store/channelSlice';
import { setDmReplyMessage } from '../../store/directMessageSlice';
import { setHqPinMessage } from '../../store/hqSlice';

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

const PinsSidebar = (props) => {
  const dispatch = useDispatch();
  const { messages } = props;
  const { channelId, contactId } = useParams();
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
  const loginUser = useSelector(selectUser);

  const chatScroll = useRef(null);

  let pinMessage = [];
  pinMessage = messages
    .filter((message) => !message.isDelete && message.isPin)
    .sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const HrefLink = (index) => {
    if (channelId) {
      return `apps/teamChat/${channelId}/#${index}`;
    }
    if (contactId) {
      return `apps/teamChat/dm/${contactId}/#${index}`;
    }
    return `apps/teamChat/hq/#${index}`;
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
              Pins
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
            {pinMessage.map((item, i) => (
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
                    <IconButton
                      onClick={() => {
                        if (channelId) {
                          dispatch(
                            setCmPinMessage({
                              message: { id: item.id, isPin: false },
                              channelId,
                            })
                          );
                        } else if (contactId) {
                          dispatch(
                            setDmReplyMessage({
                              message: { id: item.id, isPin: false },
                              contactId,
                            })
                          );
                        } else {
                          dispatch(
                            setHqPinMessage({
                              id: item.id,
                              isPin: false,
                            })
                          );
                        }
                      }}
                      color="inherit"
                      size="small"
                    >
                      <FuseSvgIcon size={15} className="min-w-[15px] min-h-[15px]">
                        heroicons-outline:x
                      </FuseSvgIcon>
                    </IconButton>
                  </div>
                  <a
                    className="bubble shadow flex flex-col w-full p-10 rounded-20"
                    style={{ textDecoration: 'none' }}
                    href={HrefLink(item.id)}
                    aria-hidden="true"
                  >
                    {item.type && item.type === 'text' && <TextViewer item={item} />}
                    {item.type && item.type === 'image' && <ImageViewer item={item} />}
                    {item.type && item.type === 'video' && <VideoPlayer item={item} />}
                    {item.type && item.type === 'file' && <FileViewer item={item} />}
                  </a>
                  <Typography className="time text-11 mt-5 ml-5" color="textSecondary">
                    {item.createdBy ? (
                      <b>{item.createdBy.display}&nbsp;&nbsp;</b>
                    ) : (
                      <b>{item.sendUser.display}&nbsp;&nbsp;</b>
                    )}
                    {item.createdAt
                      ? formatDistanceToNow(new Date(item.createdAt), {
                          addSuffix: false,
                        })
                      : null}
                  </Typography>
                </Paper>
              </StyledMessageRow>
            ))}
          </div>
        </FuseScrollbars>
      </div>
    </div>
  );
};

export default PinsSidebar;
