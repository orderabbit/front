import React from 'react';
import { Outlet } from 'react-router-dom';
import VideoPlayer from './VideoPlayer';
import { VideoPlayerProvider } from './VideoPlayerContext';

const Layout = () => {
    return (
        <VideoPlayerProvider>
            <div className="layout">
                <header>
                    <h1>My Application</h1>
                </header>
                <main>
                    <Outlet />
                </main>
                <footer>
                    <VideoPlayer />
                </footer>
            </div>
        </VideoPlayerProvider>
    );
};

export default Layout;
