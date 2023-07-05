import IconButton from '@mui/material/IconButton';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import CircularProgress from '@mui/material/CircularProgress';

import { sendFileAttachment } from '../../../../store/cardSlice';
import AttachmentModel from '../../../../model/AttachmentModel';

const AttachmentMenu = ({ boardId, cardId, onAddAttachment }) => {
  const dispatch = useDispatch();
  const [fileLoading, setFileLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handlerFileInput = (event) => {
    setFileLoading(true);
    const formData = new FormData();
    formData.append('file', event.target.files[0]);

    dispatch(
      sendFileAttachment({
        boardId,
        cardId,
        formData,
      })
    )
      .unwrap()
      .then((payload) => {
        setTimeout(() => {
          setFileLoading(false);
          onAddAttachment(AttachmentModel(payload));
        }, 5000);
      });
  };

  return (
    <div>
      {fileLoading ? (
        <CircularProgress color="inherit" size={20} />
      ) : (
        <IconButton size="large" component="label">
          <input
            hidden
            accept="image/gif, image/png, image/jpeg, video/mp4, application/pdf, application/msword,"
            onChange={handlerFileInput}
            type="file"
          />
          <FuseSvgIcon>heroicons-outline:paper-clip</FuseSvgIcon>
        </IconButton>
      )}
    </div>
  );
};

export default AttachmentMenu;
