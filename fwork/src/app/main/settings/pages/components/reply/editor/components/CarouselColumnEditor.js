import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { TextField, Typography } from '@mui/material';
import { BackgroundColorEditor, ImageEditor } from './ImageEditor';

import ActionEditor from './ActionEditor';
// import PreviewButtons from '../previews/PreviewButtons';
// import { editResponse } from '../../../store/responseSlice';

const CarouselColumnEditor = (props) => {
  const dispatch = useDispatch();
  const { columnIndex, onColumnChange, columnData } = props;

  const [column, setColumn] = useState();

  const [title, setTitle] = useState('');
  const [text, setText] = useState('');

  useEffect(() => {
    // console.log('[CarouselColumnEditor]  columnData ', columnData);
    if (columnData) {
      setColumn(columnData);
      if (columnData.text) setText(columnData.text);
      if (columnData.title) setTitle(columnData.title);
    } else {
      // set default column
      setColumn({
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
    }
  }, [columnData]);

  const onColumnDataChange = (event) => {
    const { id, value } = event.target;
    // console.log('[CarouselColumnEditor/onColumnDataChange] ', id, ' : ', value);
    if (id === 'text') setText(value);
    if (id === 'title') setTitle(value);
    const newColumnData = { ...column };
    // newColumnData[id] = value;
    if ((id === 'imageAspectRatio' || id === 'imageSize') && (value === 'default' || !value)) {
      delete newColumnData[id];
    } else {
      newColumnData[id] = value;
    }
    setColumn(newColumnData);
    onColumnChange(newColumnData, columnIndex);
  };

  const onActionChange = (event, actionIndex) => {
    const { id, value } = event.target;
    const newAction = { ...column.actions[actionIndex] };
    newAction[id] = value;
    const newActions = [...column.actions];
    newActions[actionIndex] = newAction;
    const newColumnData = { ...column, actions: newActions };
    setColumn(newColumnData);
    onColumnChange(newColumnData, columnIndex);
  };

  if (!column) return null;
  return (
    <div className="flex flex-col w-full space-y-1 ">
      <Typography color="textSecondary" variant="button" className="py-16">
        {`Column ${columnIndex + 1 || ''}`}
      </Typography>
      <div className="flex flex-col w-full space-y-16 ">
        <ImageEditor onDataChange={onColumnDataChange} data={column} index={columnIndex} />
        <BackgroundColorEditor onDataChange={onColumnDataChange} data={column} />
        <TextField
          label="Title"
          id="title"
          variant="outlined"
          value={title}
          required
          fullWidth
          onChange={onColumnDataChange}
        />
        <TextField
          label="Text"
          id="text"
          variant="outlined"
          value={text}
          required
          fullWidth
          onChange={onColumnDataChange}
        />

        {column.actions &&
          column.actions.map((action, index) => (
            <ActionEditor actionIndex={index} onActionChange={onActionChange} actionData={action} />
          ))}
      </div>
    </div>
  );
};

export default CarouselColumnEditor;
