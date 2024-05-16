import { getMusicRequest } from 'apis';
import axios from 'axios';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import './style.css';

interface Video {
    id: string;
    title: string;
    channelTitle: string;
    duration: number;
    contentDetails: any;
}

const Player: React.FC = () => {
    const videoRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<YT.Player | null>(null);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [playlist, setPlaylist] = useState<Video[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [dragging, setDragging] = useState(false);

    // 음악 데이터 가져오기
    useEffect(() => {
        fetchMusicData().then(videos => setPlaylist(videos));
    }, []);
    // 플레이어 초기화
    const initializePlayer = useCallback(() => {
        console.log("initializePlayer 함수가 호출되었습니다.");
        if (!videoRef.current) {
            console.log("videoRef.current가 null입니다. 요소가 마운트될 때까지 기다립니다.");
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
                    setCurrentTime(0);
                    break;
                case YT.PlayerState.PLAYING:
                    console.log("플레이어 상태: PLAYING");
                    setIsPlaying(true);
                    setInterval(() => {
                        if (playerRef.current) {
                            setCurrentTime(playerRef.current.getCurrentTime());
                        }
                    }, 1000);
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
                case 100:
                    console.error("영상이 삭제되었거나 비공개로 설정되었습니다.");
                    break;
                case 101:
                case 150:
                    console.error("영상이 소유자의 요청에 의해 다른 웹사이트에서 재생할 수 없습니다.");
                    break;
                default:
                    console.error("알 수 없는 오류가 발생했습니다.");
                    break;
            }
            event.target.stopVideo();
        };

        playerRef.current = new YT.Player(videoRef.current, {
            height: '390',
            width: '640',
            videoId: 'eP-y5aHlqYo', // YouTube 동영상 ID를 여기에 넣습니다.
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange,
                'onError': onPlayerError
            },
            playerVars: {
                autoplay: 0, // 자동 재생 활성화
                controls: 1, // 플레이어 컨트롤 표시     // 음소거 상태로 시작
            }
        });
    }, [videoRef]);
    // currentTime 업데이트
    useEffect(() => {
        let updateInterval: NodeJS.Timeout;

        if (!isLoading && isPlaying) {
            updateInterval = setInterval(() => {
                setCurrentTime((prevTime) => prevTime + 1);
            }, 1000);
        }

        return () => clearInterval(updateInterval);
    }, [isLoading, isPlaying]);
    // API 스크립트 로드
    useEffect(() => {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        if (firstScriptTag?.parentNode) {
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        window.onYouTubeIframeAPIReady = initializePlayer;

        return () => {
            if (playerRef.current) {
                playerRef.current.destroy();
            }
        };
    }, [initializePlayer]);
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
    // YouTube 동영상 ID 추출
    const extractYouTubeVideoId = (url: string): string | null => {
        const youtubeUrlPattern =
            /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(youtubeUrlPattern);
        return match ? match[4] : null;
    };
    // 동영상 정보 가져오기
    const fetchVideoInfo = async (videoId: string | null): Promise<Video | null> => {
        if (!videoId) return null;
        try {
            const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=AIzaSyBRCweLseGcLizadDsECnpLhBRA2cG8PaM`);
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
    // 이전 곡 재생
    const playPrevious = () => {
        const previousIndex = currentVideoIndex === 0 ? playlist.length - 1 : currentVideoIndex - 1;
        const previousVideo = playlist[previousIndex];
        const videoId = previousVideo.id;
        fetchVideoInfo(videoId).then(videoInfo => {
            if (videoInfo) {
                setCurrentVideoIndex(previousIndex);
                setDuration(videoInfo.duration);
                setCurrentTime(0);
                setIsPlaying(true);
            }
        });
    };
    // 다음 곡 재생
    const playNext = async () => {
        const nextIndex = (currentVideoIndex + 1) % playlist.length;
        const nextVideo = playlist[nextIndex];
        const videoId = nextVideo.id;
        fetchVideoInfo(videoId).then(videoInfo => {
            if (videoInfo) {
                setCurrentVideoIndex(nextIndex);
                setDuration(videoInfo.duration);
                setCurrentTime(0);
                setIsPlaying(true);
            }
        });
    };
    // 재생/일시정지 토글
    const togglePlay = () => {
        console.log("playerRef.current:", playerRef.current);
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
                }
            } else {
                console.log('플레이어가 초기화되지 않았습니다.');
            }
        } else {
            console.log('videoRef.current가 null입니다. 요소가 마운트될 때까지 기다립니다.');
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

    return (
        <div className="player-wrapper">


            <div className="player-containe">
                <div ref={videoRef}></div>
                <div>
                {/* {duration > 0 && ( */}
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
                    {/* )} */}
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
                    {/* <button onClick={() => {
                        if (playerRef.current) {
                            playerRef.current.playVideo();
                        }
                    }}>Play</button>
                    <button onClick={() => {
                        if (playerRef.current) {
                            playerRef.current.pauseVideo();
                        }
                    }}>Pause</button> */}
                </div>
            </div>
        </div>
    );
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

// 시간 포맷팅
const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};



export default Player;
