import FuseUtils from '@fuse/utils/FuseUtils';
import { Divider, List, ListItemButton } from '@mui/material';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { ContactAvatar } from 'app/shared-components/chat';
import clsx from 'clsx';
import format from 'date-fns/format';
import { memo } from 'react';
import Linkify from 'react-linkify';
import { HashLink } from 'react-router-hash-link';

const Widget4 = (props) => {
  // console.log(props);
  return (
    <Paper className="w-full rounded-xl shadow flex flex-col justify-between max-w-full">
      <div className="flex items-center justify-between py-10">
        <Typography className="text-16 px-16 font-medium" color="textSecondary">
          {props.data.title}
        </Typography>
      </div>
      <Divider className="border-[#E5E5E5]" />
      <List className="w-full min-h-[42rem]">
        {props.data &&
          props.data.data &&
          props.data.data.HqUserList &&
          props.data.data.HqUserList.map((user, index) => {
            if (!user.lastMessage) {
              return null;
            }
            return (
              <ListItemButton
                key={index}
                className={clsx('max-h-80 w-full !no-underline')}
                component={HashLink}
                to={`/apps/teamChat/hq/#${user.id}`}
              >
                <div className="flex flex-row items-center w-full min-h-[7rem]">
                  <ContactAvatar contact={user} className="w-48 h-48" />
                  <div className="flex flex-col pl-[1.5rem] w-[calc(100%-4.8rem)]">
                    {/* First line */}

                    <div className="flex w-full">
                      <Typography
                        className="truncate w-full text-14 rounded-r-full rounded-l-full bg-[#F6F7F9] p-10"
                        variant="body2"
                        color="text.secondary"
                      >
                        <Linkify>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: FuseUtils.formatMentionToText(user.lastMessage),
                            }}
                          />
                        </Linkify>
                      </Typography>
                    </div>

                    {/* Second line */}
                    <div className="flex justify-start items-center">
                      <Typography
                        variant="subtitle1"
                        color="text.primary"
                        className="font-semibold text-12"
                      >
                        {user.display}
                      </Typography>

                      <Typography className="text text-12 text-gray-500 pl-10">
                        {format(new Date(user.createdAt), 'dd/MM/yy')}
                      </Typography>
                    </div>
                  </div>
                </div>
              </ListItemButton>
            );
          })}
      </List>
    </Paper>
  );
};

export default memo(Widget4);
