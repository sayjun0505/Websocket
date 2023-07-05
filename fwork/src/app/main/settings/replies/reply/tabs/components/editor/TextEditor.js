import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Paper, TextareaAutosize, Button } from '@mui/material';
import { showMessage } from 'app/store/fuse/messageSlice';
import { useFormContext, useFieldArray } from 'react-hook-form';

// import { editResponseUnsaved } from '../../../store/responseSlice';

function TextEditor(props) {
  const dispatch = useDispatch();
  const { index, response } = props;
  const [textAreaValue, setTextAreaValue] = useState();

  const methods = useFormContext();
  const { control, formState } = methods;
  const { errors } = formState;
  const { fields, append, prepend, swap, remove, update } = useFieldArray({
    name: 'response',
    control,
  });

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
    <div className="flex flex-col w-full space-y-1 ">
      <Paper variant="outlined" className="w-full p-24 mb-12">
        <TextareaAutosize
          className="w-full"
          aria-label="Message"
          minRows={3}
          maxLength={1000}
          placeholder="Enter your message"
          onChange={onTextChange}
          value={textAreaValue}
        />
      </Paper>
      {/* Menu */}
      <div className="flex flex-row justify-between w-full space-x-1 ">
        <div className="flex flex-row space-x-8">
          <Button variant="outlined" color="primary" onClick={() => addTag('display')}>
            <span className="hidden sm:flex">User's display name</span>
            <span className="flex sm:hidden">User</span>
          </Button>
          <Button variant="outlined" color="primary" onClick={() => addTag('accountName')}>
            <span className="hidden sm:flex">Account name</span>
            <span className="flex sm:hidden">Account</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default TextEditor;
