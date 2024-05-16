import { useNavigate } from 'react-router-dom';
import './style.css';
import { BoardListItem } from 'types/interface';
import DefaultProfileImage from 'assets/images/default-profile-image.png'
import { BOARD_PATH, DETAIL_PATH } from 'constant';

interface Props {
    boardListItem: BoardListItem;
}

export default function BoardItem({boardListItem}: Props) {

    const {itemNumber, title, content, videoUrl, boardTitleImage } = boardListItem;
    const {favoriteCount, commentCount, viewCount} = boardListItem;
    const {writeDatetime, writerNickname, writerProfileImage} = boardListItem;

    const navigator = useNavigate();

    const onClickHandler = () => {
        navigator(BOARD_PATH() + '/' + DETAIL_PATH(itemNumber));
    };

    return (
    <div className='board-list-item' onClick={onClickHandler}>
        <div className='board-list-item-main-box'>
            <div className='board-list-item-top'>
                <div className='board-list-item-profile-box'>
                    <div className='board-list-item-profile-image' style={{backgroundImage: `url(${writerProfileImage ? writerProfileImage : DefaultProfileImage})`}}></div>
                </div>
                <div className='board-list-item-write-box'>
                    <div className='board-list-item-nickname'>{writerNickname}</div>
                    <div className='board-list-item-write-date'>{writeDatetime}</div>
                </div>
            </div>
            <div className='board-list-item-middle'>
                <div className='board-list-item-title'>{title}</div>
                <div className='board-list-item-content'>{content}</div>
            </div>
            <div className='board-list-item-bottom'>
                <div className='board-list-item-counts'>
                    {`댓글 ${commentCount} · 좋아요 ${favoriteCount} · 조회수 ${viewCount}`}
                </div>
            </div>
        </div>
        {boardTitleImage !== null && (
            <div className='board-list-item-image-box'>
            <div className='board-list-item-image' style={{backgroundImage: `url(${boardTitleImage})`}}></div>
        </div>
        )}
    </div>
    );
}

