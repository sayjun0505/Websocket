import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { motion } from 'framer-motion';
import { useFormContext } from 'react-hook-form';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import _ from '@lodash';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { selectPermission } from 'app/store/permissionSlice';
import { removeQuickReply, saveQuickReply } from '../../store/quickReplySlice';

const QuickReplyHeader = (props) => {
  const dispatch = useDispatch();
  const routeParams = useParams();
  const { id } = routeParams;
  const methods = useFormContext();
  const { formState, watch, getValues, reset } = methods;
  const { isValid, dirtyFields } = formState;
  const name = watch('name');
  const channel = watch('channel');
  const response = watch('response');
  const theme = useTheme();
  const navigate = useNavigate();
  const permission = useSelector(selectPermission);

  function handleSaveReply() {
    const reply = getValues();
    // console.log('[ReplyHeader] Save: ', reply);
    dispatch(saveQuickReply(reply)).then((action) => {
      // console.log('then', action.payload);
      reset(reply);
      navigate(`/settings/quick-reply/${action.payload.id || reply.id}`);
    });
  }

  function handleRemoveReply() {
    dispatch(removeQuickReply(id)).then(() => {
      handleClose();
      navigate('/settings/quick-reply');
    });
  }

  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className="flex flex-col sm:flex-row flex-1 w-full items-center justify-between space-y-8 sm:space-y-0 py-32 px-24 md:px-32 bg-white">
      <div className="flex flex-col items-center sm:items-start space-y-8 sm:space-y-0 w-full sm:max-w-full min-w-0">
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1, transition: { delay: 0.3 } }}
        >
          <Typography
            className="flex items-center sm:mb-12"
            component={Link}
            role="button"
            to="/settings/quick-reply"
            color="inherit"
          >
            <FuseSvgIcon size={20}>
              {theme.direction === 'ltr'
                ? 'heroicons-outline:arrow-sm-left'
                : 'heroicons-outline:arrow-sm-right'}
            </FuseSvgIcon>
            <span className="flex mx-4 font-medium">Quick Reply</span>
          </Typography>
        </motion.div>

        <div className="flex items-center max-w-full">
          <motion.div
            className="flex flex-col items-center sm:items-start min-w-0 mx-8 sm:mx-16"
            initial={{ x: -20 }}
            animate={{ x: 0, transition: { delay: 0.3 } }}
          >
            <Typography className="text-16 sm:text-20 truncate font-semibold">
              {name || 'Welcome!'}
            </Typography>
            <Typography variant="caption" className="font-medium">
              Quick replies can save time and make it easier for users to respond to messages.
            </Typography>
          </motion.div>
        </div>
      </div>
      <motion.div
        className="flex"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0, transition: { delay: 0.3 } }}
      >
        <Button
          className="whitespace-nowrap mx-4"
          variant="contained"
          disabled={!(permission && permission.reply && permission.reply.delete)}
          color="error"
          onClick={handleClickOpen}
          // startIcon={<FuseSvgIcon className="hidden sm:flex">heroicons-outline:trash</FuseSvgIcon>}
        >
          Delete
        </Button>
        <Button
          className="whitespace-nowrap mx-4"
          variant="contained"
          color="secondary"
          disabled={
            _.isEmpty(dirtyFields) ||
            !isValid ||
            (!channel.line && !channel.facebook && !channel.instagram) ||
            !response ||
            response.length === 0 ||
            response.some((el) => !el || !el.data)
          }
          onClick={handleSaveReply}
        >
          {id === 'new' ? 'Save' : 'Update'}
        </Button>
      </motion.div>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Delete Quick Reply?</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this quick reply?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit" size="small">
            Cancel
          </Button>
          {/* <Button onClick={handleRemoveReply} autoFocus>
            Agree
          </Button> */}
          <Button
            variant="contained"
            size="small"
            // disabled={!(permission && permission.reply && permission.reply.delete)}
            color="error"
            onClick={handleRemoveReply}
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default QuickReplyHeader;
