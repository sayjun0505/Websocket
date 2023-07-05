import FuseUtils from '@fuse/utils/FuseUtils';
import { Box, Divider, List, ListItemButton } from '@mui/material';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import format from 'date-fns/format';
import { memo } from 'react';
import Linkify from 'react-linkify';
import { HashLink } from 'react-router-hash-link';

const Widget4 = (props) => {
  // console.log(props);
  return (
    <Paper className="w-full rounded-xl shadow flex flex-col justify-between max-w-full">
      <div className="flex items-center justify-start py-10">
        <Typography className="text-16 pl-16 font-medium" color="textSecondary">
          {props.data.title}
        </Typography>
        <Typography className="text-12 px-16 pl-10 text-gray-500">(New Team Chats)</Typography>
      </div>
      <Divider className="border-[#E5E5E5]" />
      <List className="w-full min-h-[42rem]">
        {props.data &&
          props.data.data &&
          props.data.data.channels &&
          props.data.data.channels.map((channel, index) => {
            if (!channel.lastMessage) {
              return null;
            }
            return (
              <ListItemButton
                key={index}
                className={clsx('max-h-80 w-full')}
                component={HashLink}
                to={`/apps/teamChat/${channel.channelId}/#${channel.id}`}
              >
                {/* <div className="flex flex-row items-center w-full"> */}
                {/* <ContactAvatar contact={user} className="w-[3.5rem] h-[3.5rem]" /> */}
                <div className="flex flex-col px-[1.5rem] min-h-[7rem] w-full border-1 border-[#F5F5F5] shadow rounded-sm justify-around">
                  {/* First line */}
                  <div className="flex justify-between items-end">
                    <Typography
                      variant="subtitle1"
                      color="text.primary"
                      className="font-medium text-14"
                    >
                      {channel.name}
                    </Typography>
                    {channel.createdAt && (
                      <Typography className="text text-12 text-gray-500">
                        {format(new Date(channel.createdAt), 'dd/MM/yy')}
                      </Typography>
                    )}
                  </div>

                  {/* Second line */}
                  <div className="flex w-full justify-between items-center space-x-6">
                    <Typography
                      className="truncate w-full text-12"
                      variant="body2"
                      color="text.secondary"
                    >
                      <Linkify>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: FuseUtils.formatMentionToText(channel.lastMessage),
                          }}
                        />
                      </Linkify>
                    </Typography>
                    {/* <div className="items-center flex flex-row space-x-6"> */}
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
                    {/* </div> */}
                  </div>
                </div>
                {/* </div> */}
              </ListItemButton>
            );
          })}
      </List>
    </Paper>
  );
};

export default memo(Widget4);
