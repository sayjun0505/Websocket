import { useEffect, useState } from 'react';
import FuseLoading from '@fuse/core/FuseLoading';
import { useDispatch } from 'react-redux';
// import { Paper, TextareaAutosize, Button, IconButton, CircularProgress, AddPhotoAlternate } from '@mui/material';

import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Button, IconButton, Paper, Typography } from '@mui/material';
// import { showMessage } from 'app/store/fuse/messageSlice';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import clsx from 'clsx';

import { uploadImage } from '../../../../store/responseSlice';

const ImageEditor = (props) => {
  const dispatch = useDispatch();
  const routeParams = useParams();
  const { index, response } = props;
  // const { id: replyId } = routeParams;
  const [imageURL, setImageURL] = useState();
  const [fileLoading, setFileLoading] = useState(false);

  const methods = useFormContext();
  const { control, formState, watch } = methods;
  const { errors } = formState;
  const { fields, append, prepend, swap, remove, update } = useFieldArray({
    name: 'response',
    control,
  });

  const watchChannel = watch('channel');
  const watchId = watch('id');

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

    dispatch(uploadImage({ formData, replyId: watchId })).then(({ payload }) => {
      const { url, filename } = payload;
      setTimeout(async () => {
        update(index, { ...response, data: JSON.stringify({ image: { url, filename } }) });
        setFileLoading(false);
      }, 3000);
    });
  };

  const handleRemoveImage = () => {
    setFileLoading(true);
    update(index, { ...response, data: null });
    setImageURL(null);
    setFileLoading(false);
  };

  if (fileLoading) {
    return <FuseLoading />;
  }

  if (!response) return null;
  return (
    // <div className="flex flex-col w-full space-y-1 items-center">
    <div
      className={clsx(
        'flex flex-col w-full space-y-1 items-center',
        !watchChannel.line && !watchChannel.facebook && !watchChannel.instagram
          ? ' pointer-events-none opacity-30'
          : ''
      )}
    >
      {/* Menu */}

      {imageURL ? (
        <Paper variant="outlined" className=" p-8 items-center inline-block relative rounded">
          <img src={imageURL} alt="" className="w-auto h-auto" sx={{ m: 1, maxWidth: 50 }} />
          <IconButton
            disableRipple
            className="-top-12 -right-12 absolute bg-black opacity-70 p-2"
            size="small"
            color="inherit"
            onClick={handleRemoveImage}
          >
            <FuseSvgIcon size={18} className=" text-white" color="inherit">
              heroicons-solid:x
            </FuseSvgIcon>
          </IconButton>
        </Paper>
      ) : (
        <div className="flex flex-col w-full space-x-1 mb-12">
          <Button
            sx={{ borderColor: 'lightgray' }}
            color="secondary"
            variant="outlined"
            component="label"
            className="w-full rounded border-dashed color-blue"
          >
            Upload Image
            <input
              accept="image/gif, image/png, image/jpeg, video/mp4"
              onChange={handleFileInput}
              className="hidden"
              type="file"
            />
          </Button>
          <div className="flex flex-col w-full space-x-1 mt-8 text-gray-500">
            <Typography variant="caption">File formats: JPG,JPEG,PNG,GIF,MP4</Typography>
            <Typography variant="caption">File size: Up to 10 MB</Typography>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageEditor;
