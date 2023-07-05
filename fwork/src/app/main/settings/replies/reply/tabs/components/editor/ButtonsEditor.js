import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Paper, TextField, Select, FormControl, InputLabel, MenuItem } from '@mui/material';
import { useFormContext, useFieldArray } from 'react-hook-form';
// import { SketchPicker } from 'react-color';

import ActionEditor from './components/ActionEditor';
import {
  ImageStyleEditor,
  ImageSizeEditor,
  BackgroundColorEditor,
  ImageEditor,
} from './components/ImageEditor';
import PreviewButtons from '../previews/PreviewButtons';
// import { editResponseUnsaved } from '../../../store/responseSlice';

function ButtonsEditor(props) {
  const dispatch = useDispatch();
  const { index, response } = props;

  const methods = useFormContext();
  const { control, formState } = methods;
  const { errors } = formState;
  const { fields, append, prepend, swap, remove, update } = useFieldArray({
    name: 'response',
    control,
  });

  // Set Default value
  const [buttonsData, setButtonsData] = useState({
    type: 'buttons',
    title: '',
    text: '',
    actions: [
      {
        type: 'message',
        label: '',
        text: '',
      },
      {
        type: 'message',
        label: '',
        text: '',
      },
    ],
  });

  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [numberOfAction, setNumberOfAction] = useState(2);

  useEffect(() => {
    // console.log('ButtonsEditor ', response);
    if (response && response.type && response.type === 'buttons' && response.data) {
      const data = JSON.parse(response.data);
      if (data && data.buttons) {
        // Initial value
        setButtonsData(data.buttons);

        setText(data.buttons.text);
        setTitle(data.buttons.title);
        if (data.buttons.actions && data.buttons.actions.length) {
          setNumberOfAction(data.buttons.actions.length);
        }
      }
    }
  }, [response]);

  const onButtonsChange = (input) => {
    const { id, value } = input.target;
    if (id === 'text') {
      setText(value);
    }
    if (id === 'title') {
      setTitle(value);
    }
    const newButtonsData = { ...buttonsData };
    if ((id === 'imageAspectRatio' || id === 'imageSize') && (value === 'default' || !value)) {
      delete newButtonsData[id];
    } else {
      newButtonsData[id] = value;
    }
    const newData = { ...response, data: JSON.stringify({ buttons: newButtonsData }) };
    setButtonsData(newButtonsData);
    update(index, newData);
  };

  const onActionNumberChange = (event) => {
    const num = event.target.value;
    setNumberOfAction(num);

    const newActions = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < num; i++) {
      // console.log('LOOP ', i, buttonsData.actions[i] ? 'true' : 'false');
      // newActions.push(index);
      if (buttonsData.actions[i]) {
        newActions.push(buttonsData.actions[i]);
      } else {
        newActions.push({
          type: 'message',
          label: '',
          text: '',
        });
      }
    }

    // console.log('[New Actions] ', newActions);
    const newButtonsData = { ...buttonsData, actions: newActions };
    setButtonsData(newButtonsData);
    const newData = { ...response, data: JSON.stringify({ buttons: newButtonsData }) };
    update(index, newData);
  };

  const onActionChange = (event, actionIndex) => {
    const { id, value } = event.target;
    const newAction = { ...buttonsData.actions[actionIndex] };
    newAction[id] = value;
    const newActions = [...buttonsData.actions];
    newActions[actionIndex] = newAction;
    const newButtonsData = { ...buttonsData, actions: newActions };
    const newData = { ...response, data: JSON.stringify({ buttons: newButtonsData }) };
    setButtonsData(newButtonsData);
    update(index, newData);
  };

  if (!buttonsData) return null;

  return (
    <div className="flex flex-row w-full space-x-24">
      <Paper variant="outlined" className="flex w-1/2 p-24 ">
        <div className="flex flex-col w-full space-y-1 ">
          <div className="flex flex-col space-y-16 items-center">
            <ImageStyleEditor onDataChange={onButtonsChange} data={buttonsData} />
            <ImageSizeEditor onDataChange={onButtonsChange} data={buttonsData} />
            <ImageEditor onDataChange={onButtonsChange} data={buttonsData} />
            <BackgroundColorEditor onDataChange={onButtonsChange} data={buttonsData} />

            <TextField
              label="Title"
              id="title"
              variant="outlined"
              value={title}
              required
              fullWidth
              onChange={onButtonsChange}
            />
            <TextField
              label="Text"
              id="text"
              variant="outlined"
              value={text}
              required
              fullWidth
              onChange={onButtonsChange}
            />
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Number of Actions</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={numberOfAction}
                label="Number of Actions"
                onChange={onActionNumberChange}
              >
                <MenuItem value="1">1</MenuItem>
                <MenuItem value="2">2</MenuItem>
                <MenuItem value="3">3</MenuItem>
                <MenuItem value="4">4</MenuItem>
              </Select>
            </FormControl>

            {buttonsData.actions &&
              buttonsData.actions.map((action, i) => (
                <ActionEditor
                  actionIndex={i}
                  onActionChange={onActionChange}
                  actionData={action}
                  // data={buttonsData}
                  // responseIndex={responseIndex}
                  // response={response}
                />
              ))}
          </div>
        </div>
      </Paper>

      <Paper variant="outlined" className="flex w-1/2 p-24 ">
        <PreviewButtons template={buttonsData} />
      </Paper>
    </div>
  );
}

export default ButtonsEditor;
