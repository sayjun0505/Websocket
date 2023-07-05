import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import { useState } from 'react';

const TeamListItem = (props) => {
  const { team } = props;
  const [userNum, setUserNum] = useState(0);

  return (
    <>
      <ListItem
        className="px-32 py-16"
        sx={{ bgcolor: 'background.paper' }}
        button
        component={NavLinkAdapter}
        to={`/settings/teams/${team.id}`}
      >
        <ListItemText
          classes={{ root: 'm-0', primary: 'font-medium leading-5 truncate' }}
          primary={team.name}
          secondary={
            <Typography className="inline" component="span" variant="body2" color="text.secondary">
              {team.organizationUser ? `${team.organizationUser.length} User` : '0 User'}
            </Typography>
          }
        />
      </ListItem>
      <Divider />
    </>
  );
};

export default TeamListItem;
