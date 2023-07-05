import { Divider, List, ListItemButton } from '@mui/material';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import format from 'date-fns/format';
import { memo } from 'react';
import Linkify from 'react-linkify';
import { HashLink } from 'react-router-hash-link';

const Widget4 = (props) => {
  // console.log(props);
  return (
    <Paper className="w-full rounded-xl shadow flex flex-col justify-between max-w-full">
      <div className="flex items-end justify-start py-10">
        <Typography className="text-16 pl-16 font-medium" color="textSecondary">
          {props.data.title}
        </Typography>
        <Typography className="text-12 pl-10 text-gray-500">(Recent Updates)</Typography>
      </div>
      <Divider className="border-[#E5E5E5]" />
      <List className="w-full min-h-[42rem]">
        {props.data &&
          props.data.data &&
          props.data.data.kanbans &&
          props.data.data.kanbans.map((kanban, index) => {
            if (!kanban) {
              return null;
            }

            return (
              <ListItemButton
                key={index}
                className="max-h-80 w-full"
                component={HashLink}
                to={`/apps/kanbanboard/boards/${kanban.boardId}/#${kanban.id}`}
              >
                {/* <div className="flex flex-row items-center w-full"> */}
                {/* <ContactAvatar contact={user} className="w-[3.5rem] h-[3.5rem]" /> */}
                <div className="flex flex-col px-[1.5rem] min-h-[7rem] w-full border-1 border-[#F5F5F5] shadow rounded-sm justify-around">
                  {/* First line */}
                  <div className="flex justify-between items-center">
                    <Typography
                      variant="subtitle1"
                      color="text.primary"
                      className="font-medium text-14"
                    >
                      {kanban.boardTitle}
                    </Typography>
                    {kanban.updatedAt && (
                      <Typography className="text text-12 text-gray-500">
                        {format(new Date(kanban.updatedAt), 'dd/MM/yy')}
                      </Typography>
                    )}
                  </div>

                  {/* Second line */}
                  <div className="flex justify-between items-center">
                    <Typography className="truncate text-12" variant="body2" color="text.secondary">
                      <Linkify>{kanban.cardTitle}</Linkify>
                    </Typography>
                    <Typography className="font-medium text-12 text-[#FF1313]">Updated</Typography>
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
