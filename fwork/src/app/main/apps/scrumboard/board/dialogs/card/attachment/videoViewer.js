import { useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import VideoModal from './videoModal';

const VideoViewer = (props) => {
  const { src } = props;
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  // video play
  const ref = useRef();

  if (!src) return null;
  return (
    <div className="w-full relative">
      <ReactPlayer
        ref={ref}
        url={src}
        width="100%"
        height="100%"
        onClick={() => setVideoModalOpen(true)}
        className="cursor-pointer"
      />
      <VideoModal open={videoModalOpen} onClose={() => setVideoModalOpen(false)} src={src} />
    </div>
  );
};

export default VideoViewer;
