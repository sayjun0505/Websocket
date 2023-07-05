import { Button, Typography } from '@mui/material';
import { useContext } from 'react';

import ChatAppContext from '../../ChatAppContext';

// export const OpenHistoryButton = (props) => {
//   const chat = useSelector(selectChat);
//   return (
//     <>
//       {/* Button Open Chat history */}
//       <Button
//         component={Link}
//         variant="outlined"
//         className="rounded border-gray"
//         to={`/apps/chat/${chat.id}/history`}
//         onClick={props.onClose}
//       >
//         <Typography className="capitalize font-medium">Open History</Typography>
//       </Button>
//     </>
//   );
// };

const OpenCommentButton = (props) => {
  const { handleClose } = props;
  const { handleCommentSidebarOpen } = useContext(ChatAppContext);
  return (
    <>
      {/*  Button Open Comments Sidebar */}
      <Button
        onClick={() => {
          handleClose();
          setTimeout(() => {
            handleCommentSidebarOpen();
          }, 100);
        }}
        variant="outlined"
        size="small"
        className="rounded border-gray"
      >
        <Typography className="capitalize font-medium">Comments</Typography>
      </Button>
    </>
  );
};

export default OpenCommentButton;
