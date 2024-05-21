import { deleteMusicRequest, getMusicRequest, postMusicRequest } from 'apis';
import axios from 'axios';
import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import './style.css';
import { PostMusicRequestDto } from 'apis/request/music';

interface Video {
    id: string;
    title: string;
    channelTitle: string;
    videoUrl: string;
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

const ASDF: React.FC<PlayerProps> = ({ }) => {

    const ApiKey = 'AIzaSyBRCweLseGcLizadDsECnpLhBRA2cG8PaM';
    const videoRef = useRef<HTMLIFrameElement | null>(null);
    const playerRef = useRef<YT.Player | null>(null);
    const socketRef = useRef<WebSocket | null>(null);

    const [urls, setUrls] = useState('');
    const [randomEnabled, setRandomEnabled] = useState(false);
    const [isRepeatEnabled, setIsRepeatEnabled] = useState(false);
    const isRepeatEnabledRef = useRef(isRepeatEnabled);
    const [muted, setMuted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [inputVisible, setInputVisible] = useState(false);
    const [listVisible, setListVisible] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [volume, setVolume] = useState(100);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [videoUrl, setVideoUrl] = useState('');
    const [playlist, setPlaylist] = useState<Video[]>([]);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [containerPosition, setContainerPosition] = useState({ x: 0, y: 0 });
    const [mousedownX, setMousedownX] = useState(0);
    const [mousedownY, setMousedownY] = useState(0);


    useEffect(() => {
        const socket = new WebSocket('ws://localhost:4040/playlistUpdate');

        socket.onopen = () => {
            console.log('웹 소켓 연결이 열렸습니다.');
            socket.send('updatePlaylist');
        };

        socket.onmessage = async (event) => {
            const url = event.data;
            const videoId = extractYouTubeVideoId(url);
            if (videoId) {
                const videoInfo = await fetchVideoInfo(videoId);
                if (videoInfo) {
                    setPlaylist(prevPlaylist => [...prevPlaylist, videoInfo]);
                }
            }
            console.log('웹 소켓 메시지를 받았습니다:', event.data);
        };

        socket.onclose = (event) => {
            console.log('웹 소켓 연결이 닫혔습니다.', event.code, event.reason);
        };

        socket.onerror = (error) => {
            console.error('웹 소켓 에러:', error);
        };

        socketRef.current = socket;

        return () => {
            socket.close();
        };
    }, []);
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
        if (!videoRef.current) {
            return;
        };
        if (playlist.length === 0 || playlist === null) {
            return;
        }
        const onPlayerReady = (event: YT.PlayerEvent) => {
            console.log("플레이어가 준비되었습니다.");
            playerRef.current = event.target;
        };
        const onPlayerStateChange = (event: YT.OnStateChangeEvent) => {
            const playerState = event.data;
            switch (playerState) {
                case YT.PlayerState.PLAYING:
                    console.log("플레이어 상태: PLAYING");
                    setIsPlaying(true);
                    updateCurrentTime();
                    break;
                case YT.PlayerState.ENDED:
                    console.log("플레이어 상태: ENDED");
                    if (isRepeatEnabledRef.current) {
                        setCurrentTime(0);
                        playerRef.current?.seekTo(0, true);
                        playerRef.current?.playVideo();
                    } else {
                        const currentVideoId = playerRef.current?.getVideoUrl().split('v=')[1];
                        const currentIndex = playlist.findIndex(video => video.id === currentVideoId);
                        if (currentIndex !== -1) {
                            setCurrentVideoIndex(currentIndex);
                            setTimeout(() => playNext(playlist, currentIndex), 0);
                        } else {
                            console.error("현재 재생 중인 비디오를 찾을 수 없습니다.");
                        }
                    }
                    break;
                case YT.PlayerState.PAUSED:
                    console.log("플레이어 상태: PAUSED");
                    setIsPlaying(false);
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

        if (!playerRef.current) {
            const player = new YT.Player(videoRef.current, {
                height: '100',
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
            playerRef.current = player;
        }
    }, [videoRef, playlist]);
    // 비디오 변경 핸들러
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
            } return;
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
    useEffect(() => {
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
            const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${ApiKey}`);
            const videoInfo = response.data.items[0];

            if (videoInfo && videoInfo.contentDetails && videoInfo.contentDetails.duration) {
                const { snippet, contentDetails } = videoInfo;
                const durationInSeconds = parseDuration(contentDetails.duration);
                setDuration(durationInSeconds);

                return {
                    id: videoId,
                    title: snippet.title,
                    channelTitle: snippet.channelTitle,
                    videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
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
    const playNext = useCallback(async (newPlayList: Video[], currentIndex?: number) => {
        let nextIndex: number;
        if (randomEnabled) {
            nextIndex = Math.floor(Math.random() * newPlayList.length);
        } else {
            nextIndex = (typeof currentIndex !== 'undefined' ? currentIndex + 1 : currentVideoIndex + 1) % playlist.length;
        }
        const nextVideo = newPlayList[nextIndex];
        const videoId = nextVideo.id;
        try {
            const videoInfo = await fetchVideoInfo(videoId);

            if (videoInfo && videoRef.current && playerRef.current) {
                setCurrentVideoIndex(nextIndex);
                setDuration(videoInfo.duration);
                setCurrentTime(0);
                setIsPlaying(true);
                playerRef.current.loadVideoById(videoId);
            } else {
                console.error('Player is not initialized or loadVideoById function is not available.');
            }
        } catch (error) {
            console.error('Error fetching next video info:', error);
        }
    }, [currentVideoIndex, playlist, randomEnabled]);
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
    // 10초 전으로 이동
    const seekForward = () => {
        if (!playerRef.current) return;
        const currentTime = playerRef.current.getCurrentTime();
        playerRef.current.seekTo(currentTime + 10, true);
    };
    // 10초 후로 이동
    const seekBackward = () => {
        if (!playerRef.current) return;
        const currentTime = playerRef.current.getCurrentTime();
        playerRef.current.seekTo(currentTime - 10, true);
    };
    // 반복 재생 토글
    const toggleRepeat = () => {
        setIsRepeatEnabled(prevState => {
            const newState = !prevState;
            isRepeatEnabledRef.current = newState; // useRef 값을 업데이트
            console.log(`반복 재생 상태가 변경되었습니다: ${newState}`);
            return newState;
        });
        console.log('반복 재생 상태가 변경되었습니다:', !isRepeatEnabled);
    }
    // 볼륨 변경 핸들러
    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseInt(e.target.value, 10);
        setVolume(newVolume);
        if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
            playerRef.current.setVolume(newVolume);
        }
    };
    // 음소거 토글
    const toggleMute = () => {
        if (playerRef.current && typeof playerRef.current.isMuted === 'function') {
            if (playerRef.current.isMuted()) {
                playerRef.current.unMute();
                setMuted(false);
            } else {
                playerRef.current.mute();
                setMuted(true);
            }
        }
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
    // 키 다운 핸들러
    const handleKeyDown = (event: { key: string; }) => {
        if (event.key === 'Enter') {
            const urls = videoUrl.split(',').map(url => url.trim());
            handleBatchMusicUpload(urls);
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
    // 비디오 URL 변경 핸들러
    const handleVideoUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
        setVideoUrl(event.target.value);
    };
    // 업로드 토글
    const uploadToggleInputVisible = () => {
        setInputVisible(!inputVisible);
    };
    // 리스트 토글
    const listToggleInputVisible = () => {
        setListVisible(!listVisible);
    };
    // Video 제목 클릭 핸들러
    const handleVideoTitleClick = (index: number) => {
        setCurrentVideoIndex(index);
        setIsPlaying(true);
        fetchVideoInfo(playlist[index].id)
            .then(videoInfo => {
                if (videoInfo) {
                    setDuration(videoInfo.duration);
                    setCurrentTime(0);
                }
            })
            .catch(error => {
                console.error('Error fetching video info:', error);
            });
    };
    // 노래 삭제 핸들러
    const handleDelete = async (index: number) => {
        try {
            const videoUrl = playlist[index].videoUrl;
            const videoId = extractYouTubeVideoId(videoUrl);
            if (!videoId) return;
            const deleteResult = await deleteMusicRequest(videoId);
            if (deleteResult) {
                alert('음악 삭제 성공');
                const newPlaylist = [...playlist];
                newPlaylist.splice(index, 1);
                
                console.log('newPlaylist:', newPlaylist);
                setPlaylist(newPlaylist);
                if (isPlaying && currentVideoIndex === index) {
                    playerRef.current?.stopVideo();
                    setIsPlaying(false);
                    setTimeout(() => {
                        playNext(newPlaylist, currentVideoIndex - 1);
                    }, 0);
                }
            } else {
                console.error('음악 삭제 요청 실패');
            }
        } catch (error) {
            console.error('음악 삭제 요청 실패:', error);
        }
    };
    // 랜덤 재생 토글
    const toggleRandom = () => {
        setRandomEnabled(prevState => !prevState);
    };
    // 음악 일괄 업로드
    const handleBatchMusicUpload = async (urls: string[]) => {
        try {
            const videoIds = urls.map(url => extractYouTubeVideoId(url)).filter(Boolean) as string[];

            const requests = videoIds.map(async (videoId) => {
                const requestBody: PostMusicRequestDto = { videoUrl: videoId };
                await postMusicRequest(requestBody);
            });

            await Promise.all(requests);

            if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                socketRef.current.send('updatePlaylist');
            }

            setVideoUrl('');
            alert('음악 업로드 성공');
        } catch (error) {
            console.error('음악 업로드 실패:', error);
        }
    };
    // 업로드 버튼 클릭 핸들러
    const handleUploadButtonClick = () => {
        const urls = [videoUrl];
        handleBatchMusicUpload(urls);
    };



    return (
        <div className='player'>
            <div className="player-wrapper" style={{ top: containerPosition.y + 'px', left: containerPosition.x + 'px' }}>
                <div className="handle"
                    style={{
                        transform: 'translateX(-50%)',
                        cursor: 'grab',
                        backgroundColor: 'transparent',
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp} />
                <div className="player-container">
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
                                <div className='info-title'>{playlist[currentVideoIndex].title}</div>
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
                        <div className='icon-button' onClick={seekBackward}>
                            <div className='icon backward-icon'></div>
                        </div>
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
                        <div className='icon-button' onClick={() => playNext(playlist, currentVideoIndex)}>
                            <div className='icon next-icon'></div>
                        </div>
                        <div className='icon-button' onClick={seekForward}>
                            <div className='icon forward-icon'></div>
                        </div>
                    </div>
                    <div className="volume-control">
                        <div className='icon-button' onClick={toggleMute}>
                            {muted ? (
                                <div className='icon mute-icon'></div>
                            ) : (
                                <div className='icon unmute-icon'></div>
                            )}
                        </div>
                        <input
                            type="range"
                            className="volume-slider"
                            value={volume}
                            min={0}
                            max={100}
                            onChange={handleVolumeChange} />
                        <div className="icon-button" onClick={toggleRandom}>
                            {randomEnabled ? (
                                <div className="icon random-on-icon"></div>
                            ) : (
                                <div className="icon random-off-icon"></div>
                            )}
                        </div>
                        <div className="icon-button" onClick={toggleRepeat}>
                            {isRepeatEnabled ? (
                                <div className="icon repeat-on-icon"></div>
                            ) : (
                                <div className="icon repeat-off-icon"></div>
                            )}
                        </div>
                    </div>
                    <div className='list-button-container'>
                        <div className='icon-button' onClick={listToggleInputVisible}>
                            <div className='icon list-icon'></div>
                        </div>
                    </div>
                    <div className='upload-button-container'>
                        <div className='icon-button' onClick={uploadToggleInputVisible}>
                            <div className='icon upload-icon'></div>
                        </div>
                    </div>
                </div>
                <div className="url-input-container">
                    <div className="upload-box-container">
                        <div style={{ position: 'absolute', bottom: '0', left: '0' }}>
                            {inputVisible && (
                                <div>
                                    <input
                                        type="text"
                                        value={videoUrl}
                                        onChange={handleVideoUrlChange}
                                        onKeyDown={handleKeyDown}
                                        placeholder="URL 전체 입력" />
                                    <div className="upload-button" onClick={handleUploadButtonClick}></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className='video-title-list' style={{ display: listVisible ? 'block' : 'none' }}>
                    <ul>
                        {playlist.map((video, index) => (
                            <li key={index} style={{ backgroundColor: index === currentVideoIndex ? '#CCCCCC' : 'transparent' }}>
                                {/* <div className="divider">{"\|"}</div> */}
                                <div className='delete-button-container'>
                                    <div className='icon-buttons' onClick={() => handleDelete(index)}>
                                        <div className='icon delete-icon'></div>
                                    </div>
                                </div>
                                <span onClick={() => handleVideoTitleClick(index)}>{video.title}</span>
                            </li>
                        ))}
                    </ul>
                </div>
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
export default ASDF;