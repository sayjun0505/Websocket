import { useEffect, useState } from 'react';
// import { useDispatch } from 'react-redux';
// import TextareaAutosize from '@mui/material/TextareaAutosize';

// import makeStyles from '@mui/styles/makeStyles';
// import TextField from '@mui/material/TextField';
// import Typography from '@mui/material/Typography';
import { useDispatch } from 'react-redux';
import { FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';

// import { editResponse } from '../../../../store/responseSlice';

const ActionEditor = (props) => {
  const dispatch = useDispatch();
  const { actionIndex, onActionChange, actionData } = props;

  // const [action, setAction] = useState();
  const [type, setType] = useState('message');
  const [label, setLabel] = useState('');
  const [text, setText] = useState('');
  const [uri, setURI] = useState('');

  useEffect(() => {
    // console.log('[ActionEditor]  actionData ', actionData);
    if (actionData) {
      if (actionData.type) setType(actionData.type);
      if (actionData.label) setLabel(actionData.label);
      if (actionData.text) setText(actionData.text);
      if (actionData.uri) setURI(actionData.uri);
      // setAction(actionData);
    }
  }, [actionData]);

  // const onActionTypeChange = (event) => {
  //   const type = event.target.value;

  // };

  if (!actionData) return null;

  return (
    <div className="flex flex-col w-full space-y-1 ">
      <Typography color="textSecondary" variant="button" className="py-16">
        {`Action ${actionIndex + 1 || ''}`}
      </Typography>
      <div className="flex flex-col w-full space-y-16 ">
        <div className="flex">
          <div className="min-w-48 pt-20">
            <Typography color="textSecondary" variant="button" className="capitalize">
              Type
            </Typography>
          </div>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Type</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="type"
              value={type || 'message'}
              label="Type"
              onChange={(event) => {
                setType(event.target.value);
                onActionChange({ target: { id: 'type', value: event.target.value } }, actionIndex);
              }}
            >
              <MenuItem value="message">Message</MenuItem>
              <MenuItem value="uri">URI</MenuItem>
            </Select>
          </FormControl>
        </div>
        <div className="flex">
          <div className="min-w-48 pt-20">
            <Typography color="textSecondary" variant="button" className="capitalize">
              Label
            </Typography>
          </div>
          <TextField
            label="Label"
            id="label"
            variant="outlined"
            required
            fullWidth
            value={label}
            onChange={(event) => {
              setLabel(event.target.value);
              onActionChange(event, actionIndex);
            }}
          />
        </div>
        {type === 'message' && (
          <div className="flex">
            <div className="min-w-48 pt-20">
              <Typography color="textSecondary" variant="button" className="capitalize">
                Text
              </Typography>
            </div>
            <TextField
              label="Text"
              id="text"
              variant="outlined"
              required
              fullWidth
              value={text || ''}
              onChange={(event) => {
                setText(event.target.value);
                onActionChange(event, actionIndex);
              }}
            />
          </div>
        )}
        {type === 'uri' && (
          <div className="flex">
            <div className="min-w-48 pt-20">
              <Typography color="textSecondary" variant="button" className="capitalize">
                URI
              </Typography>
            </div>
            <TextField
              label="URI"
              id="uri"
              variant="outlined"
              required
              fullWidth
              value={uri || ''}
              onChange={(event) => {
                setURI(event.target.value);
                onActionChange(event, actionIndex);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionEditor;
