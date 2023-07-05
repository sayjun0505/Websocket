import { styled } from '@mui/material/styles';
import withReducer from 'app/store/withReducer';
import FusePageCarded from '@fuse/core/FusePageCarded';
import { useEffect, useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import SettingsHeader from './SettingsHeader';
// import DemoContent from '../../shared-components/DemoContent';
import SettingsSidebarContent from './SettingsSidebarContent';
import reducer from './store';

const Root = styled(FusePageCarded)(({ theme }) => ({
  '& .FusePageCarded-header': {},
  '& .FusePageCarded-sidebar': {},
  '& .FusePageCarded-leftSidebar': {},
  '& .FusePageCarded-content': {
    backgroundColor: theme.palette.background.paper,
  },
}));

const Settings = () => {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const routeParams = useParams();

  useEffect(() => {
    setLeftSidebarOpen(!isMobile);
  }, [isMobile]);

  return (
    <Root
      header={
        <SettingsHeader
          leftSidebarToggle={(ev) => {
            setLeftSidebarOpen(!leftSidebarOpen);
          }}
        />
      }
      content={<Outlet />}
      leftSidebarOpen={leftSidebarOpen}
      leftSidebarOnClose={() => {
        setLeftSidebarOpen(false);
      }}
      leftSidebarContent={<SettingsSidebarContent />}
      scroll="content"
    />
  );
};

export default withReducer('Settings', reducer)(Settings);
