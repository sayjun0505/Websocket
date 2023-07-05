import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import { useDispatch, useSelector } from 'react-redux';
import withReducer from 'app/store/withReducer';
import { selectOrderNotifications } from 'app/store/notificationsSlice';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import reducer from './store';
import { toggleNotificationPanel } from './store/stateSlice';

const NotificationPanelToggleButton = (props) => {
  const notifications = useSelector(selectOrderNotifications);
  // const unread = useSelector(selectUnReadCount);
  const dispatch = useDispatch();

  return (
    <IconButton
      className="w-40 h-40"
      onClick={(ev) => dispatch(toggleNotificationPanel())}
      size="large"
    >
      <Badge
        color="secondary"
        badgeContent={notifications.filter((_) => !_.isRead).length || 0}
        invisible={notifications.filter((_) => !_.isRead).length === 0}
        max={99}
      >
        {props.children}
      </Badge>
    </IconButton>
  );
};

NotificationPanelToggleButton.defaultProps = {
  children: <FuseSvgIcon>heroicons-outline:bell</FuseSvgIcon>,
};

export default withReducer('notificationPanel', reducer)(NotificationPanelToggleButton);
