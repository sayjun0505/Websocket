import FusePageCarded from '@fuse/core/FusePageCarded';
import withReducer from 'app/store/withReducer';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useDeepCompareEffect } from '@fuse/hooks';
import { styled } from '@mui/material/styles';

import { getUsers } from '../users/store/usersSlice';

import reducer from './store';
import { getLabels } from './store/labelsSlice';
import { getFilters } from './store/filtersSlice';
import { getFolders } from './store/foldersSlice';
import { getTodos } from './store/todosSlice';
import TodoDialog from './TodoDialog';
import TodoHeader from './TodoHeader';
import TodoList from './TodoList';
import TodoSidebarContent from './TodoSidebarContent';
import TodoSidebarHeader from './TodoSidebarHeader';
import TodoToolbar from './TodoToolbar';

const Root = styled(FusePageCarded)(({ theme }) => ({
  '& .FusePageCarded-header': {
    minHeight: 72,
    height: 72,
    alignItems: 'center',
    [theme.breakpoints.up('sm')]: {
      minHeight: 136,
      height: 136,
    },
  },
}));

const TodoApp = (props) => {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedCount] = useState();
  const pageLayout = useRef(null);
  const routeParams = useParams();

  useEffect(() => {
    dispatch(getUsers()).then(() => setLoading(false));
    dispatch(getFilters());
    dispatch(getFolders());
    dispatch(getLabels());
  }, [dispatch]);

  useDeepCompareEffect(() => {
    dispatch(getTodos(routeParams));
  }, [dispatch, routeParams]);

  if (loading) {
    return null;
  }

  return (
    <>
      <Root
        header={<TodoHeader pageLayout={pageLayout} />}
        contentToolbar={<TodoToolbar />}
        content={<TodoList selectedAccount={selectedAccount} setSelectedCount={setSelectedCount} />}
        leftSidebarHeader={
          <TodoSidebarHeader
            selectedAccount={selectedAccount}
            setSelectedCount={setSelectedCount}
          />
        }
        leftSidebarContent={<TodoSidebarContent selectedAccount={selectedAccount} />}
        ref={pageLayout}
        innerScroll
      />
      <TodoDialog selectedAccount={selectedAccount} />
    </>
  );
};

export default withReducer('todoApp', reducer)(TodoApp);
