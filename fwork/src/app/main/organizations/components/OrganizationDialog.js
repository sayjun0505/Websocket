import { yupResolver } from '@hookform/resolvers/yup';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Slide from '@mui/material/Slide';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { useContext,forwardRef, useEffect,useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import _ from '@lodash';
import * as yup from 'yup';
import { setActivationsforSocket } from '../store/activationsSlice';
import {
  closeOrganizationDialog,
  selectDialogOrganization,
  selectDialogOrganizationId,
} from '../store/organizationsSlice';
import { setStoreorga,addOrganization, updateOrganization } from '../store/organizationSlice';
import { getActivations, selectFilteredActiveActivations } from '../store/activationsSlice';
import {SocketContext} from '../../../context/socket';
const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/**
 * Form Validation Schema
 */
const schema = yup.object().shape({
  name: yup.string().required('You must enter a organization name'),
  description: yup.string().required('You must enter a description'),
  activationId: yup.string().required('You must select a package'),
});

const defaultValues = {
  name: '',
  description: '',
  activationId: '',
};

const OrganizationDialog = (props) => {
  const dispatch = useDispatch();
  const activations = useSelector(selectFilteredActiveActivations);
  const organization = useSelector(selectDialogOrganization);
  const selectId = useSelector(selectDialogOrganizationId);
  const socket = useContext(SocketContext);
  const [addOrg, setAddOrg]=useState(1);
  const routeParams = useParams();
  const { control, watch, reset, handleSubmit, formState, getValues } = useForm({
    mode: 'onChange',
    resolver: yupResolver(schema),
    defaultValues,
  });

  const { isValid, dirtyFields, errors } = formState;
  const form = watch();
  const user = useSelector(state=>{return state.user});
  useEffect(()=>{
    socket.on("addOrganization response", res=>{
      socket.emit("getActivations",user);
      dispatch(setStoreorga(res))    
      dispatch(closeOrganizationDialog());
    })
    socket.on("updateOrganization response", res=>{
      socket.emit("getActivations",user);
      dispatch(setStoreorga(res))    
      dispatch(closeOrganizationDialog());
    })
    socket.on("getActivations response", res=>{
      dispatch(setActivationsforSocket(res))
    })
  },[socket])
  
  useEffect(() => {
    if (selectId === 'free') {
      const freeActivation = activations.find(
        (activation) => activation.package && activation.package.isFree
      );
      if (freeActivation && freeActivation.id) {
        reset({
          ...defaultValues,
          activationId: freeActivation.id,
        });
      }
    }
  }, [selectId, reset, activations]);

  useEffect(() => {
    // console.log('[OrganizationDialog] ', organization);
    if (organization && organization.organization)
      reset({ ...organization.organization, activationId: organization.activationId });
  }, [organization, reset]);

  function onSubmit(data) {
    // console.log('[onSubmit] ', data);
    if (selectId === 'new' || selectId === 'free') {
      socket.emit("addOrganization",{
        name: data.name,
        description: data.description,
        activationId: data.activationId,
        reqid:user.uuid
      })
      // dispatch(
      //   addOrganization({
      //     name: data.name,
      //     description: data.description,
      //     activationId: data.activationId,
      //   })
      // ).then(() => {
      //   dispatch(getActivations());
      //   dispatch(closeOrganizationDialog());
      // });
    } else {
      socket.emit("updateOrganization",{id: data.id,
        name: data.name,
        description: data.description,        
        reqid:user.uuid
      })
      // dispatch(
      //   updateOrganization({
      //     id: data.id,
      //     name: data.name,
      //     description: data.description,
      //   })
      // ).then(() => {
      //   dispatch(getActivations());
      //   dispatch(closeOrganizationDialog());
      // });
    }
  }
  return (
    <Dialog
      classes={{
        paper: 'w-full m-24',
      }}
      TransitionComponent={Transition}
      onClose={(ev) => dispatch(closeOrganizationDialog())}
      open={Boolean(selectId)}
    >
      <DialogTitle>
        {selectId === 'new' || selectId === 'free' ? `New Organization` : `Edit Organization`}
      </DialogTitle>
      <DialogContent classes={{ root: 'p-16 pb-0 sm:p-32 sm:pb-0' }}>
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <TextField
              {...field}
              className="mt-16"
              label="Organization Name"
              id="name"
              error={!!errors.name}
              helperText={errors?.name?.message}
              variant="outlined"
              required
              fullWidth
            />
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <TextField
              {...field}
              className="mt-16"
              label="Description"
              id="description"
              error={!!errors.description}
              helperText={errors?.description?.message}
              variant="outlined"
              required
              fullWidth
            />
          )}
        />

        <Controller
          control={control}
          name="activationId"
          render={({ field }) => (
            <FormControl variant="outlined" className="w-full mt-16" required>
              <InputLabel>Package</InputLabel>
              <Select
                {...field}
                // value={(field.value && field.value.id) || ''}
                label="Package"
                id="activationId"
                disabled={selectId !== 'new'}
                fullWidth
              >
                {activations.map((option, index) => {
                  let detail = '';
                  if (option.package.organizationLimit === -1) detail = 'Unlimited organization';
                  if (option.package.organizationLimit > 0)
                    detail = `${option.organization}/${option.package.organizationLimit} organization`;
                  return (
                    <MenuItem
                      key={index}
                      value={option.id}
                      disabled={
                        option.package.organizationLimit !== -1 &&
                        option.organization >= option.package.organizationLimit
                      }
                    >
                      {`${option.package.name}(${
                        option.description ? option.description : ''
                      }): ${detail}`}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          )}
        />
      </DialogContent>

      <DialogActions className="mt-8">
        <Button
          onClick={() => {
            dispatch(closeOrganizationDialog());
          }}
        >
          Cancel
        </Button>
        <Button
          color="secondary"
          disabled={_.isEmpty(dirtyFields) || !isValid}
          onClick={handleSubmit(onSubmit)}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrganizationDialog;
