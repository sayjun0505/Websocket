import { useEffect, useState } from 'react';

import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
// import InputLabel from '@mui/material/InputLabel';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

function TimeRange(props) {
  const defaultTime = [
    '00:00',
    '01:00',
    '02:00',
    '03:00',
    '04:00',
    '05:00',
    '06:00',
    '07:00',
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
    '20:00',
    '21:00',
    '22:00',
    '23:00',
    '24:00',
  ];
  const [startOption, setStartOption] = useState(defaultTime);
  const [endOption, setEndOption] = useState(defaultTime);
  const [is24HourState, setIs24HourState] = useState(false);
  const [disableState, setDisableState] = useState(false);

  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  useEffect(() => {
    if (props.value) {
      if (props.value === 'all') {
        setStart('00:00');
        setEnd('24:00');
        setIs24HourState(true);
        setDisableState(false);
      } else if (props.value === 'disable') {
        setDisableState(true);
        setStart('00:00');
        setEnd('24:00');
        setIs24HourState(false);
      } else if (typeof props.value === 'string') {
        const currentValue = String(props.value);
        const range = currentValue.split('-');
        if (range.length === 2) {
          setStart(range[0]);
          setEnd(range[1]);
          setIs24HourState(false);
          setDisableState(false);
        }
      }
    }
  }, [props]);

  const handleStartChange = (event) => {
    setStart(event.target.value);
    setEndOption(defaultTime.slice(defaultTime.indexOf(event.target.value) + 1));

    if (!disableState && !is24HourState && event.target.value === '00:00' && end === '24:00') {
      props.onChange('all', props.id);
    } else if (event.target.value && event.target.value !== '' && end && end !== '') {
      props.onChange(`${event.target.value}-${end}`, props.id);
    }
  };
  const handleEndChange = (event) => {
    setEnd(event.target.value);
    setStartOption(defaultTime.slice(0, defaultTime.indexOf(event.target.value)));

    if (!disableState && !is24HourState && start === '00:00' && event.target.value === '24:00') {
      props.onChange('all', props.id);
    } else if (start && start !== '' && event.target.value && event.target.value !== '') {
      props.onChange(`${start}-${event.target.value}`, props.id);
    }
  };
  const handleChecked24HoursChange = (event) => {
    setIs24HourState(event.target.checked);
    if (event.target.checked) {
      props.onChange('all', props.id);
    } else {
      setStart('');
      setEnd('');
    }
  };
  const handleCheckedDisableChange = (event) => {
    setDisableState(event.target.checked);
    if (event.target.checked) {
      props.onChange('disable', props.id);
    } else {
      setStart('');
      setEnd('');
    }
  };

  return (
    <>
      <div className="hidden md:flex flex-row justify-start items-center space-x-10 w-full my-8">
        <Typography className="min-w-96 capitalize">{props.label}: </Typography>
        {/* <InputLabel id="start-label">Start</InputLabel> */}
        <Select
          labelId="start-label"
          id="start-select"
          value={start}
          label="Start"
          onChange={handleStartChange}
          className="flex w-1/5"
          disabled={is24HourState || disableState || props.disabled}
        >
          {startOption.map((element, index) => {
            return (
              <MenuItem key={index} value={element}>
                {element}
              </MenuItem>
            );
          })}
        </Select>
        <Typography className="mx-10">to</Typography>

        {/* <InputLabel id="end-label">End</InputLabel> */}
        <Select
          labelId="end-label"
          id="end-select"
          value={end}
          label="End"
          onChange={handleEndChange}
          className="flex w-1/5"
          disabled={is24HourState || disableState || props.disabled}
        >
          {endOption.map((element, index) => {
            return (
              <MenuItem key={index} value={element}>
                {element}
              </MenuItem>
            );
          })}
        </Select>

        <div className="flex flex-row items-center space-x-2">
          <Checkbox
            checked={is24HourState}
            onChange={handleChecked24HoursChange}
            inputProps={{ 'aria-label': 'controlled' }}
            disabled={disableState}
          />
          <Typography className="mr-2">24 hours</Typography>

          <Checkbox
            checked={disableState}
            onChange={handleCheckedDisableChange}
            inputProps={{ 'aria-label': 'controlled' }}
          />
          <Typography className="mr-2">Disable</Typography>
        </div>
      </div>

      <div className="flex md:hidden flex-col space-y-10 w-full my-8">
        <Typography className="min-w-96 capitalize">{props.label}: </Typography>
        <div className="flex flex-row justify-center items-center space-x-10 w-full my-8">
          {/* <InputLabel id="start-label">
            Start
          </InputLabel> */}
          <Select
            labelId="start-label"
            id="start-select"
            value={start}
            label="Start"
            onChange={handleStartChange}
            className="flex w-2/3"
            disabled={is24HourState || disableState || props.disabled}
          >
            {startOption.map((element, index) => {
              return (
                <MenuItem key={index} value={element}>
                  {element}
                </MenuItem>
              );
            })}
          </Select>
          <Typography className="mx-10 items-center">to</Typography>

          {/* <InputLabel id="end-label">
            End
          </InputLabel> */}
          <Select
            labelId="end-label"
            id="end-select"
            value={end}
            label="End"
            onChange={handleEndChange}
            className="flex w-2/3"
            disabled={is24HourState || disableState || props.disabled}
          >
            {endOption.map((element, index) => {
              return (
                <MenuItem key={index} value={element}>
                  {element}
                </MenuItem>
              );
            })}
          </Select>
        </div>

        {/* <div className="flex flex-row items-center space-x-2">
          <Checkbox
            checked={is24HourState}
            onChange={handleChecked24HoursChange}
            inputProps={{ 'aria-label': 'controlled' }}
            disabled={disableState}
          />
          <Typography className="mr-2">24 hours</Typography>

          <Checkbox
            checked={disableState}
            onChange={handleCheckedDisableChange}
            inputProps={{ 'aria-label': 'controlled' }}
          />
          <Typography className="mr-2">Disable</Typography>
        </div> */}
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={is24HourState}
                onChange={handleChecked24HoursChange}
                disabled={disableState}
              />
            }
            label="24 hours"
          />
          <FormControlLabel
            control={<Checkbox checked={disableState} onChange={handleCheckedDisableChange} />}
            label="Disable"
          />
        </FormGroup>
      </div>
    </>
  );
}

export default TimeRange;
