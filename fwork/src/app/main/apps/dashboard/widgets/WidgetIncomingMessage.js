import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { memo } from 'react';

const Widget4 = (props) => {
  return (
    <Paper className="w-full rounded-xl shadow flex flex-col justify-between bg-green-50">
      <div className="text-center py-12">
        <Typography className="text-7xl sm:text-8xl font-semibold leading-none text-green tracking-tighter">
          {props.data.count}
        </Typography>
        <Typography className="text-lg font-normal text-green-800">{props.data.title}</Typography>
      </div>
    </Paper>
  );
};

export default memo(Widget4);
