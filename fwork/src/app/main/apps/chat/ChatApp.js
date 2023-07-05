import { useCallback, useEffect, useContext, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet, useLocation, useParams } from 'react-router-dom';

import { styled } from '@mui/material/styles';
import FusePageSimple from '@fuse/core/FusePageSimple';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';

import { clearChat } from './store/chatsSlice';
import { getChannelsforSocket } from './store/channelsSlice';
import {getLabelOptionsforSocket } from './store/labelsSlice';
import {getUserOptionsforSocket} from './store/usersSlice';

import MainSidebar from './sidebars/main/MainSidebar';
import RightSidebarContent from './RightSidebarContent';
import ChatAppContext from './ChatAppContext';
import {SocketContext} from '../../../context/socket';
const Root = styled(FusePageSimple)(({ theme }) => ({
  '& .FusePageSimple-content': {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 100%',
    height: '100%',
  },
  '& .FusePageSimple-sidebarContent': {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
}));

const ChatApp = (props) => {
  const dispatch = useDispatch();
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [mainSidebarOpen, setMainSidebarOpen] = useState(!isMobile);
  const [customerSidebarOpen, setCustomerSidebarOpen] = useState(false);
  const [commentSidebarOpen, setCommentSidebarOpen] = useState(false);
  const location = useLocation();
  const routeParams = useParams();
  const socket = useContext(SocketContext);

  useEffect(()=>{
    socket.on("getChannels response", res=>{
      dispatch(getChannelsforSocket(res))
    })
    socket.on("getUserOptions response", res=>{
      dispatch(getUserOptionsforSocket(res))
    })
    socket.on("getLabelOptions response", res=>{
      dispatch(getLabelOptionsforSocket(res))
    })
  },[socket])
  useEffect(() => {
    const organization = window.localStorage.getItem('organization');
    socket.emit("getChannels",JSON.parse(organization).organizationId)
    socket.emit("getUserOptions",JSON.parse(organization).organizationId)
    socket.emit("getLabelOptions",JSON.parse(organization).organizationId)
    return () => {
      dispatch(clearChat());
    };
  }, [dispatch]);

  useEffect(() => {
    setMainSidebarOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      if (routeParams.id) {
        setMainSidebarOpen(false);
      } else {
        setMainSidebarOpen(true);
      }
    }
    if (location.hash) {
      setCommentSidebarOpen(true);
    }
  }, [location, isMobile, routeParams.id]);

  const handleCommentSidebarOpen = useCallback(() => {
    setCustomerSidebarOpen(false);
    setCommentSidebarOpen(true);
  }, []);
  const handleCustomerSidebarOpen = useCallback(() => {
    setCustomerSidebarOpen(true);
    setCommentSidebarOpen(false);
  }, []);
  const handleRightSidebarClose = useCallback(() => {
    setCustomerSidebarOpen(false);
    setCommentSidebarOpen(false);
  }, []);

  const ChatAppProviderValue = useMemo(
    () => ({
      setMainSidebarOpen,
      customerSidebarOpen,
      commentSidebarOpen,
      handleCommentSidebarOpen,
      handleCustomerSidebarOpen,
      handleRightSidebarClose,
    }),
    [
      setMainSidebarOpen,
      customerSidebarOpen,
      commentSidebarOpen,
      handleCommentSidebarOpen,
      handleCustomerSidebarOpen,
      handleRightSidebarClose,
    ]
  );

  return (
    <ChatAppContext.Provider value={ChatAppProviderValue}>
      <Root
        content={<Outlet />}
        leftSidebarContent={<MainSidebar />}
        leftSidebarOpen={mainSidebarOpen}
        leftSidebarOnClose={() => {
          setMainSidebarOpen(false);
        }}
        leftSidebarWidth={400}
        rightSidebarContent={<RightSidebarContent />}
        rightSidebarOpen={Boolean(commentSidebarOpen || customerSidebarOpen)}
        rightSidebarOnClose={() => {
          setCustomerSidebarOpen(false);
          setCommentSidebarOpen(false);
        }}
        rightSidebarWidth={400}
        scroll="content"
      />
    </ChatAppContext.Provider>
  );
};

export default ChatApp;
