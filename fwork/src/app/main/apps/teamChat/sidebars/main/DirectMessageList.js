import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, List, ListItemButton, Typography } from '@mui/material';
import format from 'date-fns/format';
import clsx from 'clsx';
import Linkify from 'react-linkify';

import { selectUser } from 'app/store/userSlice';
import { ContactAvatar } from 'app/shared-components/chat';
import { HashLink } from 'react-router-hash-link';
import { getUsers, selectOrderedUsers } from '../../store/directMessageUsersSlice';
import { useNotification } from '../../../../../notification/NotificationContext';

const DirectMessageList = (props) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { contactId } = useParams();
  const { eventUpdate, eventData, tabHasFocus } = useNotification();
  const users = useSelector(selectOrderedUsers);
  const loginUser = useSelector(selectUser);

  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);

  useEffect(() => {
    if (eventUpdate && eventUpdate < new Date()) {
      // console.log('✉️ [Teamchat] get direct message list.');
      dispatch(getUsers({}));
    }
  }, [dispatch, eventUpdate]);

  useEffect(() => {
    if (tabHasFocus) {
      // console.log('✉️ [Teamchat] get direct message list.');
      dispatch(getUsers({}));
    }
  }, [dispatch, tabHasFocus]);

  if (!users) return null;

  return (
    <List
      sx={{ width: '100%', backgroundColor: 'background.paper' }}
      className="p-0"
      component="nav"
      aria-labelledby="nested-list-subheader"
    >
      {users
        .filter((user) => user.userId !== loginUser.uuid)
        .map((user, index) => (
          <ListItemButton
            key={index}
            className={clsx(
              {
                highlightItem: user.userId === contactId,
              },
              'px-15 py-5 min-h-40 w-full'
            )}
            component={HashLink}
            // to={`dm/${user.userId}/#${user.id}`}
            to={`dm/${user.userId}`}
            // onClick={() => navigate(`dm/${user.userId}`)}
          >
            <div className="flex items-center flex-row w-full">
              <ContactAvatar contact={user} className="w-[3.5rem] h-[3.5rem]" />
              <div className="flex flex-col grow pl-[1.5rem]">
                {/* First line */}
                <div className="flex justify-between items-center">
                  <Typography
                    variant="subtitle1"
                    className="truncate font-600 text-[14px] max-w-200"
                    color="text.primary"
                  >
                    {user.display}
                  </Typography>
                  {user.createdAt && (
                    <Typography
                      className="whitespace-nowra font-medium text-12"
                      color="text.secondary"
                    >
                      {new Date().getTime() - 1 * 24 * 60 * 60 * 1000 < new Date(user.createdAt)
                        ? format(new Date(user.createdAt), 'p')
                        : format(new Date(user.createdAt), 'dd/MM/yy')}
                    </Typography>
                  )}
                </div>

                {/* Second line */}
                <div className="flex justify-between">
                  <Typography variant="body2" className="truncate max-w-200" color="text.secondary">
                    <Linkify>{user.lastMessage}</Linkify>
                  </Typography>
                  <div className="items-center flex flex-row space-x-6">
                    {/* {Boolean(props.chat.newMention) && (
                <Box
                  sx={{
                    backgroundColor: 'red',
                    color: 'secondary.contrastText',
                  }}
                  className="flex items-center justify-center min-w-20 h-20 rounded-full font-medium text-10 text-center"
                >
                  {props.chat.newMention && 'M'}
                </Box>
              )} */}
                    {Boolean(user.unread) && (
                      <Box
                        sx={{
                          backgroundColor: 'secondary.main',
                          color: 'secondary.contrastText',
                        }}
                        className="flex items-center justify-center min-w-20 h-20 rounded-full font-medium text-10 text-center"
                      >
                        {user.unread}
                      </Box>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </ListItemButton>
        ))}
    </List>
  );
};

export default DirectMessageList;
