import Paper from '@mui/material/Paper';
// import { useTheme } from '@mui/material/styles';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { memo, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getLimitation, selectLimitation } from '../store/limitationSlice';
import WidgetPackageMessage from './WidgetPackageMessage';
import WidgetPackageOrganization from './WidgetPackageOrganization';
import WidgetPackageStorage from './WidgetPackageStorage';
import WidgetPackageUser from './WidgetPackageUser';

const WidgetPackage = () => {
  const dispatch = useDispatch();
  const [awaitRender, setAwaitRender] = useState(true);
  const limitation = useSelector(selectLimitation);  
  useEffect(() => {
    dispatch(getLimitation()).then(() => setAwaitRender(false));
  }, [dispatch]);

  if (awaitRender || !limitation) {
    return null;
  }

  return (
    <Paper className="flex flex-col flex-auto p-24 shadow rounded-xl overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start justify-between">
        <Typography className="text-lg font-medium tracking-tight leading-6 truncate">
          Package Summary
        </Typography>

        {limitation.package && limitation.package.status === 'active' && (
          <Chip label="Active" color="success" />
        )}
        {limitation.package && limitation.package.status === 'inactive' && (
          <Chip label="Inactive" />
        )}
        {limitation.package && limitation.package.status === 'expired' && (
          <Chip label="Expired" color="warning" />
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 grid-flow-row gap-24 w-full mt-32 sm:mt-16">
        <div className="flex flex-col flex-auto">
          <div className="flex-auto grid grid-cols-2 gap-16 mt-24">
            <WidgetPackageMessage data={limitation.message} />
            <WidgetPackageStorage data={limitation.storage} />
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex-auto grid grid-cols-2 gap-16 mt-24">
            <WidgetPackageUser data={limitation.user} />
            <WidgetPackageOrganization data={limitation.organization} />
          </div>
        </div>
      </div>
    </Paper>
  );
};

export default memo(WidgetPackage);
