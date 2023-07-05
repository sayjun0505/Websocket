import Avatar from '@mui/material/Avatar';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import fromUnixTime from 'date-fns/fromUnixTime';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import Box from '@mui/material/Box';
import Linkify from 'react-linkify';
import { useSelector } from 'react-redux';
import FuseUtils from '@fuse/utils/FuseUtils';
import { ContactAvatar } from 'app/shared-components/chat';
import { selectMemberById } from '../../../../store/membersSlice';

const CardActivity = (props) => {
  const user = useSelector((state) => selectMemberById(state, props.item.idMember));

  if (!user) return null;
  switch (props.item.type) {
    case 'comment': {
      return (
        <ListItem dense className="px-0">
          <ContactAvatar className="!w-32 !h-32" contact={user} />
          <Box
            className="flex flex-col mx-16 p-12"
            sx={{
              borderRadius: '5px 20px 20px 5px',
              border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <div className="flex items-center">
              <Typography>{user.name}</Typography>
              <Typography className="mx-8 text-12" color="text.secondary">
                {formatDistanceToNow(fromUnixTime(props.item.time), { addSuffix: false })}
              </Typography>
            </div>
            <Linkify
              // eslint-disable-next-line react/no-unstable-nested-components
              componentDecorator={(decoratedHref, decoratedText, key) => (
                <a target="blank" href={decoratedHref} key={key}>
                  {decoratedText}
                </a>
              )}
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: FuseUtils.formatMentionToText(props.item.message),
                }}
              />
            </Linkify>
            {/* <Typography>{props.item.message}</Typography> */}
          </Box>
        </ListItem>
      );
    }
    case 'attachment': {
      return (
        <ListItem dense className="px-0">
          <Avatar alt={user.name} src={user.avatar} className="w-32 h-32" />
          <Box
            className="flex flex-col mx-16 p-12"
            sx={{
              borderRadius: '5px 20px 20px 5px',
              border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <div className="flex items-center">
              <Typography>{user.name}</Typography>
              <Typography className="mx-8 text-12" color="text.secondary">
                {formatDistanceToNow(fromUnixTime(props.item.time), {
                  addSuffix: false,
                })}
              </Typography>
            </div>
            <Linkify className="flex items-center justify-center">
              <Typography>Add new attachment</Typography>
              {/* <div className="flex items-center justify-center min-w-128 w-128">
                <Paper className="overflow-hidden shadow">
                  <img className="block max-h-full" src={props.item.message} alt="attachment" />
                </Paper>
              </div> */}
            </Linkify>
          </Box>
        </ListItem>
      );
    }
    default: {
      return null;
    }
  }
};

export default CardActivity;
