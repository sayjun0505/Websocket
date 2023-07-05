/* eslint-disable consistent-return */
// import IconButton from '@mui/material/IconButton';
// import Popover from '@mui/material/Popover';
// import Typography from '@mui/material/Typography';
// import Card from '@mui/material/Card';
// import CardHeader from '@mui/material/CardHeader';
// import CardContent from '@mui/material/CardContent';
// import Divider from '@mui/material/Divider';
// import List from '@mui/material/List';
// import ListItem from '@mui/material/ListItem';
// import ListItemButton from '@mui/material/ListItemButton';
// import Tooltip from '@mui/material/Tooltip';
// import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
// import DataObjectIcon from '@mui/icons-material/DataObject';
import { Button, Dialog, DialogActions, DialogContent, Paper, Typography } from '@mui/material';
import { useDispatch } from 'react-redux';
import PreviewText from './previews/PreviewText';
import PreviewImage from './previews/PreviewImage';
import PreviewButtons from './previews/PreviewButtons';
import PreviewConfirm from './previews/PreviewConfirm';
import PreviewCarousel from './previews/PreviewCarousel';

const QuickReplyPreviewDialog = (props) => {
  const { className, open, reply, onClose, onSubmit } = props;
  const dispatch = useDispatch();

  if (!reply || !open) {
    return null;
  }

  return (
    <Dialog open={open} keepMounted onClose={onClose} aria-describedby="dialog-quick-reply">
      <DialogContent>
        <Typography variant="h6" className="font-bold">
          Send this quick reply?
        </Typography>
        <Typography variant="body2">
          <b>Title:</b> {reply.name || ''}
        </Typography>
        <Paper
          variant="outlined"
          className="flex w-full h-full p-8 mt-12 rounded flex-col space-y-8 items-center"
        >
          {reply &&
            reply.response &&
            reply.response.map((response, i) => {
              if (!response.data) {
                return;
              }

              const data = JSON.parse(response.data);
              // console.log('🤖 data', data);
              if (response.type === 'text' && data.text) {
                return <PreviewText template={data.text} />;
              }
              if (response.type === 'image' && data.image) {
                return <PreviewImage template={data.image} />;
              }
              if (response.type === 'buttons' && data.buttons) {
                return <PreviewButtons template={data.buttons} />;
              }
              if (response.type === 'confirm' && data.confirm) {
                return <PreviewConfirm template={data.confirm} />;
              }
              if (response.type === 'carousel' && data.carousel) {
                return <PreviewCarousel template={data.carousel} />;
              }
              return null;
            })}
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" size="small" onClick={onClose}>
          Cancel
        </Button>
        <Button
          color="secondary"
          variant="contained"
          size="small"
          onClick={() => {
            onSubmit(reply);
          }}
        >
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuickReplyPreviewDialog;
