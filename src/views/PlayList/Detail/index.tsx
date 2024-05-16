import CommentItem from "components/CommentItem/intex";
import FavoriteItem from "components/FavoriteItem";

import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { Board, CommentListItem, FavoriteListItem } from "types/interface";
import defaultProfileImage from "assets/images/default-profile-image.png";
import { useLoginUserStore } from "stores";
import { useNavigate, useParams } from "react-router-dom";
import { BOARD_PATH, MAIN_PATH, UPDATE_PATH, USER_PATH } from "constant";
import "./style.css";
import {
  getFavoriteListRequest,
  IncreaseViewCountRequest,
  getBoardRequest,
  getCommentListRequest,
  putFavoriteRequest,
  postCommentRequest,
  deleteBoardRequest,
} from "apis";
import {
  DeleteBoardResponseDto,
  GetBoardResponseDto,
  GetCommentListResponseDto,
  GetFavoriteListResponseDto,
  IncreaseViewCountResponseDto,
  PostCommentResponseDto,
  PutFavoriteResponseDto,
} from "apis/response/board";
import { ResponseDto } from "apis/response";
import dayjs from "dayjs";
import { useCookies } from "react-cookie";
import { PostCommentRequestDto } from "apis/request/board";
import Pagination from "components/Pagination";
import { usePagination } from "hooks";

export default function Detail() {
  const { Number } = useParams();
  const { loginUser } = useLoginUserStore();
  const [cookies, setCookies] = useCookies();

  const navigator = useNavigate();

  const IncreaseViewCountResponse = (
    responseBody: IncreaseViewCountResponseDto | ResponseDto | null
  ) => {
    if (!responseBody) return;
    const { code } = responseBody;
    if (code === "NB") alert("존재하지 않습니다.");
    if (code === "DBE") alert("데이터베이스 오류입니다.");
  };

  const BoardDetailTop = () => {
    const [isWriter, setWriter] = useState<boolean>(false);
    const [board, setBoard] = useState<Board | null>(null);
    const [showMore, setShowMore] = useState<boolean>(false);

    const getWriteDatetimeFormat = () => {
      if (!board) return "";
      const date = dayjs(board.writeDatetime);
      return date.format("YYYY. MM. DD.");
    };

    const getBoardResponse = (
      responseBody: GetBoardResponseDto | ResponseDto | null
    ) => {
      if (!responseBody) return;
      const { code } = responseBody;
      if (code === "NB") alert("존재하지 않습니다.");
      if (code === "DBE") alert("데이터베이스 오류입니다.");
      if (code !== "SU") {
        navigator(MAIN_PATH());
      }
      const board: Board = { ...(responseBody as GetBoardResponseDto) };
      setBoard(board);

      if (!loginUser) {
        setWriter(false);
        return;
      }
      const isWriter = loginUser.userId === board.writerId;
      setWriter(isWriter);
    };

    const deleteBoardResponse = (
      responseBody: DeleteBoardResponseDto | ResponseDto | null
    ) => {
      if (!responseBody) return;
      const { code } = responseBody;
      if (code === "VF") alert("잘못된 접근입니다.");
      if (code === "NU") alert("존재하지 않는 유저입니다.");
      if (code === "NB") alert("존재하지 않습니다.");
      if (code === "NP") alert("권한이 없습니다.");
      if (code === "DBE") alert("데이터베이스 오류입니다.");
      if (code !== "SU") return;

      navigator(MAIN_PATH());
    };

    const onNicknameClickHandler = () => {
      if (!board) return;
      navigator(USER_PATH(board.writerId));
    };

    const onMoreButtonClickHandler = () => {
      setShowMore(!showMore);
    };

    const onUpdateButtonClickHandler = () => {
      if (!board || !loginUser) return;
      if (loginUser.userId !== board.writerId) return;
      navigator(BOARD_PATH() + "/" + UPDATE_PATH(board.itemNumber));
    };

    const onDeleteButtonClickHandler = () => {
      if (!Number || !board || !loginUser || !cookies.accessToken) return;
      if (loginUser.userId !== board.writerId) return;

      deleteBoardRequest(Number, cookies.accessToken).then(deleteBoardResponse);
    };

    const isValidYouTubeUrl = (url: string): boolean => {
      const youtubeUrlPattern =
        /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      return youtubeUrlPattern.test(url);
    };

    const extractYouTubeVideoId = (url: string): string | null => {
      const youtubeUrlPattern =
        /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      const match = url.match(youtubeUrlPattern);
      return match ? match[4] : null;
    };

    useEffect(() => {
      if (!Number) {
        navigator(MAIN_PATH());
        return;
      }
      getBoardRequest(Number).then(getBoardResponse);
    }, [Number]);

    if (!board) return <></>;
    return (
      <div id="board-detail-top">
        <div className="board-detail-top-header">
          <div className="board-detail-title">{board.title}</div>
          <div className="board-detail-top-sub-box">
            <div className="board-detail-write-info-box">
              <div
                className="board-detail-writer-profile-image"
                style={{
                  backgroundImage: `url(${
                    board.writerProfileImage
                      ? board.writerProfileImage
                      : defaultProfileImage
                  })`,
                }}
              ></div>
              <div
                className="board-detail-writer-nickname"
                onClick={onNicknameClickHandler}
              >
                {board.writerNickname}
              </div>
              <div className="board-detail-info-divider">{"\|"}</div>
              <div className="board-detail-write-date">
                {getWriteDatetimeFormat()}
              </div>
            </div>
            {isWriter && (
              <div className="icon-button" onClick={onMoreButtonClickHandler}>
                <div className="icon more-icon"></div>
              </div>
            )}
            {showMore && (
              <div className="board-detail-more-box">
                <div
                  className="board-detail-update-button"
                  onClick={onUpdateButtonClickHandler}
                >
                  {"수정"}
                </div>
                <div className="divider"></div>
                <div
                  className="board-detail-delete-button"
                  onClick={onDeleteButtonClickHandler}
                >
                  {"삭제"}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="divider"></div>
        <div className="board-detail-top-main">
          <div className="board-detail-main-text">{board.content}</div>
          {board.boardImageList.map((image) => (
            <img key={image} className="board-detail-main-image" src={image} />
          ))}
          {isValidYouTubeUrl(board.videoUrl) && (
            <div className="board-write-youtube-preview">
              <iframe
                width="560"
                height="315"
                src={`https://www.youtube.com/embed/${extractYouTubeVideoId(
                  board.videoUrl
                )}`}
                frameBorder="0"
                allowFullScreen
              ></iframe>
            </div>
          )}
        </div>
      </div>
    );
  };

  const BoardDetailBottom = () => {
    const commentRef = useRef<HTMLTextAreaElement | null>(null);

    const {
      currentPage,
      currentSection,
      viewList,
      viewPageList,
      totalSection,
      setCurrentPage,
      setCurrentSection,
      setTotalList,
    } = usePagination<CommentListItem>(3);

    const [favoriteList, setFavoriteList] = useState<FavoriteListItem[]>([]);
    const [commentList, setCommentList] = useState<CommentListItem[]>([]);

    const [isFavorite, setFavorite] = useState<boolean>(false);
    const [showFavorite, setShowFavorite] = useState<boolean>(false);
    const [showComment, setShowComment] = useState<boolean>(false);

    const [comment, setComment] = useState<string>("");
    const [totalCommentCount, setTotalCommentCount] = useState<number>(0);

    const getFavoriteListResponse = (
      responseBody: GetFavoriteListResponseDto | ResponseDto | null
    ) => {
      if (!responseBody) return;
      const { code } = responseBody;
      if (code === "NB") alert("존재하지 않습니다.");
      if (code === "DBE") alert("데이터베이스 오류입니다.");
      if (code !== "SU") return;

      const { favoriteList } = responseBody as GetFavoriteListResponseDto;
      setFavoriteList(favoriteList);
      
      if (!loginUser) {
        setFavorite(false);
        return;
      }
      const isFavorite =
        favoriteList.findIndex(
          (favorite) => favorite.userId === loginUser.userId
        ) !== -1;
      setFavorite(isFavorite);
    };

    const getCommentListResponse = (
      responseBody: GetCommentListResponseDto | ResponseDto | null
    ) => {
      if (!responseBody) return;
      const { code } = responseBody;
      if (code === "NB") alert("존재하지 않습니다.");
      if (code === "DBE") alert("데이터베이스 오류입니다.");
      if (code !== "SU") return;

      const { commentList } = responseBody as GetCommentListResponseDto;
      setTotalList(commentList);
      setTotalCommentCount(commentList.length);
    };

    const putFavoriteResponse = (
      responseBody: PutFavoriteResponseDto | ResponseDto | null
    ) => {
      if (!responseBody) return;
      const { code } = responseBody;
      if (code === "VF") alert("잘못된 접근입니다.");
      if (code === "NU") alert("존재하지 않는 유저입니다.");
      if (code === "NB") alert("존재하지 않습니다.");
      if (code === "AF") alert("인증에 실패했습니다.");
      if (code === "DBE") alert("데이터베이스 오류입니다.");
      if (code !== "SU") return;

      if (!Number) return;
      getFavoriteListRequest(Number).then(getFavoriteListResponse);
    };

    const postCommentResponse = (
      responseBody: PostCommentResponseDto | ResponseDto | null
    ) => {
      if (!responseBody) return;
      const { code } = responseBody;
      if (code === "VF") alert("잘못된 접근입니다.");
      if (code === "NU") alert("존재하지 않는 유저입니다.");
      if (code === "NB") alert("존재하지 않습니다.");
      if (code === "AF") alert("인증에 실패했습니다.");
      if (code === "DBE") alert("데이터베이스 오류입니다.");
      if (code !== "SU") return;

      setComment("");

      if (!Number) return;
      getCommentListRequest(Number).then(getCommentListResponse);
    };

    const onFavoriteClickHandler = () => {
      if (!Number || !loginUser || !cookies.accessToken) return;
      putFavoriteRequest(Number, cookies.accessToken).then(putFavoriteResponse);
    };

    const onShowFavoriteClickHandler = () => {
      setShowFavorite(!showFavorite);
    };

    const onShowCommentClickHandler = () => {
      setShowComment(!showComment);
    };

    const onCommentSubmitButtonClickHandler = () => {
      if (!comment || !Number || !loginUser || !cookies.accessToken) return;

      const requestBody: PostCommentRequestDto = { content: comment };
      postCommentRequest(Number, requestBody, cookies.accessToken).then(
        postCommentResponse
      );
    };

    const onCommentChangeHandler = (
      event: ChangeEvent<HTMLTextAreaElement>
    ) => {
      const { value } = event.target;
      setComment(value);
      if (!commentRef.current) return;
      commentRef.current.style.height = "auto";
      commentRef.current.style.height = `${commentRef.current?.scrollHeight}px`;
    };

    useEffect(() => {
      if (!Number) return;
      getFavoriteListRequest(Number).then(getFavoriteListResponse);
      getCommentListRequest(Number).then(getCommentListResponse);
    }, [Number]);

    return (
      <div id="board-detail-bottom">
        <div className="board-detail-bottom-box">
          <div className="board-detail-bottom-button-group">
            <div className="icon-button" onClick={onFavoriteClickHandler}>
              {isFavorite ?
                <div className="icon favorite-fill-icon"></div> :
                <div className="icon favorite-light-icon"></div>
              }
            </div>
            <div className="board-detail-bottom-button-text">{`${favoriteList.length}`}</div>
            <div className="icon-button" onClick={onShowFavoriteClickHandler}>
              {showFavorite ?
                <div className="icon up-light-icon"></div> :
                <div className="icon down-light-icon"></div>
              }
            </div>
          </div>
          <div className="board-detail-bottom-button-group">
            <div className="icon-button">
              <div className="icon comment-icon"></div>
            </div>
            <div className="board-detail-bottom-button-text">{`${totalCommentCount}`}</div>
            <div className="icon-button" onClick={onShowCommentClickHandler}>
              {showComment ?
                <div className="icon up-light-icon"></div>:
                <div className="icon down-light-icon"></div>
              }
            </div>
          </div>
        </div>
        {showFavorite &&
          <div className="board-detail-bottom-favorite-box">
            <div className="board-detail-bottom-favorite-container">
              <div className="board-detail-bottom-favorite-title">
                <span className="emphasis">{favoriteList.length}</span>
              </div>
              <div className="board-detail-bottom-favorite-contents">
                {favoriteList.map((item) => (<FavoriteItem key={item.userId} favoriteListItem={item} />))}
              </div>
            </div>
          </div>
        }
        {showComment &&
          <div className="board-detail-bottom-comment-box">
            <div className="board-detail-bottom-comment-container">
              <div className="board-detail-bottom-comment-title">
                <span className="emphasis">{totalCommentCount}</span>
              </div>
              <div className="board-detail-bottom-comment-list-container">
                {viewList.map((item) => (<CommentItem commentListItem={item} />))}
              </div>
            </div>

            <div className="divider"></div>
            <div className="board-detail-bottom-comment-pagination-box">
              <Pagination
                currentPage={currentPage}
                currentSection={currentSection}
                setCurrentPage={setCurrentPage}
                setCurrentSection={setCurrentSection}
                viewPageList={viewPageList}
                totalSection={totalSection}
              />
            </div>
            {loginUser !== null && (
              <div className="board-detail-bottom-comment-input-box">
                <div className="board-detail-bottom-comment-input-comtainer">
                  <textarea
                    ref={commentRef}
                    className="board-detail-bottom-comment-textarea"
                    placeholder="댓글을 작성해주세요."
                    value={comment}
                    onChange={onCommentChangeHandler}
                  />
                  <div className="board-detail-bottom-comment-button-box">
                    <div
                      className={
                        comment === "" ? "disable-button" : "black-button"
                      }
                      onClick={onCommentSubmitButtonClickHandler}
                    >
                      {"댓글달기"}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        }
      </div>
    );
  };

  let effectFlag = true;
  useEffect(() => {
    if (!Number) return;
    if (effectFlag) {
      effectFlag = false;
      return;
    }
    IncreaseViewCountRequest(Number).then(IncreaseViewCountResponse);
  }, [Number]);

  return (
    <div id="board-detail-wrapper">
      <div className="board-detail-container">
        <BoardDetailTop />
        <BoardDetailBottom />
      </div>
    </div>
  );
}
