import { useContext, useMemo, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Icon, styled, Tooltip, tooltipClasses, Typography } from '@mui/material';
import TeamChatAppContext from '../TeamChatAppContext';

const LightTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.white,
    color: 'rgba(0, 0, 0, 0.87)',
    boxShadow: theme.shadows[1],
    fontSize: 12,
  },
}));

const ChannelMoreMenu = (props) => {
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

  const { className, messages } = props;

  const [moreMenuEl, setMoreMenuEl] = useState(null);

  function handleMoreMenuClick(event) {
    setMoreMenuEl(event.currentTarget);
  }

  function handleMoreMenuClose(event) {
    setMoreMenuEl(null);
  }

  let threadsCount = 0;
  if (messages) {
    threadsCount = messages.filter((message) => !message.isDelete && message.isReply).length;
  }
  let pinsCount = 0;
  if (messages) {
    pinsCount = messages.filter((message) => !message.isDelete && message.isPin).length;
  }
  return (
    <div className={className}>
      {useMemo(
        () => (
          <>
            <LightTooltip
              title={<Typography>Threads</Typography>}
              className="relative"
              placement="bottom"
            >
              <IconButton
                aria-haspopup="true"
                className="relative"
                onClick={() => {
                  setCmThreadsSidebarOpen(true);
                  setHqPinSidebarOpen(false);
                  setContactSidebarOpen(false);
                  setMemberSidebarOpen(false);
                  setCmPinSidebarOpen(false);
                  setDmPinSidebarOpen(false);
                  setThreadSidebarOpen(false);
                  setHqThreadsSidebarOpen(false);
                  setDmThreadsSidebarOpen(false);
                }}
                size="large"
              >
                <Icon>
                  <img
                    src={`${process.env.PUBLIC_URL}/assets/icons/chat-reply-icon.svg`}
                    alt="Threads"
                  />
                </Icon>
                {threadsCount > 0 && (
                  <Typography className="items-center px-5 text-16">
                    {threadsCount && threadsCount > 9 ? `9+` : threadsCount}
                  </Typography>
                )}
              </IconButton>
            </LightTooltip>
            <LightTooltip
              title={<Typography color="action">Pins</Typography>}
              className="relative"
              placement="bottom"
            >
              <IconButton
                aria-haspopup="true"
                className="relative"
                size="large"
                onClick={() => {
                  setCmPinSidebarOpen(true);
                  setHqPinSidebarOpen(false);
                  setContactSidebarOpen(false);
                  setMemberSidebarOpen(false);
                  setDmPinSidebarOpen(false);
                  setThreadSidebarOpen(false);
                  setHqThreadsSidebarOpen(false);
                  setCmThreadsSidebarOpen(false);
                  setDmThreadsSidebarOpen(false);
                }}
              >
                <FuseSvgIcon className="text-48 origin-center rotate-45" color="action">
                  material-outline:push_pin
                </FuseSvgIcon>
                {pinsCount > 0 && (
                  <Typography className="items-center px-5 text-16">
                    {pinsCount && pinsCount > 9 ? `9+` : pinsCount}
                  </Typography>
                )}
              </IconButton>
            </LightTooltip>
          </>
        ),
        [
          pinsCount,
          setCmPinSidebarOpen,
          setCmThreadsSidebarOpen,
          setContactSidebarOpen,
          setDmPinSidebarOpen,
          setDmThreadsSidebarOpen,
          setHqPinSidebarOpen,
          setHqThreadsSidebarOpen,
          setMemberSidebarOpen,
          setThreadSidebarOpen,
          threadsCount,
        ]
      )}
      <IconButton
        aria-owns={moreMenuEl ? 'main-more-menu' : null}
        aria-haspopup="true"
        onClick={handleMoreMenuClick}
        size="large"
      >
        <FuseSvgIcon>heroicons-outline:dots-vertical</FuseSvgIcon>
      </IconButton>
      <Menu
        id="chats-more-menu"
        anchorEl={moreMenuEl}
        open={Boolean(moreMenuEl)}
        onClose={handleMoreMenuClose}
      >
        <MenuItem
          onClick={() => {
            setMemberSidebarOpen(true);
            setCmPinSidebarOpen(false);
            setCmThreadsSidebarOpen(false);
            handleMoreMenuClose();
          }}
        >
          View channel member
        </MenuItem>
      </Menu>
    </div>
  );
};

export default ChannelMoreMenu;
