import { getBoardRequest } from 'apis';
import { ResponseDto } from 'apis/response';
import { GetBoardResponseDto } from 'apis/response/board';
import { MAIN_PATH } from 'constant';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate, useParams } from 'react-router-dom';
import { useLoginUserStore } from 'stores';
import useBoardStore from 'stores/board.store';
import './style.css';
import { convertUrlsToFile } from 'utils';

export default function Write() {

  const titleRef = useRef<HTMLTextAreaElement | null>(null);
  const contentRef = useRef<HTMLTextAreaElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoUrlInputRef = useRef<HTMLInputElement | null>(null);

  const {itemNumber} = useParams();
  const {title, setTitle} = useBoardStore();
  const {content, setContent} = useBoardStore();
  const {videoUrl, setVideoUrl} = useBoardStore();
  const {boardImageFileList, setBoardImageFileList} = useBoardStore();
  const {loginUser} = useLoginUserStore();

  const [showMore, setShowMore] = useState<boolean>(false);
  const [cookies, setCookies] = useCookies();
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const navigator = useNavigate();

  const toggleUrlBox = () => {
    setShowMore((prevShowMore) => !prevShowMore);
  };

  const getBoardResponse = (responseBody: GetBoardResponseDto | ResponseDto | null) => {
    if(!responseBody) return;
    const {code} = responseBody;
    if(code === 'NB') alert('존재하지 않습니다/');
    if(code === 'DBE') alert('데이터베이스 오류입니다.');
    if(code === 'SU'){
      navigator(MAIN_PATH());
      return;
    }

    const {title, content, boardImageList, writerId} = responseBody as GetBoardResponseDto;
    setTitle(title);
    setContent(content);
    setImageUrls(boardImageList);
    convertUrlsToFile(boardImageList).then(boardImageFileList => setBoardImageFileList(boardImageFileList));

    if(!loginUser || loginUser.userId !== writerId) {
      navigator(MAIN_PATH());
      return;
    }
  }

  const onTitleChangeHandler = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const {value} = event.target;
    setTitle(value);

    if(!titleRef.current) return;
    titleRef.current.style.height = 'auto';
    titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
  };

  const onContentChangeHandler = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const {value} = event.target;
    setContent(value);

    if(!contentRef.current) return;
    contentRef.current.style.height = 'auto';
    contentRef.current.style.height = `${contentRef.current.scrollHeight}px`;
  };

  const onImageChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    if(!event.target.files || !event.target.files.length) return;
    const file = event.target.files[0];

    const imageUrl = URL.createObjectURL(file);
    const newImageUrls = imageUrls.map(item => item);
    newImageUrls.push(imageUrl);
    setImageUrls(newImageUrls);

    const newBoardImageFileList = boardImageFileList.map(item => item);
    newBoardImageFileList.push(file);
    setBoardImageFileList(newBoardImageFileList);

    if(!imageInputRef.current) return;
    imageInputRef.current.value='';
  }

  const onImageUploadButtonClickHandler = () => {
    if(!imageInputRef.current) return;
    imageInputRef.current.click();
  }

  const onImageCloseButtonClickHandler = (deleteindex: number) => {
    if(!imageInputRef.current) return;
    imageInputRef.current.value="";
    
    const newImageUrls = imageUrls.filter((url, index) => index !== deleteindex);
    setImageUrls(newImageUrls);

    const newBoardImageFileList = boardImageFileList.filter((file, index) => index !== deleteindex);
    setBoardImageFileList(newBoardImageFileList);
  }

  const extractYouTubeVideoId = (url: string) => {
    const youtubeUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(youtubeUrlPattern);
    return match ? match[4] : null;
  };

  const isValidYouTubeUrl = (url: string) => {
    return extractYouTubeVideoId(url) !== null;
  };

  const onVideoUrlChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setVideoUrl(value);

    if(!videoUrlInputRef.current) return;
    videoUrlInputRef.current.style.height = 'auto';
    videoUrlInputRef.current.style.height = `${videoUrlInputRef.current.scrollHeight}px`;
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      toggleUrlBox();
    }
  };

  useEffect(() => {
    const accessToken = cookies.accessToken;
    if(!accessToken){
      navigator(MAIN_PATH());
      return;
    }
    if(!itemNumber) return;
    getBoardRequest(itemNumber).then(getBoardResponse);
  }, [itemNumber]);

  return (
    <div id='board-write-wrapper'>
      <div className='board-write-container'>
        <div className='board-write-box'>
          <div className='board-write-title-box'>
            <textarea ref={titleRef} className='board-write-title-textarea' rows={1} placeholder='제목을 작성해주세요.' value={title} onChange={onTitleChangeHandler}/>
          </div>
          <div className='divider'></div>
          <div className='board-write-content-box'>
            <textarea ref={contentRef} className='board-write-content-textarea' placeholder='내용을 작성해주세요.' value={content} onChange={onContentChangeHandler}/>
            <div className='board-write-icon-box'>
              <div className='icon-button' onClick={onImageUploadButtonClickHandler}>
                <div className='icon image-box-light-icon'></div>
              </div>
              <input ref={imageInputRef} type='file' accept='image/*' style={{display: 'none'}} onChange={onImageChangeHandler}/>
              <div className='icon-button' onClick={toggleUrlBox}>
                <div className='icon image-box-light-icon'></div>
              </div>
              {showMore &&
              <input ref={videoUrlInputRef} type='text' className='url-input' placeholder='URL을 입력하세요.' value={videoUrl} onChange={onVideoUrlChangeHandler} onKeyPress={handleKeyPress}/>
               }
            </div>              
          </div>
          <div className='board-write-images-box'>
            {imageUrls.map((imageUrl, index) =>
            <div className='board-write-image-box' key={index}>
              <img className='board-write-image' src={imageUrl}/>
              <div className='icon-button image-close' onClick={() => onImageCloseButtonClickHandler(index)}>
                <div className='icon close-icon'></div>
              </div>
            </div>
            )}
          </div>
            {isValidYouTubeUrl(videoUrl) && (
              <div className='board-write-youtube-preview'>
                <iframe width="560" height="315" src={`https://www.youtube.com/embed/${extractYouTubeVideoId(videoUrl)}`} frameBorder="0" allowFullScreen></iframe>
              </div>
            )}
          </div>
        </div>
      </div>
  )
}
