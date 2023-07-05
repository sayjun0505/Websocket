import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
// import { Paper, TextareaAutosize, Button, IconButton, CircularProgress, AddPhotoAlternate } from '@mui/material';
import { Paper, Button } from '@mui/material';
// import { showMessage } from 'app/store/fuse/messageSlice';
import { useFormContext, useFieldArray } from 'react-hook-form';

import { uploadImage } from '../../../../store/responseSlice';

function TextEditor(props) {
  const dispatch = useDispatch();
  const { index, response } = props;
  const [imageURL, setImageURL] = useState();
  const [fileLoading, setFileLoading] = useState(false);

  const methods = useFormContext();
  const { control, formState } = methods;
  const { errors } = formState;
  const { fields, append, prepend, swap, remove, update } = useFieldArray({
    name: 'response',
    control,
  });

  useEffect(() => {
    // console.log('IMAGE ', response);
    if (response && response.type && response.type === 'image') {
      const data = JSON.parse(response.data);
      if (data && data.image) {
        // console.log('IMAGE DATA ', data.image);
        setImageURL(data.image.url);
      } else {
        setImageURL(null);
      }
    }
  }, [response]);

  const handleFileInput = (event) => {
    setFileLoading(true);
    const formData = new FormData();
    formData.append('file', event.target.files[0]);

    dispatch(uploadImage({ formData })).then(({ payload }) => {
      const { url, filename } = payload;
      setTimeout(async () => {
        update(index, { ...response, data: JSON.stringify({ image: { url, filename } }) });
        setFileLoading(false);
      }, 3000);
    });
  };

  if (!response) return null;
  return (
    <div className="flex flex-col w-full space-y-1 items-center">
      {/* Menu */}
      <div className="flex flex-row justify-between w-full space-x-1 mb-12">
        <div className="flex flex-row space-x-8">
          <input
            accept="image/gif, image/png, image/jpeg, video/mp4"
            onChange={handleFileInput}
            className="hidden"
            id="icon-button-file"
            type="file"
          />
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label htmlFor="icon-button-file">
            {/* <IconButton
                className="absolute ltr:left-48 rtl:right-48 top-0"
                aria-label="upload picture"
                component="span"
                size="large"
              >
                {fileLoading ? <CircularProgress size={24} /> : <AddPhotoAlternate />}
              </IconButton> */}
            <Button variant="contained" component="span">
              Upload
            </Button>
          </label>
        </div>
      </div>
      {imageURL && (
        <Paper variant="outlined" className="w-full p-24  items-center flex">
          <img src={imageURL} alt="" className="w-auto h-auto" sx={{ m: 1, maxWidth: 50 }} />
        </Paper>
      )}
    </div>
  );
}

export default TextEditor;
