import { useEffect, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import Tooltip from '@mui/material/Tooltip';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import DataObjectIcon from '@mui/icons-material/DataObject';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import QuickReplyPreviewDialog from './QuickReplyPreviewDialog';
import { getReplies, selectReply, sendReply } from '../store/replySlice';
import { selectChat } from '../store/chatSlice';

const QuickReplyMenu = (props) => {
  const { className, channel } = props;
  const dispatch = useDispatch();
  const replies = useSelector(selectReply);
  const chat = useSelector(selectChat);
  const [moreMenuEl, setMoreMenuEl] = useState(null);
  const [channelReply, setChannelReply] = useState([]);
  const [quickReplyDialogOpen, setQuickReplyDialogOpen] = useState(false);
  const [replyItem, setReplyItem] = useState(null);
  function handleMoreMenuClick(event) {
    setMoreMenuEl(event.currentTarget);
  }
  function handleMoreMenuClose(event) {
    setMoreMenuEl(null);
  }
  const handleQuickReplyDialogClickOpen = (item) => {
    setReplyItem(item);
    handleMoreMenuClose();
    setQuickReplyDialogOpen(true);
  };
  const handleQuickReplyDialogClose = () => {
    setReplyItem(null);
    handleMoreMenuClose();
    setQuickReplyDialogOpen(false);
  };
  const handleSendQuickReply = (reply) => {
    dispatch(sendReply({ reply, chat }));
    handleQuickReplyDialogClose();
  };
  useEffect(() => {
    dispatch(getReplies());
  }, [dispatch]);
  useEffect(() => {
    if (channel && replies) {
      setChannelReply(
        replies && replies.length && channel
          ? replies.filter(
              (_) =>
                (channel === 'facebook' && _.channel.facebook) ||
                (channel === 'instagram' && _.channel.instagram) ||
                (channel === 'line' && _.channel.line)
            )
          : []
      );
    }
  }, [channel, replies]);
  return (
    <div className={className}>
      <IconButton
        aria-owns={moreMenuEl ? 'main-more-menu' : null}
        aria-haspopup="true"
        onClick={handleMoreMenuClick}
        size="large"
      >
        <FuseSvgIcon>material-outline:quickreply</FuseSvgIcon>
      </IconButton>
      <Popover
        id="quick-menu"
        anchorEl={moreMenuEl}
        open={Boolean(moreMenuEl)}
        onClose={handleMoreMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        maxWidth="lg"
      >
        <div className="flex flex-col flex-auto h-full w-full ">
          <Card sx={{ maxWidth: 345 }} className="rounded">
            <CardHeader
              className="px-16 py-8"
              action={
                <IconButton aria-label="settings" component={Link} to="/settings/quick-reply">
                  <FuseSvgIcon size={24}>heroicons-outline:cog</FuseSvgIcon>
                </IconButton>
              }
              title={<Typography variant="subtitle1">Quick reply</Typography>}
            />
            <Divider className="" />
            <CardContent className="w-full p-0 overflow-y-auto">
              {channelReply && channelReply.length > 0 ? (
                <List
                  sx={{
                    width: '100%',
                    minWidth: 180,
                    maxWidth: 240,
                    maxHeight: 380,
                    bgcolor: 'background.paper',
                  }}
                >
                  {channelReply.map((item, index) => {
                    return (
                      <ListItem key={index} disablePadding>
                        <ListItemButton
                          className="w-full px-10 pt-2"
                          onClick={() => {
                            handleQuickReplyDialogClickOpen(item);
                            handleMoreMenuClose();
                          }}
                          dense
                        >
                          <div className="flex flex-row justify-between w-full">
                            <Typography variant="body2" className="grow truncate">
                              {item.name}
                            </Typography>

                            <div className="flex-none flex flex-row items-center space-x-4 w-48 justify-end">
                              {item.response &&
                                item.response.length &&
                                item.response.map((_,i) => {
                                  if (_.type === 'text') {
                                    return (
                                      <Tooltip key={i} title="Text" placement="top" arrow>
                                        <FuseSvgIcon className="text-48" size={18} color="action">
                                          material-outline:chat
                                        </FuseSvgIcon>
                                      </Tooltip>
                                    );
                                  }
                                  if (_.type === 'image') {
                                    return (
                                      <Tooltip key={i} title="Image" placement="top" arrow>
                                        <FuseSvgIcon className="text-48" size={18} color="action">
                                          material-outline:image
                                        </FuseSvgIcon>
                                      </Tooltip>
                                    );
                                  }
                                  if (_.type === 'buttons') {
                                    return (
                                      <Tooltip key={i} title="Button" placement="top" arrow>
                                        <FuseSvgIcon className="text-48" size={18} color="action">
                                          material-outline:smart_button
                                        </FuseSvgIcon>
                                      </Tooltip>
                                    );
                                  }
                                  if (_.type === 'confirm') {
                                    return (
                                      <Tooltip key={i} title="Confirm" placement="top" arrow>
                                        <FuseSvgIcon className="text-48" size={18} color="action">
                                          material-outline:check_circle
                                        </FuseSvgIcon>
                                      </Tooltip>
                                    );
                                  }
                                  if (_.type === 'carousel') {
                                    return (
                                      <Tooltip key={i} title="Carousel" placement="top" arrow>
                                        <FuseSvgIcon className="text-48" size={18} color="action">
                                          material-outline:filter_none
                                        </FuseSvgIcon>
                                      </Tooltip>
                                    );
                                  }
                                  if (_.type === 'flex') {
                                    return (
                                      <Tooltip key={i} title="Flex message" placement="top" arrow>
                                        <DataObjectIcon />
                                      </Tooltip>
                                    );
                                  }
                                  return null;
                                })}
                            </div>
                          </div>
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              ) : (
                <div className="flex flex-1 items-center justify-center h-full">
                  <Typography color="textSecondary" variant="body2">
                    There are no quick replies.
                  </Typography>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Popover>

      <QuickReplyPreviewDialog
        open={quickReplyDialogOpen}
        onClose={handleQuickReplyDialogClose}
        onSubmit={handleSendQuickReply}
        reply={replyItem}
      />
    </div>
  );
};

export default QuickReplyMenu;
