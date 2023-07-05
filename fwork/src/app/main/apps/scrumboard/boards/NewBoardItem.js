import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Box } from '@mui/system';
import { useDispatch,useSelector } from 'react-redux';
import { newBoard,newBoardforSocket } from '../store/boardsSlice';
import {  useEffect, useContext, useState } from 'react';
import {SocketContext} from '../../../../context/socket';
import BoardModel from '../model/BoardModel';

const NewBoardItem = (props) => {
  const dispatch = useDispatch();
  const socket = useContext(SocketContext);
  const organization = window.localStorage.getItem('organization');
  const user = useSelector(state => { return state.user });
  useEffect(()=>{
    socket.on("newBoard response", res=>{
      dispatch(newBoardforSocket(res))
    })
  },[socket])

  return (
    <Box
      sx={{
        borderColor: 'divider',
      }}
      className="flex flex-col items-center justify-center w-full h-full rounded-lg cursor-pointer border-2 border-gray-300 border-dashed hover:bg-hover transition-colors duration-150 ease-in-out"
      onClick={() => {socket.emit("newBoard",{board:BoardModel(), reqid:user.uuid, orgId:JSON.parse(organization).organizationId})}}
      onKeyDown={() => socket.emit("newBoard",{board:BoardModel(), reqid:user.uuid, orgId:JSON.parse(organization).organizationId})}
      role="button"
      tabIndex={0}
    >
      <FuseSvgIcon size={48} color="disabled">
        heroicons-outline:plus
      </FuseSvgIcon>
    </Box>
  );
};

export default NewBoardItem;
