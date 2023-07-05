import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Modal } from '@mui/material';
import { useState } from 'react';

const ImageViewer = (props) => {
  const { src } = props;
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  if (!src) return null;
  return (
    <div className="block">
      <img
        src={src}
        alt="attachment"
        className="cursor-pointer"
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
            src={src}
            alt="attachment"
            className="max-h-[90vh] relative modal-position rounded-8"
          />
        </>
      </Modal>
    </div>
  );
};

export default ImageViewer;
