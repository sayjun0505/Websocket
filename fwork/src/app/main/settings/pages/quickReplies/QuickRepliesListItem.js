import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Switch from '@mui/material/Switch';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import DataObjectIcon from '@mui/icons-material/DataObject';
import { styled } from '@mui/material/styles';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import { useDispatch } from 'react-redux';

import { updateQuickReplyStatus } from '../../store/quickReplySlice';

const SmallAvatar = styled(Avatar)(({ theme }) => ({
  width: 22,
  height: 22,
  border: `2px solid ${theme.palette.background.paper}`,
}));

const QuickRepliesListItem = (props) => {
  const dispatch = useDispatch();
  const { reply } = props;

  if (!reply) return null;

  return (
    <>
      <ListItem
        className="px-32 py-8"
        sx={{ bgcolor: 'background.paper' }}
        button
        component={NavLinkAdapter}
        to={`/settings/quick-reply/${reply.id}`}
      >
        <ListItemText
          classes={{ root: 'm-0', primary: 'font-medium leading-5 truncate' }}
          primary={reply.name}
        />
        <div className="flex flex-row space-x-4 px-28">
          {reply.response &&
            reply.response.length &&
            reply.response.map((_) => {
              if (_.type === 'text') {
                return (
                  <Tooltip title="Text" placement="top" arrow>
                    <FuseSvgIcon className="text-48" size={18} color="action">
                      material-outline:chat
                    </FuseSvgIcon>
                  </Tooltip>
                );
              }
              if (_.type === 'image') {
                return (
                  <Tooltip title="Image" placement="top" arrow>
                    <FuseSvgIcon className="text-48" size={18} color="action">
                      material-outline:image
                    </FuseSvgIcon>
                  </Tooltip>
                );
              }
              if (_.type === 'buttons') {
                return (
                  <Tooltip title="Button" placement="top" arrow>
                    <FuseSvgIcon className="text-48" size={18} color="action">
                      material-outline:smart_button
                    </FuseSvgIcon>
                  </Tooltip>
                );
              }
              if (_.type === 'confirm') {
                return (
                  <Tooltip title="Confirm" placement="top" arrow>
                    <FuseSvgIcon className="text-48" size={18} color="action">
                      material-outline:check_circle
                    </FuseSvgIcon>
                  </Tooltip>
                );
              }
              if (_.type === 'carousel') {
                return (
                  <Tooltip title="Carousel" placement="top" arrow>
                    <FuseSvgIcon className="text-48" size={18} color="action">
                      material-outline:filter_none
                    </FuseSvgIcon>
                  </Tooltip>
                );
              }
              if (_.type === 'flex') {
                return (
                  <Tooltip title="Flex message" placement="top" arrow>
                    <DataObjectIcon />
                  </Tooltip>
                );
              }
              return null;
            })}
        </div>

        <div className="flex flex-row space-x-4 min-w-96 justify-end pr-16">
          {reply.channel.line && <SmallAvatar alt="line" src="assets/images/logo/LINE.png" />}
          {reply.channel.facebook && (
            <SmallAvatar alt="facebook" src="assets/images/logo/Facebook.png" />
          )}
          {reply.channel.instagram && (
            <SmallAvatar alt="instagram" src="assets/images/logo/Instagram.png" />
          )}
        </div>
        <div className="flex flex-row px-8">
          <Switch
            onClick={(e) => {
              e.stopPropagation();
              dispatch(
                updateQuickReplyStatus({
                  ...reply,
                  status: e.target.checked ? 'active' : 'inactive',
                })
              );
            }}
            edge="end"
            color="success"
            checked={reply.status === 'active'}
            inputProps={{
              'aria-labelledby': 'switch-list-label-wifi',
            }}
          />
        </div>
      </ListItem>
      <Divider />
    </>
  );
};

export default QuickRepliesListItem;
