import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import axios from 'axios';
// import { getMusicRequest, postMusicRequest } from 'apis';
import './style.css';

// Video 및 PlayerProps 인터페이스 정의

const Player: React.FC = () => {
    const videoRef = useRef<HTMLIFrameElement | null>(null);
    const playerRef = useRef<YT.Player | null>(null);

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const existingScript = document.getElementById('youtube-iframe-api');
        if (!existingScript) {
            const script = document.createElement('script');
            script.id = 'youtube-iframe-api';
            script.src = 'https://www.youtube.com/iframe_api?autoplay=1&enablejsapi=1&origin=http://localhost:4040';
            script.async = true;
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
            console.log("sdfsdfsdf");
            const script = document.getElementById('youtube-iframe-api');
            if (script) {
                document.body.removeChild(script);
            }
            window.onYouTubeIframeAPIReady = undefined;
        };
    }, []);

    const initializePlayer = () => {
        console.log("initializePlayer 함수가 호출되었습니다.");
        if (!videoRef.current) {
            console.log("videoRef.current가 null입니다. 요소가 마운트될 때까지 기다립니다.");
            return;
        };
        const onPlayerReady = (event: YT.PlayerEvent) => {
            console.log("플레이어가 준비되었습니다.");
            playerRef.current = event.target;
        };
        const onPlayerStateChange = (event: YT.OnStateChangeEvent) => {
            const playerState = event.data;
            console.log("플레이어 상태가 변경되었습니다:", playerState);

        };
        const onPlayerError = (event: YT.OnErrorEvent) => {
            console.error("플레이어에서 오류가 발생했습니다:", event);
        };
        playerRef.current = new YT.Player(videoRef.current, {
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange,
                'onError': onPlayerError
            }
        });
    };
    return (
        <div className="player-wrapper">
            <div className="player-container">
                <div className="player-container">
                    <div className="video-info">
                        <iframe
                            id="test"
                            width="560"
                            height="315"
                            src="https://www.youtube.com/embed/dj0R7etzXiw?autoplay=1&amp;enablejsapi=0&amp;origin=http%3A%2F%2Flocalhost%3A3000">
                        </iframe>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Player;
