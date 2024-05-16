import React from 'react'
import './style.css';
import defaultProfileImage from 'assets/images/default-profile-image.png';
import { BoardListItem } from 'types/interface';
import { useNavigate } from 'react-router-dom';
import { BOARD_PATH, DETAIL_PATH } from 'constant';

interface Props {
    top3ListItem: BoardListItem;
}

export default function Top3Item({ top3ListItem }: Props) {

    const { itemNumber, title, content, boardTitleImage } = top3ListItem;
    const { favoriteCount, commentCount, viewCount } = top3ListItem;
    const { writeDatetime, writerNickname, writerProfileImage } = top3ListItem;

    const navigator = useNavigate();

    const onClickHandler = () => {
        navigator(BOARD_PATH() + '/' + DETAIL_PATH(itemNumber));
    }
console.log(commentCount)
    return (
        <div className='top-3-list-item' style={{ backgroundImage: `url(${boardTitleImage})` }} onClick={onClickHandler}>
            <div className='top-3-list-item-main-box'>
                <div className='top-3-list-item-top'>
                    <div className='top-3-list-item-profile-box'>
                        <div className='top-3-list-item-profile-image' style={{ backgroundImage: `url(${writerProfileImage ? writerProfileImage : defaultProfileImage})` }}></div>
                    </div>
                    <div className='top-3-list-item-write-box'>
                        <div className='top-3-list-item-nickname'>{writerNickname}</div>
                        <div className='top-3-list-item-write-date'>{writeDatetime}</div>
                    </div>
                </div>
                <div className='top-3-list-item-middle'>
                    <div className='top-3-list-item-title'>{title}</div>
                    <div className='top-3-list-item-content'>{content}</div>
                </div>
                <div className='top-3-list-item-bottom'>
                    <div className='top-3-list-item-counts'>
                        {`댓글 ${commentCount} · 좋아요 ${favoriteCount} · 조회수 ${viewCount}`}
                    </div>
                </div>
            </div>
        </div>
    )
}
