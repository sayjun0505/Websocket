import FusePageSimple from '@fuse/core/FusePageSimple';
import withReducer from 'app/store/withReducer';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useDeepCompareEffect } from '@fuse/hooks';
import { styled } from '@mui/material/styles';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import PackagesSidebarContent from './PackagesSidebarContent';
import PackagesAppHeader from './PackagesHeader';
import ActivationsList from './ActivationsList';
import reducer from './store';
import { getPackages } from './store/packagesSlice';
import { getActivations } from './store/activationsSlice';
import { resetActivation } from './store/activationSlice';

const Root = styled(FusePageSimple)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.paper,
  },
}));

const PackagesApp = (props) => {
  const dispatch = useDispatch();
  const pageLayout = useRef(null);
  const routeParams = useParams();
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

  useDeepCompareEffect(() => {
    console.error("2")
    // dispatch(getActivations());
    dispatch(getPackages());
  }, [dispatch]);

  useEffect(() => {
    if (!rightSidebarOpen) dispatch(resetActivation());
  }, [rightSidebarOpen]);

  useEffect(() => {
    setRightSidebarOpen(Boolean(routeParams.id));
  }, [routeParams]);

  return (
    <Root
      header={<PackagesAppHeader pageLayout={pageLayout} />}
      content={<ActivationsList />}
      ref={pageLayout}
      rightSidebarContent={<PackagesSidebarContent />}
      rightSidebarOpen={rightSidebarOpen}
      rightSidebarOnClose={() => setRightSidebarOpen(false)}
      rightSidebarWidth={640}
      scroll={isMobile ? 'normal' : 'content'}
    />
  );
};

export default withReducer('packagesApp', reducer)(PackagesApp);
