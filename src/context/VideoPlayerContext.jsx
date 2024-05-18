import React, { createContext, useState } from 'react';

const VideoPlayerContext = createContext();

const VideoPlayerProvider = ({ children }) => {
    const [videoUrl, setVideoUrl] = useState('');

    const playVideo = (url) => {
        setVideoUrl(url);
    };

    return (
        <VideoPlayerContext.Provider value={{ videoUrl, playVideo }}>
            {children}
        </VideoPlayerContext.Provider>
    );
};

export { VideoPlayerProvider, VideoPlayerContext };
