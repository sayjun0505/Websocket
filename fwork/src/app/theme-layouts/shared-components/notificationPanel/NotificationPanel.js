import { memo, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

import FuseScrollbars from '@fuse/core/FuseScrollbars';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { styled } from '@mui/material/styles';
import {
  Alert,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  SwipeableDrawer,
  Switch,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import clsx from 'clsx';

import withReducer from 'app/store/withReducer';
import {
  dismissAll,
  dismissItem,
  readAll,
  readItem,
  selectOrderNotifications,
} from 'app/store/notificationsSlice';

import NotificationTemplate from 'app/theme-layouts/shared-components/notificationPanel/NotificationTemplate';
import NotificationCard from './NotificationCard';
// import { dismissAll, dismissItem } from './store/dataSlice';
import reducer from './store';
import {
  closeNotificationPanel,
  selectNotificationPanelState,
  toggleNotificationPanel,
} from './store/stateSlice';

const StyledSwipeableDrawer = styled(SwipeableDrawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    backgroundColor: theme.palette.background.default,
    width: 360,
  },
}));

const NotificationPanel = (props) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const state = useSelector(selectNotificationPanelState);
  const _notifications = useSelector(selectOrderNotifications);

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  // const [isTokenFound, setTokenFound] = useState(false);
  // const [userConsent, setUserConsent] = useState();

  const [unreadOnly, setUnreadOnly] = useState(false);
  const [tab, setTab] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [mention, setMention] = useState(false);
  const [thread, setThread] = useState(false);
  const [kanban, setKanban] = useState(false);

  const [anchorFilterMenuEl, setAnchorFilterMenuEl] = useState(null);
  const filterMenuOpen = Boolean(anchorFilterMenuEl);
  const handleFilterMenuClick = (event) => {
    setAnchorFilterMenuEl(event.currentTarget);
  };
  const handleFilterMenuClose = () => {
    setAnchorFilterMenuEl(null);
  };

  function isPushNotificationSupported() {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  useEffect(() => {
    if (_notifications && tab) {
      let _noti = _notifications;
      if (unreadOnly) {
        _noti = _noti.filter((_) => !_.isRead);
      }
      if (mention) {
        _noti = _noti.filter(
          (_) =>
            _.event === 'newMention' ||
            _.event === 'newChannelMention' ||
            _.event === 'newHQMention' ||
            _.event === 'newCardMention'
        );
      }
      if (thread) {
        _noti = _noti.filter(
          (_) =>
            _.event === 'newThread' ||
            _.event === 'newThreadChannelMessage' ||
            _.event === 'newThreadDirectMessage' ||
            _.event === 'newThreadHQMessage'
        );
      }
      if (kanban) {
        _noti = _noti.filter(
          (_) =>
            _.type === 'scrumboard' &&
            (_.event === 'newBoardMember' ||
              _.event === 'newCardMember' ||
              _.event === 'newCardMention' ||
              _.event === 'newCardDueDate' ||
              _.event === 'editCardDueDate')
        );
      }

      if (tab === 'all') {
        setNotifications(_noti);
      } else if (tab === 'inbox') {
        setNotifications(_noti.filter((_) => _.type === 'chat'));
      } else if (tab === 'channels') {
        setNotifications(
          _noti.filter(
            (_) =>
              _.type === 'teamchat' &&
              (_.event === 'addMember' ||
                _.event === 'newChannelMessage' ||
                _.event === 'newChannelMention' ||
                _.event === 'newThreadChannelMessage')
          )
        );
      } else if (tab === 'dm') {
        setNotifications(
          _noti.filter(
            (_) =>
              _.type === 'teamchat' &&
              (_.event === 'newDirectMessage' || _.event === 'newThreadDirectMessage')
          )
        );
      } else {
        setNotifications([]);
      }
    } else {
      setNotifications([]);
    }
  }, [_notifications, tab, mention, thread, kanban, unreadOnly]);

  useEffect(() => {
    if (state) {
      dispatch(closeNotificationPanel());
    }
    // eslint-disable-next-line
  }, [location, dispatch]);

  function handleClose() {
    dispatch(closeNotificationPanel());
  }

  function handleRead(id) {
    dispatch(readItem(id));
  }
  function handleReadAll() {
    dispatch(readAll());
  }

  function handleDismiss(id) {
    dispatch(dismissItem(id));
  }
  function handleDismissAll() {
    dispatch(dismissAll());
  }

  const handleChange = (event) => {
    setUnreadOnly(event.target.checked);
  };

  function demoNotification() {
    enqueueSnackbar('title', {
      preventDuplicate: true,
      key: '1234',
      // eslint-disable-next-line react/no-unstable-nested-components
      content: () => (
        <NotificationTemplate
          item={{
            id: '1234',
            isRead: true,
            event: 'newDirectMessage',
            type: 'teamchat',
            organization: {
              id: '75837b94-3edb-47d0-b7be-b4928d8c6041',
              name: 'Organization 1 name1234',
            },
            organizationId: '75837b94-3edb-47d0-b7be-b4928d8c6041',
            createdAt: '2023-03-28T10:16:55.840Z',
            data: {
              recordType: 'directChannel',
              recordId: '66e6bec3-8523-4e64-b56d-98aed3c5ae73',
              messageId: '31d77138-c56f-4459-9b7b-69eeb5d3e8b3',
              newMessage: 1,
              requesterId: '66e6bec3-8523-4e64-b56d-98aed3c5ae73',
              requester: {
                display: 'nonomega',
                id: '66e6bec3-8523-4e64-b56d-98aed3c5ae73',
                pictureURL:
                  'https://storage.googleapis.com/foxconnect-dev/users/66e6bec3-8523-4e64-b56d-98aed3c5ae73/profile_1669824641854.jpg',
              },
            },
          }}
          onClose={() => {
            closeSnackbar('1234');
          }}
        />
      ),
    });
  }

  return (
    <StyledSwipeableDrawer
      open={state}
      anchor="right"
      onOpen={(ev) => {}}
      onClose={(ev) => dispatch(toggleNotificationPanel())}
      disableSwipeToOpen
    >
      <IconButton className="m-4 absolute top-0 right-0 z-999" onClick={handleClose} size="large">
        <FuseSvgIcon color="action">heroicons-outline:x</FuseSvgIcon>
      </IconButton>

      {!isPushNotificationSupported() && (
        <Alert className="mx-16 mt-56" severity="warning">
          Push Notification are NOT supported
        </Alert>
      )}

      {notifications ? (
        <FuseScrollbars className="p-16">
          <div className="flex flex-col">
            <div className="flex justify-between items-end pt-48 ">
              <Typography className="text-28 font-semibold leading-none">Notifications</Typography>
              {/* <Typography
                className="text-12 underline cursor-pointer"
                color="secondary"
                onClick={handleDismissAll}
              >
                dismiss all
              </Typography> */}
              <FormControlLabel
                value="Unread Only"
                className="text-10"
                control={
                  <Switch
                    className="mx-6"
                    size="small"
                    checked={unreadOnly}
                    onChange={handleChange}
                  />
                }
                label="Unread Only"
                labelPlacement="start"
              />
            </div>

            <div className="flex justify-between items-end pt-20 mb-24 space-x-4">
              <Button
                variant="contained"
                className={clsx(
                  'h-28 text-12 rounded-6',
                  tab === 'all'
                    ? 'bg-[#2559C7] hover:bg-[#14306d] text-white'
                    : 'bg-white text-black'
                )}
                size="small"
                onClick={() => {
                  setTab('all');
                }}
              >
                All
              </Button>

              <Button
                variant="contained"
                className={clsx(
                  'h-28 text-12 rounded-6',
                  tab === 'inbox'
                    ? 'bg-[#2559C7] hover:bg-[#14306d] text-white'
                    : 'bg-white text-black'
                )}
                size="small"
                onClick={() => {
                  setTab('inbox');
                }}
              >
                Inbox
              </Button>

              <Button
                variant="contained"
                className={clsx(
                  'h-28 text-12 rounded-6',
                  tab === 'channels'
                    ? 'bg-[#2559C7] hover:bg-[#14306d] text-white'
                    : 'bg-white text-black'
                )}
                size="small"
                onClick={() => {
                  setTab('channels');
                }}
              >
                Channels
              </Button>
              <Button
                variant="contained"
                className={clsx(
                  'h-28 text-12 rounded-6',
                  tab === 'dm'
                    ? 'bg-[#2559C7] hover:bg-[#14306d] text-white'
                    : 'bg-white text-black'
                )}
                size="small"
                onClick={() => {
                  setTab('dm');
                }}
              >
                DM
              </Button>
              <Button
                id="filter-menu"
                aria-controls={filterMenuOpen ? 'filter-basic-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={filterMenuOpen ? 'true' : undefined}
                onClick={handleFilterMenuClick}
                variant="contained"
                className={clsx(
                  'h-28 text-12 rounded-6',
                  mention || thread || kanban
                    ? 'bg-[#EBEBEB] text-white'
                    : 'bg-white text-black  hover:bg-[#EBEBEB]'
                )}
                size="small"
              >
                <FuseSvgIcon className="text-48" size={20} color="action">
                  material-outline:filter_list
                </FuseSvgIcon>
              </Button>
              <Menu
                id="filter-basic-menu"
                anchorEl={anchorFilterMenuEl}
                open={filterMenuOpen}
                onClose={handleFilterMenuClose}
                MenuListProps={{
                  'aria-labelledby': 'basic-button',
                }}
              >
                <MenuItem className="text-10 py-0">
                  <FormControlLabel
                    control={
                      <Checkbox
                        defaultChecked
                        size="small"
                        checked={mention}
                        onClick={(event) => {
                          setMention(event.target.checked);
                        }}
                      />
                    }
                    label="@mentions"
                  />
                </MenuItem>
                <MenuItem className="text-10 py-0">
                  <FormControlLabel
                    control={
                      <Checkbox
                        defaultChecked
                        size="small"
                        checked={thread}
                        onClick={(event) => {
                          setThread(event.target.checked);
                        }}
                      />
                    }
                    label="Thread Replies"
                  />
                </MenuItem>
                <MenuItem className="text-10 py-0">
                  <FormControlLabel
                    control={
                      <Checkbox
                        defaultChecked
                        size="small"
                        checked={kanban}
                        onClick={(event) => {
                          setKanban(event.target.checked);
                        }}
                      />
                    }
                    label="Kanban"
                  />
                </MenuItem>
              </Menu>
            </div>

            {notifications.map((item) => (
              <NotificationCard
                key={item.id}
                className="mb-16"
                item={item}
                onClose={() => handleDismiss(item.id)}
                onRead={() => handleRead(item.id)}
              />
            ))}
          </div>
        </FuseScrollbars>
      ) : (
        <div className="flex flex-1 items-center justify-center p-16">
          <Typography className="text-24 text-center" color="text.secondary">
            There are no notifications for now.
          </Typography>
        </div>
      )}
      {/* <div className="flex items-center justify-center py-16">
        <Button size="small" variant="outlined" onClick={demoNotification}>
          Create a notification example
        </Button>
      </div> */}
    </StyledSwipeableDrawer>
  );
};

export default withReducer('notificationPanel', reducer)(memo(NotificationPanel));
