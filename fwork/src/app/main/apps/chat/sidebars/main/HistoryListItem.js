import { styled } from '@mui/material/styles';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import format from 'date-fns/format';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useContext } from 'react';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';

import { ContactChannelAvatar } from 'app/shared-components/chat';
import { selectChannelById } from '../../store/channelsSlice';
import ChatAppContext from '../../ChatAppContext';

const StyledListItem = styled(ListItem)(({ theme, active }) => ({
  '&.active': {
    backgroundColor: theme.palette.background.default,
  },
}));

const HistoryListItem = (props) => {
  const { history } = props;
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const routeParams = useParams();
  const { setMainSidebarOpen } = useContext(ChatAppContext);

  const channel = useSelector((state) => selectChannelById(state, history.channelId));

  if (!history || !channel || history.totalChat === 0) return null;

  return (
    <StyledListItem
      button
      className="flex items-center p-12 min-h-80 w-full"
      active={routeParams.id === history.id ? 1 : 0}
      component={NavLinkAdapter}
      to={`/apps/chat/${history.lastChat.id}/history`}
      end
      activeClassName="active"
      onClick={() => {
        if (isMobile) {
          setTimeout(() => {
            setMainSidebarOpen(false);
          }, 0);
        }
      }}
    >
      <div className="flex items-center flex-row w-full space-x-12">
        <ContactChannelAvatar
          className="relative w-48 h-48"
          contact={{ pictureURL: history.pictureURL, display: history.display }}
          channel={channel}
        />
        <div className="flex flex-col grow">
          <div className="flex justify-between items-center">
            <Typography
              variant="subtitle1"
              className="truncate font-bold max-w-160"
              color="text.primary"
            >
              {history.display}
            </Typography>
            {history.lastChat && history.lastChat.createdAt ? (
              <Typography className="whitespace-nowra font-medium text-12" color="text.secondary">
                {new Date().getTime() - 1 * 24 * 60 * 60 * 1000 <
                new Date(history.lastChat.createdAt)
                  ? format(new Date(history.lastChat.createdAt), 'p')
                  : format(new Date(history.lastChat.createdAt), 'dd/MM/yy')}
              </Typography>
            ) : (
              <Typography className="whitespace-nowra font-medium text-12" color="text.secondary">
                {new Date().getTime() - 1 * 24 * 60 * 60 * 1000 < new Date(history.createdAt)
                  ? format(new Date(history.createdAt), 'p')
                  : format(new Date(history.createdAt), 'dd/MM/yy')}
              </Typography>
            )}
          </div>
          <div className="flex justify-between">
            <Tooltip title={channel.name} arrow>
              <Chip
                size="small"
                className="w-min my-1 rounded bg-[#6D6D6D] text-[#FFFFFF] truncate max-w-96"
                label={`${channel.name}`}
              />
            </Tooltip>
            <Typography
              className="whitespace-nowrap mb-8 font-medium text-12"
              color="textSecondary"
            >
              {`${history.totalChat} chat`}
            </Typography>
          </div>
        </div>
      </div>
    </StyledListItem>
  );
};

export default HistoryListItem;
