import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import clsx from 'clsx';
import { useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import Duration from './videoDuration';
import VideoModal from './videoModal';

const VideoPlayer = (props) => {
  const { item } = props;
  const messageObj = JSON.parse(item.data);
  const [videoModalOpen, setVideoModalOpen] = useState(false);

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

  if (!item) return null;
  return (
    <div className="w-full relative">
      <ReactPlayer
        ref={ref}
        url={messageObj.url}
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
      />
      <FuseSvgIcon
        className={clsx(
          'absolute z-100 playIcon cursor-pointer hover:bg-black rounded-xl',
          playing ? 'invisible' : 'visible'
        )}
        size={30}
        color="inherit"
        onClick={handlePlay}
      >
        heroicons-outline:play
      </FuseSvgIcon>
      {/*  */}
      <div className="absolute flex flex-col w-full h-48 max-h-60 px-20 bottom-0 items-center">
        <div className="flex w-full justify-center">
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
          <div className="flex items-center justify-center gap-10">
            <FuseSvgIcon size={20} color="inherit" onClick={handlePlayPause}>
              {playing ? 'material-twotone:pause' : 'material-twotone:play_arrow'}
            </FuseSvgIcon>
            <Duration seconds={duration * played} />
            <Duration seconds={duration} />
          </div>
          <div className="flex items-center justify-center gap-10">
            <input
              type="range"
              min={0}
              max={1}
              step="any"
              value={volume}
              onChange={handleVolumeChange}
            />
            <FuseSvgIcon size={20} color="inherit" onClick={handleToggleMuted}>
              {muted ? 'heroicons-outline:volume-off' : 'heroicons-outline:volume-up'}
            </FuseSvgIcon>
            <FuseSvgIcon size={20} color="inherit" onClick={() => setVideoModalOpen(true)}>
              material-twotone:open_in_full
            </FuseSvgIcon>
          </div>
        </div>
      </div>
      <VideoModal open={videoModalOpen} onClose={() => setVideoModalOpen(false)} item={item} />
    </div>
  );
};

export default VideoPlayer;
