import FusePageSimple from '@fuse/core/FusePageSimple';
import withReducer from 'app/store/withReducer';
import { useEffect, useContext, useRef, useState } from 'react';
import { useDispatch,useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useDeepCompareEffect } from '@fuse/hooks';
import { styled } from '@mui/material/styles';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import TasksSidebarContent from './TasksSidebarContent';
import TasksHeader from './TasksHeader';
import TasksList from './TasksList';
import reducer from './store';
import { getTags,getTagsforSocket } from './store/tagsSlice';
import { getTasks,getTasksforSocket } from './store/tasksSlice';
import {SocketContext} from '../../../context/socket';

const Root = styled(FusePageSimple)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.paper,
  },
}));

const TasksApp = (props) => {
  const dispatch = useDispatch();
  const pageLayout = useRef(null);
  const routeParams = useParams();
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const socket = useContext(SocketContext);
  const organization = window.localStorage.getItem('organization');
  const user = useSelector(state => { return state.user });
  useEffect(()=>{
    socket.on("getTasks response", res=>{
      dispatch(getTasksforSocket(res))
    })
  },[socket])

  useDeepCompareEffect(() => {
    socket.emit("getTasks",{tag:'',orgId:JSON.parse(organization).organizationId })
  }, [dispatch]);

  useEffect(() => {
    setRightSidebarOpen(Boolean(routeParams.id));
  }, [routeParams]);

  return (
    <Root
      header={<TasksHeader pageLayout={pageLayout} />}
      content={<TasksList />}
      ref={pageLayout}
      rightSidebarContent={<TasksSidebarContent />}
      rightSidebarOpen={rightSidebarOpen}
      rightSidebarOnClose={() => setRightSidebarOpen(false)}
      rightSidebarWidth={640}
      scroll={isMobile ? 'normal' : 'content'}
    />
  );
};

export default withReducer('tasksApp', reducer)(TasksApp);
