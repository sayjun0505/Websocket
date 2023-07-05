import FusePageSimple from '@fuse/core/FusePageSimple';
import withReducer from 'app/store/withReducer';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';
import { useDeepCompareEffect } from '@fuse/hooks';
import { styled } from '@mui/material/styles';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { selectUser } from 'app/store/userSlice';
import NewPackageSidebarContent from './NewPackageSidebarContent';
import NewPackageHeader from './NewPackageHeader';
import reducer from '../store';
import { getPackages } from '../store/packagesSlice';
import StripePricing from './StripePricing';
// import { getActivations } from '../store/activationsSlice';
// import { resetActivation } from './store/activationSlice';

const Root = styled(FusePageSimple)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.paper,
  },
}));

const NewPackageApp = (props) => {
  const dispatch = useDispatch();
  const pageLayout = useRef(null);
  const routeParams = useParams();

  const location = useLocation();
  const user = useSelector(selectUser);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

  useDeepCompareEffect(() => {
    // dispatch(getActivations());
    dispatch(getPackages());
  }, [dispatch]);

  // useEffect(() => {
  //   if (!rightSidebarOpen) dispatch(resetActivation());
  // }, [rightSidebarOpen]);

  useEffect(() => {
    setRightSidebarOpen(Boolean(routeParams.id));
    // setRightSidebarOpen(Boolean(routeParams.id) || location.pathname === '/packages/pricing/new');
  }, [routeParams]);

  return (
    <Root
      header={<NewPackageHeader pageLayout={pageLayout} />}
      content={<StripePricing />}
      ref={pageLayout}
      rightSidebarContent={<NewPackageSidebarContent />}
      rightSidebarOpen={rightSidebarOpen}
      rightSidebarOnClose={() => setRightSidebarOpen(false)}
      rightSidebarWidth={640}
      scroll={isMobile ? 'normal' : 'content'}
    />
  );
};

export default withReducer('packagesApp', reducer)(NewPackageApp);
