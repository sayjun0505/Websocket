import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import _ from '@lodash';
import {SocketContext} from '../../../context/socket';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
// import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
// import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
// import { AvatarGroup } from '@mui/material';
// import Avatar from '@mui/material/Avatar';
// import Button from '@mui/material/Button';
import { useContext,forwardRef, useEffect,useState } from 'react';
import Typography from '@mui/material/Typography';
import { useDispatch, useSelector } from 'react-redux';
import { addInviteCode ,addInviteCodeforSocket} from '../store/activationsSlice';
import { showMessage } from '../../../../app/store/fuse/messageSlice';
const defaultValues = {
  code: '',
};
const schema = yup.object().shape({
  code: yup.string().required('You must enter a Code'),
});

const AddInviteCodeItem = () => {
  const dispatch = useDispatch();
  const { control, formState, handleSubmit, reset } = useForm({
    mode: 'onChange',
    defaultValues,
    resolver: yupResolver(schema),
  });

  const { isValid, dirtyFields, errors } = formState;
  const socket = useContext(SocketContext);
  const user = useSelector(state=>{return state.user});
  useEffect(()=>{
    socket.on("addInviteCode response", res=>{
      if(res!="!"){
        dispatch(addInviteCodeforSocket(res)) 
      }
      else dispatch(
          showMessage({
            message: 'Activation not found!',
            autoHideDuration: 3000,
            variant: 'error',
          })
        );
      // window.location.reload(false);
    })
  },[socket])
  function onSubmit(newData) {
    socket.emit("addInviteCode",{code:newData.code,reqid:user.uuid})
    // dispatch(addInviteCode(newData)).then(() => {
    //   window.location.reload(false);
    // });
  }

  return (
    <Card className="flex flex-col relative items-start w-full h-full p-24 rounded-lg shadow border-inherit hover:shadow-xl transition-shadow duration-150 ease-in-out overflow-visible">
      <div className="flex flex-col flex-auto justify-start items-start w-full  ">
        <Typography className="mt-10 text-3xl font-medium leading-5 capitalize">
          Invite code
        </Typography>

        <Divider className="w-96 mt-24 h-2" />
      </div>

      <div className="flex flex-col flex-auto justify-end w-full">
        <div className="flex flex-col mt-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              control={control}
              name="code"
              render={({ field }) => (
                <TextField
                  {...field}
                  className="mb-8 rounded"
                  label="Invite code"
                  error={!!errors.name}
                  helperText={errors?.name?.message}
                  variant="outlined"
                  required
                  fullWidth
                />
              )}
            />
            <div className="flex items-center mt-16">
              <Button
                variant="contained"
                color="secondary"
                className="w-full"
                type="submit"
                disabled={_.isEmpty(dirtyFields) || !isValid}
              >
                Submit
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Card>
  );
};

export default AddInviteCodeItem;
