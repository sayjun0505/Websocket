import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Modal } from '@mui/material';
import { useState } from 'react';

const ImageViewer = (props) => {
  const { item } = props;
  const messageObj = JSON.parse(item.data);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  if (!item) return null;
  return (
    <div>
      <img
        src={messageObj.url}
        alt={messageObj.id}
        className="h-auto cursor-pointer max-h-xs"
        onClick={() => setImageDialogOpen(true)}
        aria-hidden="true"
      />
      <Modal
        open={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        className="flex w-screen h-screen"
      >
        <>
          <FuseSvgIcon
            className="z-20 absolute right-20 bg-grey-800 hover:bg-black rounded-full cursor-pointer text-white text-48"
            size={40}
            onClick={() => setImageDialogOpen(false)}
          >
            heroicons-outline:x
          </FuseSvgIcon>
          <img
            src={messageObj.url}
            alt={messageObj.id}
            className="max-h-[60vh] max-w-[90%] relative modal-position rounded-8"
          />
        </>
      </Modal>
    </div>
  );
};

export default ImageViewer;
