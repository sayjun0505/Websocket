import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';

// import { makeStyles } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import SettingsIcon from '@mui/icons-material/Settings';
import MessageIcon from '@mui/icons-material/Message';
import ImageIcon from '@mui/icons-material/Image';
// import { useHistory } from 'react-router-dom';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import makeStyles from '@mui/styles/makeStyles';
import history from '@history';

import { getReplies, sendReply } from '../store/replySlice';

const useStyles = makeStyles({
  root: {
    minWidth: 275,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
});

const QuickReplyContent = (props) => {
  const dispatch = useDispatch();
  // const history = useHistory();
  const { reply } = useSelector(({ chatApp }) => chatApp);
  const chat = useSelector(({ chatApp }) => chatApp.current.selected);
  const organization = useSelector(({ auth }) => auth.organization.organization);

  useEffect(() => {
    if (organization) dispatch(getReplies());
  }, [dispatch, organization]);

  const classes = useStyles();

  return (
    <div className="flex flex-col flex-auto h-full w-full">
      <Card className={classes.root} variant="outlined">
        <CardHeader
          title="Quick Reply"
          action={
            <IconButton
              aria-label="settings"
              onClick={() => {
                history.push({
                  pathname: '/settings/reply',
                });
              }}
              size="large"
            >
              <SettingsIcon />
            </IconButton>
          }
        />
        <CardContent>
          {reply && reply.length > 0 ? (
            <List component="nav" aria-label="main mailbox folders">
              {reply.map((item, index) => {
                return (
                  <ListItem
                    button
                    onClick={() => {
                      dispatch(sendReply({ reply: item, chat }));
                      props.handleReplyClose();
                    }}
                    key={index}
                  >
                    {item.response && (
                      <>
                        <ListItemIcon>
                          {item.response.length && item.response[0].type === 'text' && (
                            <MessageIcon />
                          )}
                          {item.response.length && item.response[0].type === 'image' && (
                            <ImageIcon />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.name}
                          secondary={
                            item.response &&
                            item.response.length > 0 &&
                            item.response[0].type === 'text'
                              ? JSON.parse(item.response[0].data).text
                              : 'Image'
                          }
                        />
                      </>
                    )}
                  </ListItem>
                );
              })}
            </List>
          ) : (
            <div className="flex flex-1 items-center justify-center h-full">
              <Typography color="textSecondary" variant="body2">
                There are no reply!
              </Typography>
            </div>
          )}
        </CardContent>
        {/* <CardActions>
          <Button size="small">Learn More</Button>
        </CardActions> */}
      </Card>
    </div>
  );
};

export default QuickReplyContent;
