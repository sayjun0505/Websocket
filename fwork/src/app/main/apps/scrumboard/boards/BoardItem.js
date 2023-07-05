import { Box } from '@mui/system';
import Divider from '@mui/material/Divider';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Card from '@mui/material/Card';
import { AvatarGroup } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import { formatDistance } from 'date-fns';
import { useSelector } from 'react-redux';
import _ from '@lodash';
import { selectMembers } from '../store/membersSlice';

const BoardItem = (props) => {
  const { board } = props;
  const members = useSelector(selectMembers);
  const boardMembers = _.compact(board.members.map((id) => _.find(members, { id })));

  return (
    <Card
      component={Link}
      to={board.id}
      role="button"
      className="flex flex-col items-start w-full h-full p-24 shadow rounded-lg hover:shadow-xl transition-shadow duration-150 ease-in-out"
    >
      <div className="flex flex-col flex-auto justify-start items-start w-full">
        <Box
          sx={{
            backgroundColor: 'secondary.light',
            color: 'secondary.dark',
          }}
          className="flex items-center justify-center p-16 rounded-full"
        >
          {/* <FuseSvgIcon>{board.icon}</FuseSvgIcon> */}
          <FuseSvgIcon>heroicons-outline:template</FuseSvgIcon>
        </Box>

        <Typography className="mt-20 text-lg font-600 leading-5">{board.title}</Typography>

        <Typography className="mt-2 line-clamp-2 text-desc font-400 text-14 ">
          {board.description}
        </Typography>

        <Divider className="w-48 mt-24 h-2" />
      </div>

      <div className="flex flex-col flex-auto justify-end w-full">
        {Boolean(boardMembers?.length) && (
          <div className="flex items-center mt-24 -space-x-6">
            <AvatarGroup max={4}>
              {boardMembers.map((member, index) => (
                <Avatar key={index} alt="member" src={member.picture} />
              ))}
            </AvatarGroup>
          </div>
        )}

        <div className="flex items-center mt-24 text-md font-md">
          <Typography color="text.secondary">Edited:</Typography>
          <Typography className="mx-4 truncate">
            {board.lastActivity &&
              formatDistance(new Date(board.lastActivity), new Date(), {
                addSuffix: true,
              })}
          </Typography>
        </div>
      </div>
    </Card>
  );
};

export default BoardItem;
