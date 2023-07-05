import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useFormContext, useFieldArray } from 'react-hook-form';

// import { Paper, TextField, Select, FormControl, InputLabel, MenuItem } from '@mui/material';
import { Paper, Select, FormControl, InputLabel, MenuItem } from '@mui/material';
import { ImageStyleEditor, ImageSizeEditor } from './components/ImageEditor';

import CarouselColumnEditor from './components/CarouselColumnEditor';
import PreviewCarousel from '../previews/PreviewCarousel';
// import { editResponseUnsaved } from '../../../store/responseSlice';

function ConfirmEditor(props) {
  const dispatch = useDispatch();
  const { index, response } = props;

  const methods = useFormContext();
  const { control, formState } = methods;
  const { errors } = formState;
  const { fields, append, prepend, swap, remove, update } = useFieldArray({
    name: 'response',
    control,
  });

  const [carouselData, setCarouselData] = useState();
  const [carouselDataUnsaved, setCarouselDataUnsaved] = useState();
  const [numberOfAction, setNumberOfAction] = useState(2);
  const [numberOfColumn, setNumberOfColumn] = useState(2);

  useEffect(() => {
    if (carouselData) {
      setCarouselDataUnsaved(carouselData);
    }
  }, [carouselData]);

  useEffect(() => {
    if (response && response.type && response.type === 'carousel') {
      const data = JSON.parse(response.data);
      if (data && data.carousel) {
        setCarouselData(data.carousel);
        if (data.carousel && data.carousel.columns && data.carousel.columns.length) {
          setNumberOfColumn(data.carousel.columns.length);
          if (
            data.carousel.columns[0] &&
            data.carousel.columns[0].actions &&
            data.carousel.columns[0].actions.length
          )
            setNumberOfAction(data.carousel.columns[0].actions.length);
        }
      } else {
        setCarouselData({
          type: 'carousel',
          columns: [
            {
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
            },
            {
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
            },
          ],
        });
      }
    }
  }, [response]);

  const onColumnNumberChange = (event) => {
    const num = event.target.value;
    setNumberOfColumn(num);

    const newColumns = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < num; i++) {
      if (carouselDataUnsaved.columns[i]) {
        newColumns.push(carouselDataUnsaved.columns[i]);
      } else {
        const newActions = [];
        // eslint-disable-next-line no-plusplus
        for (let j = 0; j < numberOfAction; j++) {
          newActions.push({
            type: 'message',
            label: '',
            text: '',
          });
        }
        newColumns.push({
          title: '',
          text: '',
          actions: newActions,
        });
      }
    }
    const newCarouselData = { ...carouselDataUnsaved, columns: newColumns };
    const newData = { ...response, data: JSON.stringify({ carousel: newCarouselData }) };
    setCarouselData(newCarouselData);
    // dispatch(editResponseUnsaved({ index: index, response: newData }));
    update(index, newData);
  };

  const onActionNumberChange = (event) => {
    const num = event.target.value;
    setNumberOfAction(num);
    const newColumns = [];
    carouselDataUnsaved.columns.forEach((columnData) => {
      const newActions = [];
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < num; i++) {
        if (columnData.actions[i]) {
          newActions.push(columnData.actions[i]);
        } else {
          newActions.push({
            type: 'message',
            label: '',
            text: '',
          });
        }
      }
      newColumns.push({ ...columnData, actions: newActions });
    });
    const newCarouselData = { ...carouselDataUnsaved, columns: newColumns };
    const newData = { ...response, data: JSON.stringify({ carousel: newCarouselData }) };
    setCarouselData(newCarouselData);
    // dispatch(editResponseUnsaved({ index: index, response: newData }));
    update(index, newData);
  };

  const onColumnChange = (columnData, columnIndex) => {
    // console.log('[onColumnChange] ', columnIndex, ' : ', columnData);
    const newColumns = [...carouselDataUnsaved.columns];
    newColumns[columnIndex] = columnData;
    const newCarouselData = { ...carouselDataUnsaved, columns: newColumns };
    const newData = { ...response, data: JSON.stringify({ carousel: newCarouselData }) };
    setCarouselDataUnsaved(newCarouselData);
    // dispatch(editResponseUnsaved({ index: index, response: newData }));
    update(index, newData);
  };

  const onCarouselChange = (input) => {
    const { id, value } = input.target;
    const newCarouselData = { ...carouselDataUnsaved };
    if ((id === 'imageAspectRatio' || id === 'imageSize') && (value === 'default' || !value)) {
      delete newCarouselData[id];
    } else {
      newCarouselData[id] = value;
    }
    const newData = { ...response, data: JSON.stringify({ buttons: newCarouselData }) };
    setCarouselDataUnsaved(newCarouselData);
    // dispatch(editResponseUnsaved({ index: index, response: newData }));
    update(index, newData);
  };

  if (!carouselData) return null;
  return (
    <div className="flex flex-row w-full space-x-24">
      <Paper variant="outlined" className="flex w-1/2 p-24 ">
        <div className="flex flex-col w-full space-y-1 ">
          <div className="flex flex-col space-y-16 items-center">
            <ImageStyleEditor onDataChange={onCarouselChange} data={carouselDataUnsaved} />
            <ImageSizeEditor onDataChange={onCarouselChange} data={carouselDataUnsaved} />

            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Number of Columns</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={numberOfColumn}
                label="Number of Columns"
                // onChange={((event) => { setNumberOfColumn(event.target.value)})}
                onChange={onColumnNumberChange}
              >
                <MenuItem value="1">1</MenuItem>
                <MenuItem value="2">2</MenuItem>
                <MenuItem value="3">3</MenuItem>
                <MenuItem value="4">4</MenuItem>
                <MenuItem value="5">5</MenuItem>
                <MenuItem value="6">6</MenuItem>
                <MenuItem value="7">7</MenuItem>
                <MenuItem value="8">8</MenuItem>
                <MenuItem value="9">9</MenuItem>
                <MenuItem value="10">10</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Number of Actions</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={numberOfAction}
                label="Number of Actions"
                // onChange={(event) => {
                //   setNumberOfAction(event.target.value);
                // }}
                onChange={onActionNumberChange}
              >
                <MenuItem value="1">1</MenuItem>
                <MenuItem value="2">2</MenuItem>
                <MenuItem value="3">3</MenuItem>
              </Select>
            </FormControl>

            {carouselData.columns &&
              carouselData.columns.map((column, i) => (
                <CarouselColumnEditor
                  columnIndex={i}
                  onColumnChange={onColumnChange}
                  columnData={column}
                  numberOfAction={numberOfAction}
                />
              ))}
          </div>
        </div>
      </Paper>

      <Paper variant="outlined" className="flex w-1/2 p-24 ">
        <PreviewCarousel template={carouselDataUnsaved} />
      </Paper>
    </div>
  );
}

export default ConfirmEditor;
