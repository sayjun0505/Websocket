// import Icon from '@mui/material/Icon';
// import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { memo } from 'react';

const Widget4 = (props) => {
  // console.log(props);
  return (
    <Paper className="w-full rounded-xl shadow flex flex-col justify-between">
      <div className="flex items-center justify-between px-4 pt-8 min-h-48">
        <Typography className="text-16 px-16 font-medium" color="textSecondary">
          {props.data.title}
        </Typography>
      </div>
      <div className="text-center py-12">
        <Typography className="text-7xl sm:text-8xl font-semibold leading-none text-blue-500 tracking-tighter">
          {(props.data && props.data.data && props.data.data.count) || 0}
        </Typography>
        <Typography className="text-lg font-normal text-blue-600 dark:text-blue-500">
          {props.data.data.name}
        </Typography>
      </div>
    </Paper>
  );
};

export default memo(Widget4);
