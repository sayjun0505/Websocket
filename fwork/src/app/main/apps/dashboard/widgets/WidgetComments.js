import FuseUtils from '@fuse/utils/FuseUtils';
import { Divider, List, ListItemButton } from '@mui/material';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import format from 'date-fns/format';
import { memo } from 'react';
import Linkify from 'react-linkify';
import history from '@history';

const Widget4 = (props) => {
  // console.log(props);
  const onClickLink = (event, comment) => {
    event.preventDefault();
    history.push(`/apps/chat/${comment.chatId}/#${comment.id}`);
  };

  return (
    <Paper className="w-full rounded-xl shadow flex flex-col justify-between max-w-full">
      <div className="flex items-end justify-start py-10">
        <Typography className="text-16 pl-16 font-medium" color="textSecondary">
          {props.data.title}
        </Typography>
        <Typography className="text-12 pl-10 text-gray-500">(Recent Comments)</Typography>
      </div>
      <Divider className="border-[#E5E5E5]" />
      <List className="w-full min-h-[42rem]">
        {props.data &&
          props.data.data &&
          props.data.data.comments &&
          props.data.data.comments.map((comment, index) => {
            if (!comment.lastComment) {
              return null;
            }
            return (
              <ListItemButton
                key={index}
                className="max-h-80 w-full"
                onClick={(e) => onClickLink(e, comment)}
              >
                <div className="flex flex-col px-[1.5rem] min-h-[7rem] w-full border-1 border-[#F5F5F5] shadow rounded-sm justify-around">
                  {/* First line */}
                  <div className="flex justify-between items-center">
                    <Typography
                      variant="subtitle1"
                      color="text.primary"
                      className="font-medium text-14"
                    >
                      {comment.display}
                    </Typography>

                    <Typography className="text text-12 text-gray-500">
                      {format(new Date(comment.createdAt), 'dd/MM/yy')}
                    </Typography>
                  </div>

                  {/* Second line */}
                  <div className="flex w-full">
                    <Typography
                      className="truncate w-full text-12"
                      variant="body2"
                      color="text.secondary"
                    >
                      <Linkify>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: FuseUtils.formatMentionToText(comment.lastComment),
                          }}
                        />
                      </Linkify>
                    </Typography>
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
