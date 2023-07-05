// import FuseLoading from '@fuse/core/FuseLoading';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { Controller, useFormContext } from 'react-hook-form';
// import { updateData } from '../../store/replySlice';

function InformationTab(props) {
  const methods = useFormContext();
  const { control, formState } = methods;
  const { errors } = formState;

  return (
    <div className="">
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            className="mt-8 mb-16"
            error={!!errors.name}
            required
            helperText={errors?.name?.message}
            label="Name"
            autoFocus
            id="name"
            variant="outlined"
            fullWidth
          />
        )}
      />

      <Controller
        name="type"
        control={control}
        render={({ field }) => (
          <FormControl variant="outlined" className="w-full m-0">
            <InputLabel>Type</InputLabel>
            <Select {...field} label="Type" id="type" fullWidth className="mt-8 mb-16">
              <MenuItem value="quick">Quick Reply</MenuItem>
              <MenuItem value="auto">Auto Reply</MenuItem>
            </Select>
          </FormControl>
        )}
      />

      <Controller
        name="event"
        control={control}
        render={({ field }) => (
          <FormControl variant="outlined" className="w-full m-0">
            <InputLabel>Event</InputLabel>
            <Select {...field} label="Event" id="event" fullWidth className="mt-8 mb-16">
              {/* <MenuItem value="welcome">Welcome</MenuItem> */}
              <MenuItem value="response">Response</MenuItem>
            </Select>
          </FormControl>
        )}
      />
    </div>
  );
}
export default InformationTab;
