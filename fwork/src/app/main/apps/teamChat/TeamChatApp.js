/* eslint-disable import/no-cycle */
import FusePageSimple from '@fuse/core/FusePageSimple';
import withReducer from 'app/store/withReducer';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import clsx from 'clsx';
import MainSidebar from './sidebars/main/MainSidebar';
import ContactSidebar from './sidebars/contact/ContactSidebar';
import MemberSidebar from './sidebars/member/MemberSidebar';
import HqPinSidebar from './sidebars/pin/HqPinSidebar';
import CmPinSidebar from './sidebars/pin/CmPinSidebar';
import DmPinSidebar from './sidebars/pin/DmPinSidebar';
import reducer from './store';

import TeamChatAppContext from './TeamChatAppContext';
import UserSidebar from './sidebars/user/UserSidebar';
import Threadsidebar from './sidebars/thread/threadsidebar';
import HqThreadsSidebar from './sidebars/threads/hqThreadsSidebar';
import CmThreadsSidebar from './sidebars/threads/cmThreadsSidebar';
import DmThreadsSidebar from './sidebars/threads/dmThreadsSidebar';

const drawerWidth = 400;

const Root = styled(FusePageSimple)(({ theme }) => ({
  '& .FusePageSimple-content': {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 100%',
    height: '100%',
  },
}));

const StyledSwipeableDrawer = styled(SwipeableDrawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    maxWidth: '100%',
    overflow: 'hidden',
    [theme.breakpoints.up('md')]: {
      position: 'relative',
    },
  },
}));

const TeamChatApp = (props) => {
  const dispatch = useDispatch();
  const { channelId, contactId, threadId } = useParams();
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('sm'));
  const [mainSidebarOpen, setMainSidebarOpen] = useState(!isMobile);
  const [contactSidebarOpen, setContactSidebarOpen] = useState(false);
  const [memberSidebarOpen, setMemberSidebarOpen] = useState(false);
  const [HqPinSidebarOpen, setHqPinSidebarOpen] = useState(false);
  const [CmPinSidebarOpen, setCmPinSidebarOpen] = useState(false);
  const [DmPinSidebarOpen, setDmPinSidebarOpen] = useState(false);
  const [userSidebarOpen, setUserSidebarOpen] = useState(false);
  const [threadSidebarOpen, setThreadSidebarOpen] = useState(false);
  const [hqThreadsSidebarOpen, setHqThreadsSidebarOpen] = useState(false);
  const [cmThreadsSidebarOpen, setCmThreadsSidebarOpen] = useState(false);
  const [dmThreadsSidebarOpen, setDmThreadsSidebarOpen] = useState(false);

  
  const location = useLocation();
  

  useEffect(() => {
    setMainSidebarOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      setMainSidebarOpen(false);
    }
  }, [location, isMobile]);
  useEffect(() => {
    if (isMobile) {
      if (channelId || contactId || threadId) {
        setMainSidebarOpen(false);
      } else {
        setMainSidebarOpen(true);
      }
    }
  }, [location, isMobile, channelId, contactId, threadId]);

  
  const TeamChatAppProvider = useMemo(
    () => ({
      setMainSidebarOpen,
      setContactSidebarOpen,
      setMemberSidebarOpen,
      setHqPinSidebarOpen,
      setCmPinSidebarOpen,
      setDmPinSidebarOpen,
      setUserSidebarOpen,
      setThreadSidebarOpen,
      setHqThreadsSidebarOpen,
      setCmThreadsSidebarOpen,
      setDmThreadsSidebarOpen,
    }),
    [
      setMainSidebarOpen,
      setContactSidebarOpen,
      setMemberSidebarOpen,
      setHqPinSidebarOpen,
      setCmPinSidebarOpen,
      setDmPinSidebarOpen,
      setUserSidebarOpen,
      setThreadSidebarOpen,
      setHqThreadsSidebarOpen,
      setCmThreadsSidebarOpen,
      setDmThreadsSidebarOpen,
    ]
  );

  return (
    <TeamChatAppContext.Provider value={TeamChatAppProvider}>
      <Root
        scroll="content"
        content={<Outlet />}
        // Main Sidebar
        leftSidebarContent={<MainSidebar />}
        leftSidebarOpen={mainSidebarOpen}
        leftSidebarOnClose={() => {
          setMainSidebarOpen(false);
        }}
        // Contact Sidebar
        leftSidebarWidth={400}
        rightSidebarContent={
          <div className={clsx(isMobile ? 'w-[85vw]' : 'w-full')}>
            {contactSidebarOpen && <ContactSidebar />}
            {memberSidebarOpen && <MemberSidebar />}
            {HqPinSidebarOpen && <HqPinSidebar />}
            {CmPinSidebarOpen && <CmPinSidebar />}
            {DmPinSidebarOpen && <DmPinSidebar />}
            {threadSidebarOpen && <Threadsidebar />}
            {hqThreadsSidebarOpen && <HqThreadsSidebar />}
            {cmThreadsSidebarOpen && <CmThreadsSidebar />}
            {dmThreadsSidebarOpen && <DmThreadsSidebar />}
          </div>
        }
        rightSidebarOpen={
          contactSidebarOpen ||
          memberSidebarOpen ||
          HqPinSidebarOpen ||
          CmPinSidebarOpen ||
          DmPinSidebarOpen ||
          threadSidebarOpen ||
          hqThreadsSidebarOpen ||
          cmThreadsSidebarOpen ||
          dmThreadsSidebarOpen
        }
        rightSidebarOnClose={() => {
          setContactSidebarOpen(false);
          setMemberSidebarOpen(false);
          setHqPinSidebarOpen(false);
          setCmPinSidebarOpen(false);
          setDmPinSidebarOpen(false);
          setThreadSidebarOpen(false);
          setHqThreadsSidebarOpen(false);
          setCmThreadsSidebarOpen(false);
          setDmThreadsSidebarOpen(false);
        }}
        rightSidebarWidth={400}
      />
      <StyledSwipeableDrawer
        className="h-full absolute z-9999"
        variant="temporary"
        anchor="left"
        open={userSidebarOpen}
        onOpen={(ev) => {}}
        onClose={() => setUserSidebarOpen(false)}
        classes={{
          paper: 'absolute left-0',
        }}
        style={{ position: 'absolute' }}
        ModalProps={{
          keepMounted: false,
          disablePortal: true,
          BackdropProps: {
            classes: {
              root: 'absolute',
            },
          },
        }}
      >
        <UserSidebar />
      </StyledSwipeableDrawer>
    </TeamChatAppContext.Provider>
  );
};

export default withReducer('teamchatApp', reducer)(TeamChatApp);
