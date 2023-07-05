import FuseLoading from '@fuse/core/FuseLoading';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import AddressDialog from './AddressDialog';

// import { openNewAddressDialog, openEditAddressDialog } from '../../store/addressSlice';
import {
  openEditAddressDialog,
  openNewAddressDialog,
  removeAddress,
} from '../../store/addressSlice';
import { selectChat } from '../../store/chatSlice';
import { selectCustomer } from '../../store/customerSlice';

// import { getCustomer } from './store/customerSlice';
// import { getChat } from './store/chatSlice';

const Address = () => {
  const dispatch = useDispatch();
  const chat = useSelector(selectChat);
  const customer = useSelector(selectCustomer);
  const container = {
    show: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0 },
  };

  const [addressList, setAddressList] = useState([]);
  useEffect(() => {
    if (customer && customer.address && customer.address.length > 0) {
      setAddressList(customer.address);
    }
    return () => {
      setAddressList([]);
    };
  }, [customer]);

  const [removeConfirm, setRemoveConfirm] = useState({
    open: false,
    data: {},
  });

  const handleConfirmOpen = (data) => {
    setRemoveConfirm({
      open: true,
      data,
    });
  };

  const handleConfirmClose = () => {
    setRemoveConfirm({
      open: false,
      data: {},
    });
  };

  const handleConfirm = () => {
    dispatch(removeAddress(removeConfirm.data));
    // dispatch(removeAddress(removeConfirm.data)).then(() => {
    //   if (selectType === 'chat') {
    //     dispatch(getChat({ chatId: selected.chat.id }));
    //   } else if (selectType === 'history') {
    //     dispatch(getCustomer({ customerId: selected.customer.id }));
    //   }
    // });
    setRemoveConfirm({
      open: false,
      data: {},
    });
  };

  return (
    <div className="flex flex-col w-full">
      {!chat && <FuseLoading />}
      {addressList.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.1 } }}
          className="flex flex-col flex-1 items-center justify-center h-full m-16"
        >
          <Typography color="textSecondary" variant="h6">
            No Address!
          </Typography>
        </motion.div>
      )}
      {addressList.length > 0 && (
        <List className="w-full">
          <motion.div
            className="flex flex-col flex-shrink-0 w-full"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {addressList &&
              addressList.map((address, index) => {
                const fullAddress = `${address.subDistrict}, ${address.district}, ${address.province}, ${address.zipCode}`;

                return (
                  <motion.div variants={item} key={index} className="w-full">
                    <ListItem className="px-8 py-6 min-h-92 w-full flex justify-between">
                      <ListItemText
                        classes={{
                          root: 'min-w-px px-8 ',
                          primary: 'font-medium text-14',
                          secondary: 'truncate',
                        }}
                        primary={
                          <div className="flex flex-col">
                            <Typography
                              sx={{ display: 'inline' }}
                              component="span"
                              variant="h6"
                              color="text.primary"
                            >
                              {address.name}
                            </Typography>
                            <Typography
                              sx={{ display: 'inline' }}
                              component="span"
                              variant="subtitle2"
                              color="text.primary"
                            >
                              {address.tel}
                            </Typography>
                          </div>
                        }
                        secondary={
                          <div className="whitespace-normal break-words flex flex-col">
                            <Typography
                              sx={{ display: 'inline' }}
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {address.address1}
                            </Typography>
                            <Typography
                              sx={{ display: 'inline' }}
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {address.address2}
                            </Typography>
                            <Typography
                              sx={{ display: 'inline' }}
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {fullAddress}
                            </Typography>
                          </div>
                        }
                      />
                      <div className="flex flex-col ">
                        <IconButton
                          color="primary"
                          onClick={() => {
                            dispatch(openEditAddressDialog(address));
                          }}
                          size="large"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="primary"
                          onClick={() => {
                            handleConfirmOpen(address);
                          }}
                          size="large"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </div>
                    </ListItem>
                  </motion.div>
                );
              })}
          </motion.div>
        </List>
      )}

      <Button
        className="my-8 mx-16"
        variant="contained"
        color="primary"
        startIcon={<AddCircleIcon />}
        onClick={() => {
          dispatch(openNewAddressDialog());
        }}
      >
        <span className="hidden sm:flex">New Address</span>
        <span className="flex sm:hidden">New</span>
      </Button>
      <AddressDialog />

      <Dialog
        open={removeConfirm.open}
        onClose={handleConfirmClose}
        maxWidth="sm"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Are you sure you want to delete this Address?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <div className="flex flex-col p-8">
              <Typography
                sx={{ display: 'inline' }}
                component="span"
                variant="h6"
                color="text.primary"
              >
                {removeConfirm.data.name}
              </Typography>
              <Typography
                sx={{ display: 'inline' }}
                component="span"
                variant="subtitle2"
                color="text.primary"
              >
                {removeConfirm.data.tel}
              </Typography>

              <div className="whitespace-normal break-words flex flex-col">
                <Typography
                  sx={{ display: 'inline' }}
                  component="span"
                  variant="body2"
                  color="text.primary"
                >
                  {removeConfirm.data.address1}
                </Typography>
                <Typography
                  sx={{ display: 'inline' }}
                  component="span"
                  variant="body2"
                  color="text.primary"
                >
                  {removeConfirm.data.address2}
                </Typography>
                <Typography
                  sx={{ display: 'inline' }}
                  component="span"
                  variant="body2"
                  color="text.primary"
                >
                  {`${removeConfirm.data.subDistrict}, ${removeConfirm.data.district}, ${removeConfirm.data.province}, ${removeConfirm.data.zipCode}`}
                </Typography>
              </div>
            </div>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirm} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Address;
