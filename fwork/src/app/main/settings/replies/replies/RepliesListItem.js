import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';

function RepliesListItem(props) {
  const { reply } = props;

  return (
    <>
      <ListItem
        className="px-32 py-16"
        sx={{ bgcolor: 'background.paper' }}
        button
        component={NavLinkAdapter}
        to={`/settings/replies/${reply.id}/edit`}
      >
        <ListItemText
          classes={{ root: 'm-0', primary: 'font-medium leading-5 truncate' }}
          primary={reply.name}
          secondary={
            <Typography
              className="inline capitalize"
              component="span"
              variant="body2"
              color="text.secondary"
            >
              {reply.type}
            </Typography>
          }
        />
      </ListItem>
      <Divider />
    </>
  );
}

export default RepliesListItem;
