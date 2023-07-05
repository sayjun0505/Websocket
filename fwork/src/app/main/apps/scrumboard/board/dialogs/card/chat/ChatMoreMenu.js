import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Hidden, IconButton, Popover } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import {
  ChatOwnerSetting,
  ChatStatusSetting,
  TicketDetailSetting,
  // OpenHistoryButton,
  // OpenCommentButton,
} from './ChatSetting';

const MainSidebarMoreMenu = (props) => {
  const routeParams = useParams();
  const { mode, id: chatId } = routeParams;

  const { className } = props;

  const [moreMenuEl, setMoreMenuEl] = useState(null);

  function handleMoreMenuClick(event) {
    setMoreMenuEl(event.currentTarget);
  }

  function handleMoreMenuClose(event) {
    setMoreMenuEl(null);
  }
  function mobileHandleMoreMenuClose() {
    handleMoreMenuClose();
  }

  return (
    <div className={className}>
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
          <Hidden lgUp>
            {/* <OpenCommentButton /> */}
            <ChatOwnerSetting />
            <ChatStatusSetting onClose={handleMoreMenuClose} />
          </Hidden>

          {mode !== 'history' && <TicketDetailSetting />}
          {/* {mode !== 'history' && <OpenHistoryButton onClose={handleMoreMenuClose} />} */}
        </div>
      </Popover>
    </div>
  );
};

export default MainSidebarMoreMenu;
