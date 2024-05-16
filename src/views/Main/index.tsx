import React, { useEffect, useState } from 'react'
import './style.css';
import { Board, BoardListItem } from 'types/interface';
import Top3Item from 'components/Top3Item';
import BoardItem from 'components/BoardItem';
import Pagination from 'components/Pagination';
import { useNavigate } from 'react-router-dom';
import { SEARCH_PATH } from 'constant';
import { getLatestBoardListRequest, getPopularListRequest, getTop3BoardListRequest } from 'apis';
import { GetLatestBoardListResponseDto, GetTop3BoardResponseDto } from 'apis/response/board';
import { ResponseDto } from 'apis/response';
import { usePagination } from 'hooks';
import { GetPopularListResponseDto } from 'apis/response/search';

export default function Main() {

  const navigator = useNavigate();

  const MainTop = () => {

    const [top3BoardList, setTop3BoardList] = useState<BoardListItem[]>([]);

    const getTop3BoardListResponse = (responseBody: GetTop3BoardResponseDto | ResponseDto | null) => {
      if(!responseBody) return;
      const {code} = responseBody;
      if(code === 'DBE') alert('데이터베이스 오류입니다');
      if(code !== 'SU') return;

      const {top3List} = responseBody as GetTop3BoardResponseDto;      
      setTop3BoardList(top3List);
    }

    useEffect(() => {
      getTop3BoardListRequest().then(getTop3BoardListResponse);
    },[]);

    return (
      <div id='main-top-wrapper'>
        <div className='main-top-container'>
          <div className='main-top-title'>{'???'}</div>
          <div className='main-top-contents-box'>
            <div className='main-top-contents-title'>{'주간 TOP 3'}</div>
            <div className='main-top-contents'>
              {top3BoardList.map(top3BoardListItem => <Top3Item key={top3BoardListItem.itemNumber} top3ListItem={top3BoardListItem} />)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const MainBottom = () => {

    const {currentPage,
      setCurrentPage,
      currentSection,
      setCurrentSection,
      viewList,
      viewPageList,
      totalSection,
      setTotalList} = usePagination<BoardListItem>(5);

    const [popularWordList, setPopularWordList] = useState<string[]>([]);

    const getLatestBoardListResponse = (responseBody: GetLatestBoardListResponseDto | ResponseDto | null) => {
      if(!responseBody) return;
      const {code} = responseBody;
      if(code === 'DBE') alert('데이터베이스 오류입니다.');
      if(code !== 'SU') return;

      const {latestList} = responseBody as GetLatestBoardListResponseDto;
      setTotalList(latestList);
    }

    const getPopularListResponse = (responseBody: GetPopularListResponseDto | ResponseDto | null) => {
      if(!responseBody) return;
      const {code} = responseBody;
      if(code === 'DBE') alert('데이터베이스 오류입니다.');
      if(code !== 'SU') return;

      const {popularWordList} = responseBody as GetPopularListResponseDto;
      setPopularWordList(popularWordList);
    }

    const onPopularWordClickHandler = (word: string) => {
      navigator(SEARCH_PATH(word));
    }

    useEffect(() => {
      getLatestBoardListRequest().then(getLatestBoardListResponse)
      getPopularListRequest().then(getPopularListResponse)
    },[]);

    return (
      <div id='main-bottom-wrapper'>
        <div className='main-bottom-container'>
          <div className='main-bottom-title'>{'최신'}</div>
          <div className='main-bottom-contents-box'>
            <div className='main-bottom-current-contents'>
              {viewList.map(boardListItem => <BoardItem key={boardListItem.itemNumber} boardListItem={boardListItem} />)}
            </div>
            <div className='main-bottom-popular-box'>
              <div className='main-bottom-popular-card'>
                <div className='main-bottom-popular-card-container'>
                  <div className='main-bottom-popular-card-title'>{'인기 검색어'}</div>
                  <div className='main-bottom-popular-card-contents'>
                    {popularWordList.map(word => <div className='word-badge' key={word}onClick={() => onPopularWordClickHandler(word)}>{word}</div>)}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='main-bottom-pagination-box'>
            <Pagination
            currentPage={currentPage}
            currentSection={currentSection}
            setCurrentPage={setCurrentPage}
            setCurrentSection={setCurrentSection}
            viewPageList={viewPageList}
            totalSection={totalSection}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <MainTop />
      <MainBottom />
    </>
  )
}

