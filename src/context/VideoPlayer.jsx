import React, { useContext, useEffect } from 'react';
import VideoPlayerContext from './VideoPlayerContext';

const VideoPlayer = () => {
    const { videoSrc, videoRef } = useContext(VideoPlayerContext);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.src = videoSrc;
        }
    }, [videoSrc, videoRef]);

    return (
        <div className="video-player">
            <video controls ref={videoRef}>
                <source src={videoSrc} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </div>
    );
};

export default VideoPlayer;
