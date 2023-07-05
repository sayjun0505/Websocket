import { useLocation } from 'react-router-dom';
import history from '@history';
import Divider from '@mui/material/Divider';
import Card from '@mui/material/Card';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser } from 'app/store/userSlice';
import { useContext,forwardRef, useEffect,useState } from 'react';
import { selectActivationsById } from '../store/activationsSlice';
import { openOrganizationDialog } from '../store/organizationsSlice';
import { acceptOrganization,acceptOrganizationforSocket } from '../store/organizationSlice';
import { useOrganization } from '../../../organization/OrganizationContext';
import { showMessage } from '../../../../app/store/fuse/messageSlice'//'app/store/fuse/messageSlice';
import {SocketContext} from '../../../context/socket';
const OrganizationItem = (props) => {
  const { organization } = props;
  const dispatch = useDispatch();
  const { uuid } = useSelector(selectUser);
  const socket = useContext(SocketContext);
  const user = useSelector(state=>{return state.user});
  const activation = useSelector((state) =>
    selectActivationsById(state, organization.activationId)
  );
  const { setSelectOrganization } = useOrganization();
  const { state } = useLocation();



  useEffect(()=>{
    socket.on("acceptOrganization response", res=>{
      if(res!="!")dispatch(acceptOrganizationforSocket(res))
      else dispatch(showMessage({ message: 'Accept organization error', variant: 'error' }));
    })
  },[socket])



  const redirectUrl =
    state && state.redirectUrl && state.redirectUrl !== '/organizations'
      ? state.redirectUrl
      : '/apps/chat';

  function onSelect() {
    if (organization) {
      if (organization.status === 'padding') {
        // localStorage.setItem('organization', organization);
        socket.emit("acceptOrganization",{id:organization.organizationId,reqid:user.uuid})
        // dispatch(acceptOrganization(organization.organizationId));
      }
      setSelectOrganization(organization);
      if (redirectUrl)
        history.push({
          pathname: redirectUrl,
        });
      history.push({ pathname: '/' });
    }
  }

  if (!organization) {
    return null;
  }

  return (
    <Card className="flex flex-col relative items-start w-full h-full p-24 rounded-lg shadow border-inherit hover:shadow-xl transition-shadow duration-150 ease-in-out overflow-visible">
      <div className="flex flex-col flex-auto justify-start items-start w-full  ">
        <Typography className="mt-10 text-3xl font-medium leading-5 capitalize">
          {organization.organization.name}
        </Typography>

        {organization.status === 'padding' && (
          <Chip label="New" color="secondary" className="mt-20" />
        )}

        <Typography className="mt-10 line-clamp-2 text-secondary">
          {organization.organization.description}
        </Typography>

        <Divider className="w-96 mt-20 h-2" />
      </div>

      <div className="flex flex-col flex-auto justify-end w-full">        
        {organization.package && organization.package.name && (
          <div className="flex items-center mt-12 text-md font-md">
            <Typography color="text.secondary">Package:</Typography>
            <Typography className="mx-4 truncate">{organization.package.name}</Typography>
          </div>
        )}
        {organization.package && organization.package.description && (
          <div className="flex items-center mt-12 text-md font-md">
            <Typography color="text.secondary">Description:</Typography>
            <Typography className="mx-4 truncate">
              {organization.package && organization.package.description}
            </Typography>
          </div>
        )}
        {organization.package && organization.package.status && (
          <div className="flex items-center mt-12 text-md font-md">
            <Typography color="text.secondary">Status:</Typography>
            {organization.package.status === 'active' && (
              <Chip size="small" label="Active" color="success" className="mx-6" />
            )}
            {organization.package.status === 'waitingPayment' && (
              <Chip size="small" label="Awaiting Payment" className="mx-6" />
            )}
            {organization.package.status === 'waitingConfirm' && (
              <Chip size="small" label="Awaiting Confirmation" className="mx-6" />
            )}
            {organization.package.status === 'expired' && (
              <Chip size="small" label="Expired" color="warning" className="mx-6" />
            )}
          </div>
        )}
        <div className="flex items-center mt-16">
          <Button
            variant="contained"
            color="inherit"
            className="w-full"
            disabled={uuid !== organization.createdById}
            onClick={() => dispatch(openOrganizationDialog(organization.id))}
          >
            <FuseSvgIcon size={20}>material-outline:edit</FuseSvgIcon>
            <span className="mx-8">Edit</span>
          </Button>
        </div>
        <div className="flex items-center mt-8">
          <Button variant="contained" color="secondary" className="w-full" onClick={onSelect}>
            <FuseSvgIcon size={20}>heroicons-outline:check</FuseSvgIcon>
            <span className="mx-8">
              {organization.status === 'padding' ? 'Accept & Select' : 'Select'}
            </span>
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default OrganizationItem;
