import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { TextField } from '@mui/material';
import { useFieldArray, useFormContext } from 'react-hook-form';
import clsx from 'clsx';

import ActionEditor from './components/ActionEditor';
// import { editResponseUnsaved } from '../../../store/responseSlice';

const ConfirmEditor = (props) => {
  const dispatch = useDispatch();
  const { index, response } = props;

  const methods = useFormContext();
  const { control, formState, watch } = methods;
  const { errors } = formState;
  const { fields, append, prepend, swap, remove, update } = useFieldArray({
    name: 'response',
    control,
  });

  const watchChannel = watch('channel');

  const [confirmData, setConfirmData] = useState();
  const [textValue, setTextValue] = useState('');

  useEffect(() => {
    if (response && response.type && response.type === 'confirm') {
      const data = JSON.parse(response.data);
      if (data && data.confirm) {
        setConfirmData(data.confirm);
        setTextValue(data.confirm.text);
      } else {
        setConfirmData({
          type: 'confirm',
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
          text: '',
        });
      }
    }
  }, [response]);

  const onConfirmChange = (input) => {
    const { id, value } = input.target;
    if (id === 'text') {
      setTextValue(value);
    }
    const newConfirmData = { ...confirmData };
    newConfirmData[id] = value;
    const newData = { ...response, data: JSON.stringify({ confirm: newConfirmData }) };
    setConfirmData(newConfirmData);
    // dispatch(editResponseUnsaved({ index, response: newData }));
    update(index, newData);
  };

  const onActionChange = (event, actionIndex) => {
    const { id, value } = event.target;
    const newAction = { ...confirmData.actions[actionIndex] };
    newAction[id] = value;
    const newActions = [...confirmData.actions];
    newActions[actionIndex] = newAction;
    const newConfirmData = { ...confirmData, actions: newActions };
    const newData = { ...response, data: JSON.stringify({ confirm: newConfirmData }) };
    setConfirmData(newConfirmData);
    // dispatch(editResponseUnsaved({ index, response: newData }));
    update(index, newData);
  };

  if (!confirmData) return null;
  return (
    // <div className="flex flex-row w-full space-x-24">
    //   <Paper variant="outlined" className="flex w-1/2 p-24 ">
    <div
      className={clsx(
        'flex flex-col w-full space-y-1',
        !watchChannel.line || watchChannel.facebook || watchChannel.instagram
          ? ' pointer-events-none opacity-30'
          : ''
      )}
    >
      <div className="flex flex-col space-y-16 items-center">
        <TextField
          label="Text"
          id="text"
          variant="outlined"
          value={textValue}
          required
          fullWidth
          onChange={onConfirmChange}
        />
        {/* <ActionEditor actionIndex={0} data={confirmData} index={index} response={response} />
            <ActionEditor actionIndex={1} data={confirmData} index={index} response={response} /> */}
        {confirmData.actions &&
          confirmData.actions.map((action, actionIndex) => (
            <ActionEditor
              actionIndex={actionIndex}
              onActionChange={onActionChange}
              actionData={action}
              // data={buttonsData}
              // index={index}
              // response={response}
            />
          ))}
      </div>
    </div>
    // </Paper>

    // <Paper variant="outlined" className="flex w-1/2 p-24 ">
    //   <PreviewConfirm template={confirmData} />
    // </Paper>
    // </div>
  );
};

export default ConfirmEditor;
