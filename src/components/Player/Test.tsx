import React, { useState, useEffect, ChangeEvent, useRef, useCallback } from 'react';

declare global {
    interface Window {
        onYouTubeIframeAPIReady?: (() => void);
    }
}

declare global {
    namespace YT {
        interface OnReadyEvent extends PlayerEvent {
            target: Player;
            data: number;
        }
    }
}

const PlayerComponent: React.FC = () => {
    const playerRef = useRef<YT.Player | null>(null);
    const videoRef = useRef<HTMLIFrameElement | null>(null);

    useEffect(() => {
        const existingScript = document.getElementById('youtube-iframe-api');
        if (!existingScript) {
            const script = document.createElement('script');
            script.id = 'youtube-iframe-api';
            script.src = 'https://www.youtube.com/iframe_api?autoplay=1&enablejsapi=1&origin=http://localhost:4040';
            // script.async = true;

            script.onload = () => {
                console.log('YouTube IFrame API 스크립트가 로드되었습니다.');
                window.onYouTubeIframeAPIReady = initializePlayer;
            };
            document.body.appendChild(script);

        } else {
            console.log('YouTube IFrame API 스크립트가 이미 로드되었습니다.');
            initializePlayer();
        }

        return () => {
            const script = document.getElementById('youtube-iframe-api');
            if (script) {
                document.body.removeChild(script);
            }
            window.onYouTubeIframeAPIReady = undefined;
        };
    }, []);

    const initializePlayer = useCallback(() => {
        console.log("initializePlayer 함수가 호출되었습니다.");
        if (!videoRef.current) {
            console.log("videoRef.current가 null입니다. 요소가 마운트될 때까지 기다립니다.");
            return;
        };


        const onPlayerReady = (event: YT.PlayerEvent) => {
            console.log("플레이어가 준비되었습니다.");
            playerRef.current = event.target;
        };

        playerRef.current = new YT.Player(videoRef.current, {
            events: {
                'onReady': onPlayerReady
            }
        });
    }, [videoRef]);

    useEffect(() => {
        const initializePlayerIfMounted = () => {
            if (videoRef.current) {
                initializePlayer();
            } else {
                console.log("요소가 마운트되지 않았습니다. 기다립니다...");
                videoRef.current = document.getElementById('test') as HTMLIFrameElement;
            }
        };
        initializePlayerIfMounted();
    }, [videoRef.current, initializePlayer]);

    useEffect(() => {
        const initializeYouTubePlayer = () => {
            initializePlayer();
        };

        if (!window.onYouTubeIframeAPIReady) {
            window.onYouTubeIframeAPIReady = initializeYouTubePlayer;
        } else {
            initializeYouTubePlayer();
        }

        return () => {
            window.onYouTubeIframeAPIReady = undefined;
        };
    }, []);

    return (
        <iframe id="test" width="560" height="315" src="https://www.youtube.com/embed/dj0R7etzXiw?autoplay=1&amp;enablejsapi=0&amp;origin=http%3A%2F%2Flocalhost%3A3000"></iframe>
    );
};

export default PlayerComponent;