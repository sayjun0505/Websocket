import FusePageSimple from '@fuse/core/FusePageSimple';
import withReducer from 'app/store/withReducer';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useDeepCompareEffect } from '@fuse/hooks';
import { styled } from '@mui/material/styles';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import TeamsSidebarContent from './TeamsSidebarContent';
import TeamsHeader from './TeamsHeader';
import TeamsList from './TeamsList';
import reducer from './store';
import { getTeams } from './store/teamsSlice';
import {SocketContext} from '../../../context/socket';

const Root = styled(FusePageSimple)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.paper,
  },
}));

function TeamsApp(props) {
  const dispatch = useDispatch();
  const pageLayout = useRef(null);
  const routeParams = useParams();
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const socket = useContext(SocketContext);
  useEffect(()=>{
    socket.on("getTeams response", res=>{
      // console.log("getTeams response",res)
      dispatch(setTeamsforSocket(res))
    })
  },[socket])
  useDeepCompareEffect(() => {
    const organization = window.localStorage.getItem('organization');
    socket.emit("getTeams",JSON.parse(organization).organizationId)
    console.error("222222222222222222222222222")
    dispatch(getTeams());
  }, [dispatch]);

  useEffect(() => {
    setRightSidebarOpen(Boolean(routeParams.id));
  }, [routeParams]);

  return (
    <Root
      header={<TeamsHeader pageLayout={pageLayout} />}
      content={<TeamsList />}
      ref={pageLayout}
      rightSidebarContent={<TeamsSidebarContent />}
      rightSidebarOpen={rightSidebarOpen}
      rightSidebarOnClose={() => setRightSidebarOpen(false)}
      rightSidebarWidth={640}
      scroll={isMobile ? 'normal' : 'content'}
    />
  );
}

export default withReducer('teamsApp', reducer)(TeamsApp);
