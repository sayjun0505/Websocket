import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, List, ListItemButton, Typography } from '@mui/material';
import format from 'date-fns/format';
import clsx from 'clsx';
import Linkify from 'react-linkify';
import { HashLink } from 'react-router-hash-link';
import FuseUtils from '@fuse/utils/FuseUtils';
import { getHQData, getHQMessages, selectData } from '../../store/hqSlice';
import { useNotification } from '../../../../../notification/NotificationContext';

const ChatHQ = (props) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { eventUpdate, eventData, tabHasFocus } = useNotification();
  const data = useSelector(selectData);

  useEffect(() => {
    dispatch(getHQData());
  }, [dispatch]);

  useEffect(() => {
    if (eventUpdate && eventUpdate < new Date()) {
      // console.log('✉️ [Teamchat] get HQ list.');
      dispatch(getHQData({}));
    }
  }, [dispatch, eventUpdate]);

  useEffect(() => {
    if (tabHasFocus) {
      // console.log('✉️ [Teamchat] get HQ list.');
      dispatch(getHQData({}));
    }
  }, [dispatch, tabHasFocus]);

  if (!data) return null;

  return (
    <List
      sx={{ backgroundColor: 'background.paper' }}
      className="p-0 w-full"
      component="nav"
      aria-labelledby="nested-list-subheader"
    >
      <ListItemButton
        className={clsx('px-15 py-5 min-h-40 w-full')}
        component={HashLink}
        to={`hq/#${data.id}`}
        onClick={() => {
          navigate('hq');
          dispatch(getHQMessages());
          dispatch(getHQData());
        }}
        // disabled
      >
        <div className="flex items-center flex-row w-full">
          <div className="flex flex-col grow">
            {/* First line */}
            <div className="flex justify-between items-center">
              <Typography
                variant="subtitle1"
                className="truncate font-600 text-[14px]"
                color="text.primary"
              >
                General Chat (Chat HQ)
              </Typography>
              {data.createdAt && (
                <Typography className="whitespace-nowra font-medium text-12" color="text.secondary">
                  {new Date().getTime() - 1 * 24 * 60 * 60 * 1000 < new Date(data.createdAt)
                    ? format(new Date(data.createdAt), 'p')
                    : format(new Date(data.createdAt), 'dd/MM/yy')}
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
                    __html: FuseUtils.formatMentionToText(data.lastMessage),
                  }}
                />
              </Linkify>
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
                {Boolean(data.unread) && (
                  <Box
                    sx={{
                      backgroundColor: 'secondary.main',
                      color: 'secondary.contrastText',
                    }}
                    className="flex items-center justify-center min-w-20 h-20 rounded-full font-medium text-10 text-center"
                  >
                    {data.unread}
                  </Box>
                )}
              </div>
            </div>
          </div>
        </div>
      </ListItemButton>
    </List>
  );
};

export default ChatHQ;
