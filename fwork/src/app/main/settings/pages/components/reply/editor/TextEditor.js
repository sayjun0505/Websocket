import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button, Paper, TextareaAutosize } from '@mui/material';
import { showMessage } from 'app/store/fuse/messageSlice';
import { useFieldArray, useFormContext } from 'react-hook-form';
import clsx from 'clsx';

// import { editResponseUnsaved } from '../../../store/responseSlice';

const TextEditor = (props) => {
  const dispatch = useDispatch();
  const { index, response } = props;
  const [textAreaValue, setTextAreaValue] = useState();

  const methods = useFormContext();
  const { control, formState, watch } = methods;
  const { errors } = formState;
  const { fields, append, prepend, swap, remove, update } = useFieldArray({
    name: 'response',
    control,
  });

  const watchChannel = watch('channel');

  useEffect(() => {
    if (response && response.type && response.type === 'text') {
      const data = JSON.parse(response.data);
      if (data && data.text) {
        setTextAreaValue(data.text);
      } else {
        setTextAreaValue('');
      }
    }
  }, [response]);

  const onTextChange = (input) => {
    const { value } = input.target;
    if (value.length === 1000) {
      dispatch(showMessage({ message: 'Maximum message length.', variant: 'info' }));
    }
    if (value.length <= 1000) {
      setTextAreaValue(value);
      const newText = JSON.stringify({ text: value });
      const newData = { ...response, data: newText };
      // dispatch(editResponseUnsaved({ index, response: newData }));
      update(index, newData);
    } else {
      dispatch(showMessage({ message: 'Maximum message length.', variant: 'error' }));
    }
  };

  const addTag = (tag) => {
    const text = `${textAreaValue} {{${tag}}} `;
    const newText = JSON.stringify({ text });
    if (newText.length <= 1000) {
      setTextAreaValue(text);
      const newData = { ...response, data: newText };
      // dispatch(editResponseUnsaved({ index, response: newData }));
      update(index, newData);
    } else {
      dispatch(showMessage({ message: 'Maximum message length.', variant: 'error' }));
    }
  };

  if (!response) return null;
  return (
    <div
      className={clsx(
        'flex flex-col w-full space-y-1',
        !watchChannel.line && !watchChannel.facebook && !watchChannel.instagram
          ? ' pointer-events-none opacity-30'
          : ''
      )}
    >
      <Paper variant="outlined" className="w-full p-8 mb-12 rounded">
        <TextareaAutosize
          className="w-full rounded"
          aria-label="Message"
          minRows={5}
          maxLength={1000}
          placeholder="Enter your message"
          onChange={onTextChange}
          value={textAreaValue}
        />
      </Paper>
      {/* Menu */}
      <div className="flex flex-row justify-between w-full space-x-1 ">
        <div className="flex flex-row space-x-8">
          <Button
            className="text-gray-500"
            variant="outlined"
            size="small"
            onClick={() => addTag('display')}
          >
            {`{{Display Name}}`}
          </Button>
          <Button
            className="text-gray-500"
            variant="outlined"
            size="small"
            onClick={() => addTag('accountName')}
          >
            {`{{Account Name}}`}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TextEditor;
