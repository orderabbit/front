import React, { useState, useEffect, ChangeEvent, useRef, useCallback } from 'react';
import axios from 'axios';
import { getMusicRequest, postMusicRequest } from 'apis';
import './style.css';

interface Video {
    id: string;
    title: string;
    channelTitle: string;
    duration: number;
    contentDetails: any;
}

interface PlayerProps {
    playlist: Video[];
}



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

const Test: React.FC<PlayerProps> = ({ }) => {

    const videoRef = useRef<HTMLIFrameElement | null>(null);
    const playerRef = useRef<YT.Player | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [inputVisible, setInputVisible] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [volume, setVolume] = useState(50);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [videoUrl, setVideoUrl] = useState('');
    const [playlist, setPlaylist] = useState<Video[]>([]);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [containerPosition, setContainerPosition] = useState({ x: 0, y: 0 });
    const [mousedownX, setMousedownX] = useState(0);
    const [mousedownY, setMousedownY] = useState(0);

    // 비디오 로드 이벤트
    useEffect(() => {
        const handleIframeLoad = () => {
            console.log('iframe이 로드되었습니다.');
            initializePlayer();
        };

        if (videoRef.current) {
            videoRef.current.onload = handleIframeLoad;
        }

        return () => {
            if (videoRef.current) {
                videoRef.current.onload = null;
            }
        };
    }, [videoRef.current]);
    // 영상 로딩 핸들러
    useEffect(() => {
        setIsLoading(true);
        return () => {
            setIsLoading(false);
        };
    }, []);
    // 영상 로드 핸들러
    useEffect(() => {
        if (!isLoading && isPlaying) {
            playerRef.current?.playVideo();
        }
    }, [isLoading, isPlaying]);
    // currentTime 업데이트
    useEffect(() => {
        if (currentTime >= duration) {
            setCurrentTime(0);
        }
        let updateInterval: NodeJS.Timeout;
        if (!isLoading && isPlaying) {
            updateInterval = setInterval(() => {
                setCurrentTime((prevTime) => prevTime + 1);
            }, 1000);
        }
        return () => clearInterval(updateInterval);
    }, [isLoading, isPlaying]);
    // 플레이어 초기화
    const initializePlayer = useCallback(() => {
        console.log("initializePlayer 함수가 호출되었습니다.");
        if (!videoRef.current) {
            console.log("videoRef.current가 null입니다. 요소가 마운트될 때까지 기다립니다.");
            return;
        };
        if (playlist.length === 0 || playlist === null) {
            console.log("playlist가 null입니다. 데이터를 가져올 때까지 기다립니다.");
            return;
        }
        const onPlayerReady = (event: YT.PlayerEvent) => {
            console.log("플레이어가 준비되었습니다.");
            playerRef.current = event.target;
        };
        const onPlayerStateChange = (event: YT.OnStateChangeEvent) => {
            const playerState = event.data;
            console.log("플레이어 상태가 변경되었습니다:", playerState);
            switch (playerState) {
                case YT.PlayerState.UNSTARTED:
                    console.log("플레이어 상태: UNSTARTED");
                    break;
                case YT.PlayerState.ENDED:
                    console.log("플레이어 상태: ENDED");
                    playNext();
                    setCurrentTime(0);
                    break;
                case YT.PlayerState.PLAYING:
                    console.log("플레이어 상태: PLAYING");
                    setIsPlaying(true);
                    updateCurrentTime();
                    break;
                case YT.PlayerState.PAUSED:
                    console.log("플레이어 상태: PAUSED");
                    setIsPlaying(false);
                    break;
                case YT.PlayerState.BUFFERING:
                    console.log("플레이어 상태: BUFFERING");
                    break;
                case YT.PlayerState.CUED:
                    console.log("플레이어 상태: CUED");
                    setIsPlaying(false);
                    break;
                default:
                    console.log("플레이어 상태: UNKNOWN");
                    break;
            }
        };
        const onPlayerError = (event: YT.OnErrorEvent) => {
            console.error("플레이어에서 오류가 발생했습니다:", event);
            const errorCode = event.data;
            switch (errorCode) {
                case 2:
                    console.error("영상 ID가 잘못되었습니다.");
                    break;
                case 5:
                    console.error("HTML5 플레이어에서 영상 관련 문제가 발생했습니다.");
                    break;
                default:
                    console.error("알 수 없는 오류가 발생했습니다.");
                    break;
            }
            event.target.stopVideo();
        };
        playerRef.current = new YT.Player(videoRef.current, {
            height: '222',
            width: '222',
            videoId: playlist[currentVideoIndex].id,
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange,
                'onError': onPlayerError
            },
            playerVars: {
                autoplay: 0,
                controls: 0,
            }
        });
        console.log('currentVideoIndex:', playlist[currentVideoIndex].id);
        console.log("플레이어가 초기화되었습니다.");
    }, [videoRef, playlist]);

    useEffect(() => {
        if (playerRef.current && playerRef.current.loadVideoById) {
            playerRef.current.loadVideoById(playlist[currentVideoIndex].id);
        }
    }, [currentVideoIndex]);

    // API 스크립트 로드
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
            const script = document.getElementById('youtube-iframe-api');
            if (script) {
                document.body.removeChild(script);
            }
            window.onYouTubeIframeAPIReady = undefined;
        };
    }, []);

    useEffect(() => {
        const initializePlayerIfMounted = () => {
            if (videoRef.current) {
                initializePlayer();
            } else {
                console.log("요소가 마운트되지 않았습니다. 기다립니다...");
            }
        };
        initializePlayerIfMounted();
    }, [videoRef.current, initializePlayer]);
    // API 로드 후 초기화
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
    // 현재 시간 업데이트
    const updateCurrentTime = () => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
            console.log(playerRef.current.getCurrentTime());
            const currentTime = playerRef.current.getCurrentTime();
            setCurrentTime(currentTime);
        }
    };
    // 현재 시간 실시간 업데이트
    useEffect(() => {
        const intervalId = setInterval(updateCurrentTime, 1000);
        return () => clearInterval(intervalId);
    }, []);
    // 음악 데이터 가져오기
    const fetchMusicData = async () => {
        try {
            const musicData = await getMusicRequest();
            const fetchedPlaylist = musicData?.playlist || [];
            const videos: Video[] = [];
            for (const url of fetchedPlaylist) {
                const videoId = extractYouTubeVideoId(url);
                if (videoId) {
                    const videoInfo = await fetchVideoInfo(videoId);
                    if (videoInfo) {
                        videos.push(videoInfo);
                    }
                }
            }
            return videos;
        } catch (error) {
            console.error('Error fetching music data:', error);
            return [];
        }
    };
    // 비디오 정보 가져오기
    useEffect(() => {
        fetchMusicData().then(videos => setPlaylist(videos));
    }, []);
    // 유튜브 비디오 ID 추출
    const extractYouTubeVideoId = (url: string): string | null => {
        const youtubeUrlPattern =
            /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(youtubeUrlPattern);
        return match ? match[4] : null;
    };
    // 비디오 정보 가져오기
    const fetchVideoInfo = async (videoId: string | null): Promise<Video | null> => {
        if (!videoId) return null;
        try {
            const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=AIzaSyDcwcdL4YrXLMfeAiAQ5sbjuJ5HTGvrz9Y`);
            const videoInfo = response.data.items[0];

            if (videoInfo && videoInfo.contentDetails && videoInfo.contentDetails.duration) {
                const { snippet, contentDetails } = videoInfo;
                const durationInSeconds = parseDuration(contentDetails.duration);
                setDuration(durationInSeconds);

                return {
                    id: videoId,
                    title: snippet.title,
                    channelTitle: snippet.channelTitle,
                    duration: durationInSeconds,
                    contentDetails: contentDetails
                };
            } else {
                console.error('Video does not have audio stream or is not available.');
                return null;
            }
        } catch (error) {
            console.error('Error fetching video info:', error);
            return null;
        }
    };
    // 이전 비디오 재생
    const playPrevious = () => {
        const previousIndex = currentVideoIndex === 0 ? playlist.length - 1 : currentVideoIndex - 1;
        const previousVideo = playlist[previousIndex];
        const videoId = previousVideo.id;

        fetchVideoInfo(videoId).then(async videoInfo => {
            try {
                if (videoInfo && videoRef.current && playerRef.current) {
                    setCurrentVideoIndex(previousIndex);
                    setDuration(videoInfo.duration);
                    setCurrentTime(0);
                    setIsPlaying(true);
                } else {
                    console.error('Player is not initialized or loadVideoById function is not available.');
                }
            } catch (error) {
                console.error('Error fetching next video info:', error);
            }
        });
    };
    // 다음 비디오 재생
    const playNext = async () => {
        const nextIndex = (currentVideoIndex + 1) % playlist.length;
        const nextVideo = playlist[nextIndex];
        const videoId = nextVideo.id;
        console.log('다음 비디오 ID:', videoId);

        try {
            const videoInfo = await fetchVideoInfo(videoId);
            if (videoInfo && videoRef.current && playerRef.current) {
                setCurrentVideoIndex(nextIndex);
                setDuration(videoInfo.duration);
                setCurrentTime(0);
                setIsPlaying(true);
            } else {
                console.error('Player is not initialized or loadVideoById function is not available.');
            }
        } catch (error) {
            console.error('Error fetching next video info:', error);
        }
    };
    // 재생/일시정지 토글
    const togglePlay = () => {
        if (videoRef.current) {
            const player = playerRef.current;
            if (player) {
                if (isPlaying) {
                    player.pauseVideo();
                    setIsPlaying(false);
                    console.log('플레이어 상태가 변경되었습니다: 일시정지');
                } else {
                    player.playVideo();
                    setIsPlaying(true);
                    console.log('플레이어 상태가 변경되었습니다: 재생');
                    updateCurrentTime();
                }
            } else {
                console.log('플레이어가 초기화되지 않았습니다.');
            }
        } else {
            console.log('videoRef.current가 null입니다. 요소가 마운트될 때까지 기다립니다.');
        }
    };
    // 비디오 URL 변경 핸들러
    const handleVideoUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
        setVideoUrl(event.target.value);
    };
    // 음악 업로드
    const handleMusicUpload = async () => {
        try {
            const requestBody = {
                videoUrl: videoUrl
            };
            const response = await postMusicRequest(requestBody);
            setVideoUrl('');
        } catch (error) {
            console.error('음악 업로드 실패:', error);
        }
    };
    // 키 다운 핸들러
    const handleKeyDown = (event: { key: string; }) => {
        if (event.key === 'Enter') {
            handleMusicUpload();
        }
    };
    // 슬라이더 변경 핸들러
    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        setCurrentTime(time);
        if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
            playerRef.current.seekTo(time, true);
        }
    };
    // 슬라이더 마우스 업 핸들러
    const handleSliderMouseUp = () => {
        setDragging(false);
    };
    // 슬라이더 마우스 다운 핸들러
    const handleSliderMouseDown = () => {
        setDragging(true);
    };
    // 볼륨 변경 핸들러
    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const volumeLevel = parseFloat(e.target.value);
        setVolume(volumeLevel);
    };
    // 마우스 다운 핸들러
    const handleMouseDown = (event: { target?: any; clientX?: any; clientY?: any; }) => {
        if (event.target.className !== 'handle') return;
        setDragging(true);
        setMousedownX(event.clientX);
        setMousedownY(event.clientY);
    };
    // 마우스 이동 핸들러
    const handleMouseMove = (event: { clientX: any; clientY: any; }) => {
        if (dragging) {
            const deltaX = event.clientX - mousedownX;
            const deltaY = event.clientY - mousedownY;
            setContainerPosition({
                x: containerPosition.x + deltaX,
                y: containerPosition.y + deltaY
            });
            setMousedownX(event.clientX);
            setMousedownY(event.clientY);
        }
    };
    // 마우스 업 핸들러
    const handleMouseUp = () => {
        setDragging(false);
    };
    
    return (
        <div className="player-wrapper">
            <div className="player-container" style={{ top: containerPosition.y + 'px', left: containerPosition.x + 'px' }}>
                <div className="handle"
                    style={{
                        top: '0',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        cursor: 'grab',
                        backgroundColor: 'transparent',
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp} />
                {playlist[currentVideoIndex] && (
                    <div className="video-info">
                        <div ref={videoRef}>
                            <iframe
                                src={`https://www.youtube.com/embed/${playlist[currentVideoIndex].id}?enablejsapi=0&origin=${encodeURIComponent(window.location.origin)}`}
                                frameBorder="0"
                                allowFullScreen
                                style={{ display: isPlaying ? 'none' : 'none' }}
                            ></iframe>
                        </div>
                        <img className='thumbnail' src={`https://img.youtube.com/vi/${playlist[currentVideoIndex].id}/default.jpg`} alt="Video Thumbnail" />
                        <div className="info-details">
                            <h3 className='info-title'>{playlist[currentVideoIndex].title}</h3>
                            <p className='info-channelTitle'>{`artist: ${playlist[currentVideoIndex].channelTitle}`}</p>
                        </div>
                    </div>
                )}
                {duration > 0 && (
                    <div className="progress-bar">
                        <input
                            type="range"
                            className='progress-slider'
                            value={currentTime}
                            max={duration}
                            onChange={handleSliderChange}
                            onMouseDown={handleSliderMouseDown}
                            onMouseUp={handleSliderMouseUp} />
                        <div className="progress-bar-time">
                            <p className='time'>{formatTime(currentTime)}</p>
                            <p className='time'>{formatTime(duration)}</p>
                        </div>
                    </div>
                )}
                <div className="controls">
                    <div className='icon-button' onClick={playPrevious}>
                        <div className='icon pre-icon'></div>
                    </div>
                    {videoRef.current && (
                        <div className='icon-button' onClick={togglePlay}>
                            {isPlaying ? (
                                <div className='icon pause-icon'></div>
                            ) : (
                                <div className='icon play-icon'></div>
                            )}
                        </div>
                    )}
                    <div className='icon-button' onClick={playNext}>
                        <div className='icon next-icon'></div>
                    </div>
                </div>
                <div className="volume-control">
                    <input
                        type="range"
                        className="volume-slider"
                        value={volume}
                        min={0}
                        max={100}
                        onChange={handleVolumeChange} />
                </div>
                {!inputVisible && (
                    <button className="upload-button" onClick={() => setInputVisible(true)}>업로드</button>
                )}
                {inputVisible && (
                    <div>
                        <input
                            type="text"
                            value={videoUrl}
                            onChange={handleVideoUrlChange}
                            onKeyDown={handleKeyDown}
                            placeholder="URL 입력" />
                        <button className="upload-button" onClick={handleMusicUpload}>업로드</button>
                    </div>
                )}
            </div>
        </div>
    );
};
// 시간 포맷팅
const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};
// ISO 8601 포맷의 동영상 길이를 초로 변환
const parseDuration = (iso8601Duration: string): number => {
    const match = iso8601Duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return 0;
    const hours = match[1] ? parseInt(match[1].slice(0, -1)) * 3600 : 0;
    const minutes = match[2] ? parseInt(match[2].slice(0, -1)) * 60 : 0;
    const seconds = match[3] ? parseInt(match[3].slice(0, -1)) : 0;
    return hours + minutes + seconds;
};
export default Test;