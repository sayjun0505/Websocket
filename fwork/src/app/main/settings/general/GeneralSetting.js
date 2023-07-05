import { styled } from '@mui/material/styles';
import withReducer from 'app/store/withReducer';
import FusePageCarded from '@fuse/core/FusePageCarded';
import { useEffect, useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import GeneralSettingHeader from './GeneralSettingHeader';
// import DemoContent from '../../shared-components/DemoContent';
import GeneralSettingSidebarContent from './GeneralSettingSidebarContent';
import reducer from './store';

const Root = styled(FusePageCarded)(({ theme }) => ({
  '& .FusePageCarded-header': {},
  '& .FusePageCarded-sidebar': {},
  '& .FusePageCarded-leftSidebar': {},
  '& .FusePageCarded-content': {
    backgroundColor: theme.palette.background.paper,
  },
}));

function GeneralSetting() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const routeParams = useParams();

  useEffect(() => {
    setLeftSidebarOpen(!isMobile);
  }, [isMobile]);

  return (
    <Root
      header={
        <GeneralSettingHeader
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
      leftSidebarContent={<GeneralSettingSidebarContent />}
      scroll="content"
    />
  );
}

export default withReducer('generalSetting', reducer)(GeneralSetting);
