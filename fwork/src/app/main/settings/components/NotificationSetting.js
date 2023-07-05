import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser } from 'app/store/userSlice';

import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import format from 'date-fns/format';
// import _ from '@lodash';
import { selectPermission } from 'app/store/permissionSlice';

// import { updateOrganization } from '../store/generalSlice';
import { getSetting, saveSetting, selectSetting } from '../store/notificationSlice';

const container = {
  show: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const NotificationSetting = () => {
  const dispatch = useDispatch();
  const loginUser = useSelector(selectUser);
  const notificationSetting = useSelector(selectSetting);
  const permission = useSelector(selectPermission);
  const [updatable, setUpdatable] = useState(false);

  useEffect(() => {
    dispatch(getSetting());
  }, [dispatch]);

  useEffect(() => {
    if (permission && permission.notification && permission.notification.update) {
      setUpdatable(permission.notification.update);
    } else {
      setUpdatable(false);
    }
  }, [permission]);

  function onSettingChange(data) {
    dispatch(
      saveSetting({
        setting: {
          ...notificationSetting,
          ...data,
        },
      })
    );
  }

  if (!notificationSetting) {
    return null;
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <div className="md:flex m-1 md:m-32">
        <div className="flex flex-col flex-1 max-w-md">
          <span className="flex items-center space-x-8 pb-24">
            <Typography className="text-2xl font-semibold leading-tight">Notification</Typography>
          </span>

          {loginUser &&
            loginUser.data &&
            loginUser.data.email &&
            (loginUser.data.email === 'timanon.lo@gmail.com' ||
              loginUser.data.email === 'nonomega@gmail.com') && (
              <>
                <Divider />
                <List>
                  <ListSubheader component="div">FCM Token</ListSubheader>
                  <ListItem>
                    <ListItemText
                      primary={
                        <div className="break-words pb-12">{notificationSetting.token || ''}</div>
                      }
                      secondary={
                        <>
                          Updated AT:{' '}
                          {notificationSetting.updatedAt
                            ? format(
                                new Date(notificationSetting.updatedAt),
                                'dd-MMMM-yyyy HH:mm:ss'
                              )
                            : ''}
                        </>
                      }
                    />
                  </ListItem>
                </List>
              </>
            )}

          {notificationSetting.chat && (
            <>
              <Divider />
              <List>
                <ListSubheader component="div">Inbox Settings</ListSubheader>
                <div className="ml-16">
                  <ListItem>
                    <ListItemText primary="All" secondary="Turn on all notifications for chat" />
                    <ListItemSecondaryAction>
                      <Switch
                        disabled={!updatable}
                        color="primary"
                        checked={
                          Boolean(notificationSetting.chat.newChat) &&
                          Boolean(notificationSetting.chat.newMessage) &&
                          Boolean(notificationSetting.chat.owner) &&
                          Boolean(notificationSetting.chat.mention)
                        }
                        onChange={(e) => {
                          onSettingChange({
                            chat: {
                              newChat: e.target.checked,
                              newMessage: e.target.checked,
                              owner: e.target.checked,
                              mention: e.target.checked,
                            },
                          });
                        }}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="New Chat"
                      secondary="Notify me when a new chat was created"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        disabled={!updatable}
                        color="secondary"
                        checked={Boolean(notificationSetting.chat.newChat)}
                        onChange={(e) => {
                          onSettingChange({
                            chat: {
                              ...notificationSetting.chat,
                              newChat: e.target.checked,
                            },
                          });
                        }}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="New Message"
                      secondary="Notify me of new incoming messages"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        disabled={!updatable}
                        color="secondary"
                        checked={Boolean(notificationSetting.chat.newMessage)}
                        onChange={(e) => {
                          onSettingChange({
                            chat: {
                              ...notificationSetting.chat,
                              newMessage: e.target.checked,
                            },
                          });
                        }}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Change Owner"
                      secondary="Notify me when I am assigned to a chat"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        disabled={!updatable}
                        color="secondary"
                        checked={Boolean(notificationSetting.chat.owner)}
                        onChange={(e) => {
                          onSettingChange({
                            chat: {
                              ...notificationSetting.chat,
                              owner: e.target.checked,
                            },
                          });
                        }}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Mentions"
                      secondary="Notify me when I am @ mentioned in a chat comment"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        disabled={!updatable}
                        color="secondary"
                        checked={Boolean(notificationSetting.chat.mention)}
                        onChange={(e) => {
                          onSettingChange({
                            chat: {
                              ...notificationSetting.chat,
                              mention: e.target.checked,
                            },
                          });
                        }}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </div>
              </List>
            </>
          )}

          {notificationSetting.teamchat && (
            <>
              <Divider />
              <List>
                <ListSubheader component="div">Team Chat Settings</ListSubheader>
                <div className="ml-16">
                  <ListItem>
                    <ListItemText
                      primary="All"
                      secondary="Turn on all notifications for team chat"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        disabled={!updatable}
                        color="primary"
                        checked={
                          Boolean(notificationSetting.teamchat.addMember) &&
                          Boolean(notificationSetting.teamchat.newHQMessage) &&
                          Boolean(notificationSetting.teamchat.newChannelMessage) &&
                          Boolean(notificationSetting.teamchat.newDirectMessage) &&
                          Boolean(notificationSetting.teamchat.mention)
                        }
                        onChange={(e) => {
                          onSettingChange({
                            teamchat: {
                              addMember: e.target.checked,
                              newHQMessage: e.target.checked,
                              newChannelMessage: e.target.checked,
                              newDirectMessage: e.target.checked,
                              mention: e.target.checked,
                            },
                          });
                        }}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Added Member"
                      secondary="Notify me when I am added as member to a channel"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        disabled={!updatable}
                        color="secondary"
                        checked={Boolean(notificationSetting.teamchat.addMember)}
                        onChange={(e) => {
                          onSettingChange({
                            teamchat: {
                              ...notificationSetting.teamchat,
                              addMember: e.target.checked,
                            },
                          });
                        }}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="New General Chat Message"
                      secondary="Notify me of new messages in General Chat (Chat HQ)"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        disabled={!updatable}
                        color="secondary"
                        checked={Boolean(notificationSetting.teamchat.newHQMessage)}
                        onChange={(e) => {
                          onSettingChange({
                            teamchat: {
                              ...notificationSetting.teamchat,
                              newHQMessage: e.target.checked,
                            },
                          });
                        }}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="New Message"
                      secondary="Notify me of new messages in any channel"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        disabled={!updatable}
                        color="secondary"
                        checked={Boolean(notificationSetting.teamchat.newChannelMessage)}
                        onChange={(e) => {
                          onSettingChange({
                            teamchat: {
                              ...notificationSetting.teamchat,
                              newChannelMessage: e.target.checked,
                            },
                          });
                        }}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="New Direct Message"
                      secondary="Notify me when I receive new direct messages from other users"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        disabled={!updatable}
                        color="secondary"
                        checked={Boolean(notificationSetting.teamchat.newDirectMessage)}
                        onChange={(e) => {
                          onSettingChange({
                            teamchat: {
                              ...notificationSetting.teamchat,
                              newDirectMessage: e.target.checked,
                            },
                          });
                        }}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Mentions"
                      secondary="Notify me when I am @ mentioned in any chat channel or the Chat HQ"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        disabled={!updatable}
                        color="secondary"
                        checked={Boolean(notificationSetting.teamchat.mention)}
                        onChange={(e) => {
                          onSettingChange({
                            teamchat: {
                              ...notificationSetting.teamchat,
                              mention: e.target.checked,
                            },
                          });
                        }}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </div>
              </List>
            </>
          )}

          {notificationSetting.scrumboard && (
            <>
              <Divider />
              <List>
                <ListSubheader component="div">Kanban Board Settings</ListSubheader>
                <div className="ml-16">
                  <ListItem>
                    <ListItemText
                      primary="All"
                      secondary="Turn on all notifications for Kanban boards"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        disabled={!updatable}
                        color="primary"
                        checked={
                          Boolean(notificationSetting.scrumboard.addCardMember) &&
                          Boolean(notificationSetting.scrumboard.mention)
                        }
                        onChange={(e) => {
                          onSettingChange({
                            scrumboard: {
                              addCardMember: e.target.checked,
                              mention: e.target.checked,
                            },
                          });
                        }}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Added Member"
                      secondary="Notify me when I am added as member to a card"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        disabled={!updatable}
                        color="secondary"
                        checked={Boolean(notificationSetting.scrumboard.addCardMember)}
                        onChange={(e) => {
                          onSettingChange({
                            scrumboard: {
                              ...notificationSetting.scrumboard,
                              addCardMember: e.target.checked,
                            },
                          });
                        }}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Mentions"
                      secondary="Notify me when I am @ mentioned in a card comment"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        disabled={!updatable}
                        color="secondary"
                        checked={Boolean(notificationSetting.scrumboard.mention)}
                        onChange={(e) => {
                          onSettingChange({
                            scrumboard: {
                              ...notificationSetting.scrumboard,
                              mention: e.target.checked,
                            },
                          });
                        }}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </div>
              </List>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationSetting;
