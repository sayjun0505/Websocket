import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { memo, useEffect, useState } from 'react';
import Box from '@mui/material/Box';

const WidgetPackageMessage = (props) => {
  const { limit, count } = props.data;
  const [awaitRender, setAwaitRender] = useState(true);

  const colors = ['#DD6B20', '#F6AD55'];

  useEffect(() => {
    setAwaitRender(false);
  }, []);

  if (awaitRender || !limit || !count) {
    return null;
  }
  return (
    <Paper className="flex flex-col flex-auto shadow border  rounded-2xl overflow-hidden p-24">
      <div className="flex flex-col sm:flex-row items-start justify-between">
        <Typography className="text-lg font-medium tracking-tight leading-6 truncate">
          Message
        </Typography>
      </div>

      <div className="flex flex-col flex-auto mt-24 h-96">
        <div className="text-center py-12 flex flex-row items-baseline justify-center">
          <Typography
            className="text-7xl sm:text-8xl font-semibold leading-none  tracking-tighter"
            sx={{ color: colors[0] }}
          >
            {Math.round(parseFloat((count / limit) * 100) * 100) / 100}
          </Typography>
          <Typography className="text-2xl font-normal pl-4" sx={{ color: colors[1] }}>
            %
          </Typography>
        </div>
      </div>
      <div className="mt-32">
        <div className="-my-12 divide-y">
          <div className="grid grid-cols-2 py-12" key={0}>
            <div className="flex items-center">
              <Box className="flex-0 w-8 h-8 rounded-full" sx={{ backgroundColor: colors[0] }} />
              <Typography className="ml-12 truncate">count</Typography>
            </div>
            <Typography className="font-medium text-right pr-10">
              {count.toLocaleString('en-US')}
            </Typography>
          </div>
          <div className="grid grid-cols-2 py-12" key={1}>
            <div className="flex items-center">
              <Box className="flex-0 w-8 h-8 rounded-full" sx={{ backgroundColor: colors[1] }} />
              <Typography className="ml-12 truncate">limit</Typography>
            </div>
            <Typography className="font-medium text-right pr-10">
              {limit.toLocaleString('en-US')}
            </Typography>
          </div>
        </div>
      </div>
    </Paper>
  );
};

export default memo(WidgetPackageMessage);
