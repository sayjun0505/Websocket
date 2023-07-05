import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Paper, TextareaAutosize } from '@mui/material';
import { useFormContext, useFieldArray } from 'react-hook-form';

// import { editResponseUnsaved } from '../../../store/responseSlice';

function FlexEditor(props) {
  const dispatch = useDispatch();
  const { index, response } = props;
  const [flexValue, setFlexValue] = useState();
  const methods = useFormContext();
  const { control, formState } = methods;
  const { errors } = formState;
  const { fields, append, prepend, swap, remove, update } = useFieldArray({
    name: 'response',
    control,
  });
  const { watch } = methods;
  const watchResponse = watch('response');
  function isJson(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }
  useEffect(() => {
    if (response && response.type && response.type === 'flex') {
      const data = JSON.parse(response.data);
      if (data && data.flex) {
        if (isJson(data.flex)) {
          setFlexValue(JSON.stringify(JSON.parse(data.flex)));
        } else {
          setFlexValue(data.flex);
        }
      } else {
        setFlexValue('');
      }
    }
  }, [response]);

  const onFlexChange = (input) => {
    const { value } = input.target;
    // console.log('Value: ', value);
    let newFlexData = { flex: '{}' };
    setFlexValue(value);
    if (isJson(value)) {
      newFlexData = JSON.stringify({ flex: JSON.stringify(JSON.parse(value)) });
      setFlexValue(value);
      // console.log(JSON.parse(value));
      // console.log(JSON.stringify(JSON.parse(value)));
    } else {
      newFlexData = JSON.stringify({ flex: value });
    }
    // const newFlex = { flex: value };
    // console.log(value);
    const newData = { ...response, data: newFlexData };
    // console.log(newData);

    update(index, newData);
    // dispatch(editResponseUnsaved({ index, response: newData }));
  };

  if (!response) return null;
  return (
    <div className="flex flex-col w-full space-y-1 ">
      <Paper variant="outlined" className="w-full p-24 mb-12">
        <TextareaAutosize
          className="w-full"
          aria-label="Message"
          minRows={10}
          // maxLength={5000}
          placeholder="Enter your flex message in JSON format"
          onChange={onFlexChange}
          value={flexValue}
        />
      </Paper>
    </div>
  );
}

export default FlexEditor;
