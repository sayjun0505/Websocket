import { Modal } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import clsx from 'clsx';
import { useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import Duration from './videoDuration';

const VideoModal = (props) => {
  const { open, onClose, src } = props;

  // video play
  const ref = useRef();
  const [playing, setPlaying] = useState();
  const [duration, setDuration] = useState();
  const [played, setPlayed] = useState(0);
  const [seeking, setSeeking] = useState();
  const [seekTo, setSeekTo] = useState();
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState();

  const handlePlay = () => {
    setPlaying(true);
  };
  const handlePause = () => {
    setPlaying(false);
  };
  const handlePlayPause = () => {
    setPlaying(!playing);
  };
  const handleDuration = (ev) => {
    setDuration(ev);
  };
  const handleSeekChange = (e) => {
    setPlayed(parseFloat(e.target.value));
  };
  const handleSeekMouseDown = (e) => {
    setSeeking(true);
  };
  const handleSeekMouseUp = (e) => {
    setSeeking(false);
    setSeekTo(parseFloat(e.target.value));
  };
  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
  };
  const handleToggleMuted = () => {
    setMuted(!muted);
  };
  const handleProgress = (ep) => {
    // console.log('onProgress', ep);
    if (!seeking) {
      setPlayed(ep.played);
    }
  };
  if (!src) return null;
  return (
    <Modal open={open} onClose={onClose} className="flex w-screen h-screen">
      <div className="w-full h-[calc(100vh-64px)] relative  modal-position">
        <FuseSvgIcon
          className="z-20 absolute right-20 bg-grey-800 hover:bg-black rounded-full cursor-pointer text-white"
          size={40}
          color="inherit"
          onClick={onClose}
        >
          heroicons-outline:x
        </FuseSvgIcon>
        <ReactPlayer
          ref={ref}
          url={src}
          muted={muted}
          playing={playing}
          volume={volume}
          onPlay={handlePlay}
          onDuration={handleDuration}
          onSeek={(e) => console.log('onSeek', e)}
          onProgress={handleProgress}
          onPause={handlePause}
          onReady={() => console.log('onReady')}
          width="100%"
          height="100%"
          className="rounded-8"
        />
        <FuseSvgIcon
          className={clsx(
            'z-20 playIcon absolute  hover:bg-black rounded-full cursor-pointer text-white',
            playing ? 'invisible' : 'visible'
          )}
          size={40}
          color="inherit"
          onClick={handlePlay}
        >
          heroicons-outline:play
        </FuseSvgIcon>

        <div className="absolute flex flex-col w-3/5 h-48 max-h-60 bottom-10 items-center left-1/2 -translate-x-1/2">
          <div className="flex w-full">
            <input
              type="range"
              min={0}
              max={1}
              step="any"
              value={played}
              onMouseDown={handleSeekMouseDown}
              onChange={handleSeekChange}
              onMouseUp={handleSeekMouseUp}
              className="flex w-full"
            />
          </div>
          <div className="flex flex-1 w-full justify-between items-center pb-5">
            <div className="flex items-center gap-20">
              <FuseSvgIcon
                size={30}
                color="inherit"
                onClick={handlePlayPause}
                className=" hover:bg-black rounded-full cursor-pointer text-white"
              >
                {playing ? 'material-twotone:pause' : 'material-twotone:play_arrow'}
              </FuseSvgIcon>
              <Duration seconds={duration * played} className="gap-20 text-white" />
              <Duration seconds={duration} className="gap-20 text-white" />
            </div>
            <div className="flex items-center justify-center gap-20">
              <input
                type="range"
                min={0}
                max={1}
                step="any"
                value={volume}
                onChange={handleVolumeChange}
              />
              <FuseSvgIcon
                size={30}
                color="inherit"
                onClick={handleToggleMuted}
                className=" hover:bg-black rounded-full cursor-pointer text-white"
              >
                {muted ? 'heroicons-outline:volume-off' : 'heroicons-outline:volume-up'}
              </FuseSvgIcon>
              <FuseSvgIcon
                size={30}
                color="inherit"
                onClick={onClose}
                className="hover:bg-black rounded-full cursor-pointer text-white"
              >
                material-twotone:close_fullscreen
              </FuseSvgIcon>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default VideoModal;
