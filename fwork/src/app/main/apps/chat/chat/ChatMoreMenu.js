import { useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import clsx from 'clsx';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { IconButton, Popover } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import {
  ChatFollowupSetting,
  ChatOwnerSetting,
  OpenCommentButton,
  // OpenHistoryButton,
  TicketStatusSetting,
} from './settings';
import ChatAppContext from '../ChatAppContext';

const MainSidebarMoreMenu = (props) => {
  const { className, chat } = props;
  const { customerSidebarOpen, commentSidebarOpen } = useContext(ChatAppContext);
  const routeParams = useParams();
  const { mode, id: chatId } = routeParams;

  const isMobileDownLG = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const isMobileDownMD = useThemeMediaQuery((theme) => theme.breakpoints.down('md'));
  const isMobileUpMD = useThemeMediaQuery((theme) => theme.breakpoints.up('md'));
  const isMobileUpLG = useThemeMediaQuery((theme) => theme.breakpoints.up('lg'));
  const isMobileUpXL = useThemeMediaQuery((theme) => theme.breakpoints.up('xl'));

  const [moreMenuEl, setMoreMenuEl] = useState(null);

  function handleMoreMenuClick(event) {
    setMoreMenuEl(event.currentTarget);
  }
  function handleMoreMenuClose(event) {
    setMoreMenuEl(null);
  }

  if (mode === 'history' || !chat) return null;

  // Condition show/hide Owner and Status button
  const isShowButton = (isMobileUpMD && isMobileDownLG) || isMobileUpXL;

  return (
    <div className={clsx(className, 'flex space-x-8 items-center')}>
      <OpenCommentButton handleClose={handleMoreMenuClose} />
      <TicketStatusSetting size="small" />
      {isShowButton ? <ChatOwnerSetting /> : null}

      <IconButton
        aria-owns={moreMenuEl ? 'main-more-menu' : null}
        aria-haspopup="true"
        onClick={handleMoreMenuClick}
        size="large"
      >
        <FuseSvgIcon>heroicons-outline:dots-vertical</FuseSvgIcon>
      </IconButton>
      <Popover
        id="chats-more-menu"
        anchorEl={moreMenuEl}
        open={Boolean(moreMenuEl)}
        onClose={handleMoreMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        maxWidth="md"
      >
        <div className="flex flex-col space-y-8 m-8">
          {/* <TicketStatusSetting size="small" /> */}
          {!isShowButton ? <ChatOwnerSetting /> : null}
          <ChatFollowupSetting />
          {/* <OpenHistoryButton chatStatus={chat.status} onClose={handleMoreMenuClose} /> */}
        </div>
      </Popover>
    </div>
  );
};

export default MainSidebarMoreMenu;
