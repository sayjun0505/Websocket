import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, List, ListItemButton, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import FuseUtils from '@fuse/utils/FuseUtils';
import format from 'date-fns/format';
import clsx from 'clsx';
import Linkify from 'react-linkify';

import { HashLink } from 'react-router-hash-link';
import { getChannels, selectOrderedChannels } from '../../store/channelsSlice';
import { getChannel } from '../../store/channelSlice';
import { useNotification } from '../../../../../notification/NotificationContext';

const ChannelList = (props) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { channelId } = useParams();
  const { eventUpdate, eventData, tabHasFocus } = useNotification();
  const channels = useSelector(selectOrderedChannels);

  useEffect(() => {
    dispatch(getChannels());
  }, [dispatch]);

  useEffect(() => {
    if (eventUpdate && eventUpdate < new Date()) {
      // console.log('✉️ [Teamchat] get Channel list.');
      dispatch(getChannels({}));
    }
  }, [dispatch, eventUpdate]);

  useEffect(() => {
    if (tabHasFocus) {
      // console.log('✉️ [Teamchat] get Channel list.');
      dispatch(getChannels({}));
    }
  }, [dispatch, tabHasFocus]);

  if (!channels) return null;

  return (
    <List
      sx={{ width: '100%', backgroundColor: 'background.paper' }}
      component="nav"
      className="p-0"
      aria-labelledby="nested-list-subheader"
    >
      {channels.map((channel, index) => (
        <ListItemButton
          key={index}
          className={clsx(
            {
              highlightItem: channel.channelId === channelId,
            },
            'px-15 py-5 min-h-40 w-full'
          )}
          component={HashLink}
          to={`${channel.channelId}/#${channel.id}`}
          onClick={() => {
            navigate(channel.channelId);
            dispatch(getChannel({ channelId }));
          }}
        >
          <div className="flex items-center flex-row w-full">
            {channel.isPublic ? (
              <FuseSvgIcon className="text-48" size={20} color="action">
                heroicons-outline:hashtag
              </FuseSvgIcon>
            ) : (
              <FuseSvgIcon className="text-48" size={20} color="action">
                material-outline:lock
              </FuseSvgIcon>
            )}

            <div className="flex flex-col grow pl-[1.5rem]">
              {/* First line */}
              <div className="flex justify-between items-center">
                <Typography
                  variant="subtitle1"
                  className="truncate font-600 text-[14px] max-w-200"
                  color="text.primary"
                >
                  {channel.name}
                </Typography>
                {channel.createdAt && (
                  <Typography
                    className="whitespace-nowra font-medium text-12"
                    color="text.secondary"
                  >
                    {new Date().getTime() - 1 * 24 * 60 * 60 * 1000 < new Date(channel.createdAt)
                      ? format(new Date(channel.createdAt), 'p')
                      : format(new Date(channel.createdAt), 'dd/MM/yy')}
                  </Typography>
                )}
              </div>

              {/* Second line */}
              <div className="flex justify-between">
                <Linkify>
                  <Typography
                    variant="body2"
                    className="truncate max-w-200"
                    color="text.secondary"
                    dangerouslySetInnerHTML={{
                      __html: FuseUtils.formatMentionToText(channel.lastMessage),
                    }}
                  />
                </Linkify>
                {/* <Linkify>{channel.lastMessage}</Linkify> */}
                {/* <div
                  className="break-all whitespace-pre-line truncate"
                  style={{
                    color: 'rgb(148, 163, 184)',
                  }}
                  dangerouslySetInnerHTML={{
                    __html: convertLastMessage(channel.lastMessage),
                  }}
                /> */}
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
                  {Boolean(channel.unread) && (
                    <Box
                      sx={{
                        backgroundColor: 'secondary.main',
                        color: 'secondary.contrastText',
                      }}
                      className="flex items-center justify-center min-w-20 h-20 rounded-full font-medium text-10 text-center"
                    >
                      {channel.unread}
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

export default ChannelList;
