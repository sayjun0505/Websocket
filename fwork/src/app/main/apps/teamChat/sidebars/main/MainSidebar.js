import { useContext, useState } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';

import { Box, Tooltip, Typography } from '@mui/material';

import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';

import { lighten, styled } from '@mui/material/styles';
import { selectUser } from 'app/store/userSlice';
import { ContactAvatar } from 'app/shared-components/chat';
import TeamChatAppContext from '../../TeamChatAppContext';
import ChannelList from './ChannelList';
import DirectMessageList from './DirectMessageList';
import ChatHQ from './ChatHQ';
import ChannelDialog from '../components/ChannelDialog';
import { toggleIsOpen as toggleChannelListIsOpen } from '../../store/channelsSlice';
import { toggleIsOpen as toggleDirectMessageIsOpen } from '../../store/directMessageUsersSlice';

const Accordion = styled((props) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&:before': {
    display: 'none',
  },
}));

const AccordionSummary = styled((props) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, .05)' : 'rgba(0, 0, 0, .03)',
  flexDirection: 'row-reverse',
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(90deg)',
  },
  '& .MuiAccordionSummary-content': {
    marginLeft: theme.spacing(1),
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: '1px solid rgba(0, 0, 0, .125)',
  '& .highlightItem':
    theme.palette.mode === 'dark'
      ? {
          background: 'rgba(0, 0, 0, 0.2)',
          // borderRadius: '20px',
        }
      : {
          background: 'rgba(0, 0, 0, 0.04)',
          // borderRadius: '20px',
        },
  '& .MuiListItemButton-root:hover': {
    // borderRadius: '20px',
  },
}));

const MainSidebar = () => {
  const { setUserSidebarOpen } = useContext(TeamChatAppContext);
  const dispatch = useDispatch();
  // const navigate = useNavigate();
  // const { contactId, channelId } = useParams();

  const loginUser = useSelector(selectUser);
  const channelListIsOpen = useSelector(({ teamchatApp }) => teamchatApp.channels.isOpen);
  const directMessageIsOpen = useSelector(
    ({ teamchatApp }) => teamchatApp.directMessageUsers.isOpen
  );

  const [channelDialogOpen, setChannelDialogOpen] = useState(false);

  const handleExpandPanelChange = (panel) => (event, newExpanded) => {
    if (panel === 'channelPanel') {
      dispatch(toggleChannelListIsOpen(newExpanded));
    } else if (panel === 'directMessagePanel') {
      dispatch(toggleDirectMessageIsOpen(newExpanded));
    }
  };

  return (
    <div className="flex flex-col flex-auto h-full">
      <Box
        className="p-16 border-b-1"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? lighten(theme.palette.background.default, 0.4)
              : lighten(theme.palette.background.default, 0.02),
        }}
      >
        <div className="flex justify-between items-center">
          {loginUser && (
            <div
              aria-hidden="true"
              role="button"
              tabIndex={0}
              className="flex flex-row w-full justify-start items-center cursor-pointer"
              onClick={() => setUserSidebarOpen(true)}
            >
              <ContactAvatar contact={loginUser.data} />
              <div className="flex flex-col mx-4 items-start">
                <Typography className="mx-4 font-medium">{loginUser.data.display}</Typography>
                <Typography className="mx-4 text-11 font-medium capitalize" color="text.secondary">
                  {loginUser.role && loginUser.role.toString()}
                  {(!loginUser.role ||
                    (Array.isArray(loginUser.role) && loginUser.role.length === 0)) &&
                    'Guest'}
                </Typography>
              </div>
            </div>
          )}
        </div>
      </Box>
      <ChatHQ />
      <Accordion
        expanded={channelListIsOpen}
        onChange={handleExpandPanelChange('channelPanel')}
        key="channels"
      >
        <AccordionSummary aria-controls="channelPanel-content" id="channelPanel-header">
          <Typography style={{ fontWeight: 600 }}>Channels</Typography>
        </AccordionSummary>
        <Tooltip title="Create a Channel">
          <FuseSvgIcon
            className="text-48 absolute right-12 top-12 cursor-pointer visible "
            size={24}
            color="action"
            onClick={() => setChannelDialogOpen(true)}
          >
            material-outline:add_circle
          </FuseSvgIcon>
        </Tooltip>

        <AccordionDetails className="p-0">
          <ChannelList />
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={directMessageIsOpen}
        onChange={handleExpandPanelChange('directMessagePanel')}
        key="directMessages"
      >
        <AccordionSummary aria-controls="directMessagePanel-content" id="directMessagePanel-header">
          <Typography style={{ fontWeight: 600 }}>Direct Messages</Typography>
        </AccordionSummary>
        <AccordionDetails className="p-0">
          <DirectMessageList />
        </AccordionDetails>
      </Accordion>

      <ChannelDialog
        open={channelDialogOpen}
        onClose={() => {
          setChannelDialogOpen(false);
        }}
        initialData={null}
      />
    </div>
  );
};

export default MainSidebar;
