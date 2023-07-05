import { MenuItem, Select } from '@mui/material';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { memo, useEffect, useState } from 'react';

const Widget4 = (props) => {
  // console.log(props);
  const [currentRange, setCurrentRange] = useState(0);

  useEffect(() => {
    if (props.data && props.data.data && props.data.data.currentRange) {
      setCurrentRange(props.data.data.currentRange);
    } else {
      setCurrentRange(0);
    }
  }, [props.data]);

  function handleChangeRange(ev) {
    setCurrentRange(ev.target.value);
  }
  return (
    <Paper className="flex flex-col flex-auto shadow rounded-xl overflow-hidden">
      <div className="flex items-center px-4 pt-8 min-h-48">
        <Select
          className="mx-16 font-normal text-16"
          classes={{ select: 'py-0 flex items-center' }}
          value={currentRange}
          onChange={handleChangeRange}
          inputProps={{
            name: 'currentRange',
          }}
          variant="filled"
          size="small"
        >
          {props.data &&
            props.data.data &&
            props.data.data.ranges &&
            Object.entries(props.data.data.ranges).map(([key, n]) => {
              return (
                <MenuItem key={key} value={key}>
                  {n}
                </MenuItem>
              );
            })}
        </Select>
      </div>
      <div className="text-center py-12">
        <Typography className="text-7xl sm:text-8xl font-semibold tracking-tighter leading-none text-blue-500">
          {(props.data &&
            props.data.data &&
            props.data.data.data &&
            props.data.data.data.count &&
            currentRange &&
            props.data.data.data.count[currentRange]) ||
            0}
        </Typography>
        <Typography className="text-lg font-normal text-blue-600 dark:text-blue-500">
          {props.data.title}
        </Typography>
      </div>
    </Paper>
  );
};

export default memo(Widget4);
