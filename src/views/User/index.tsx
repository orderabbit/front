import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import defaultProfileImage from 'assets/images/default-profile-image.png';
import { useNavigate, useParams } from 'react-router-dom';
import './style.css';
import { BoardListItem } from 'types/interface';
import BoardItem from 'components/BoardItem';
import { BOARD_PATH, MAIN_PATH, USER_PATH, WRITE_PATH } from 'constant';
import { useLoginUserStore } from 'stores';
import { changePasswordRequest, fileUploadRequest, getUserBoardListRequest, getUserRequest, patchNicknameRequest, patchProfileImageRequest, withdrawUserRequest } from 'apis';
import { GetUserBoardListResponseDto } from 'apis/response/board';
import { ResponseDto } from 'apis/response';
import { GetUserResponseDto, PatchNicknameResponseDto, PatchProfileImageResponseDto } from 'apis/response/user';
import { PatchNicknameRequestDto, PatchPasswordRequestDto, PatchProfileImageRequestDto } from 'apis/request/user';
import { useCookies } from 'react-cookie';
import { usePagination } from 'hooks';
import Pagination from 'components/Pagination';

export default function User() {

  const { userId } = useParams();
  const { loginUser } = useLoginUserStore();

  const [cookies, setCookie] = useCookies();
  const [isMyPage, setMyPage] = useState<boolean>(false);
  const navigator = useNavigate();

  const UserTop = () => {

    const imageInputRef = useRef<HTMLInputElement | null>(null);

    // const userId = loginUser?.userId;
    const [isNicknameChange, setNicknameChange] = useState<boolean>(false);
    const [nickname, setNickname] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [changeNickname, setChangeNickname] = useState<string>('');
    const [profileImage, setProfileImage] = useState<string | null>(null);

    const getUserResponse = (responseBody: GetUserResponseDto | ResponseDto | null) => {
      if (!responseBody) return;
      const { code } = responseBody;
      if (code === 'NU') alert('존재하지 않는 유저입니다.');
      if (code === 'DBE') alert('데이터베이스 오류입니다.');
      if (code !== 'SU') {
        navigator(MAIN_PATH());
        return;
      }
      const { userId, nickname, email, profileImage } = responseBody as GetUserResponseDto;

      setNickname(nickname);
      setEmail(email);
      setProfileImage(profileImage);
      const isMyPage = userId === loginUser?.userId;
      setMyPage(isMyPage);
    }

    const fileUploadResponse = (profileImage: string | null) => {
      if (!profileImage) return;
      if (!cookies.accessToken) return;
      const requestBody: PatchProfileImageRequestDto = { profileImage };
      patchProfileImageRequest(requestBody, cookies.accessToken).then(patchProfileImageResponse);
    }

    const patchProfileImageResponse = (responseBody: PatchProfileImageResponseDto | ResponseDto | null) => {

      if (!cookies.accessToken) return;

      if (!responseBody) return;
      const { code } = responseBody;
      if (code === 'AF') alert('인증에 실패했습니다.');
      if (code === 'NU') alert('존재하지 않는 유저입니다.');
      if (code === 'DBE') alert('데이터베이스 오류입니다.');
      if (code !== 'SU') return;

      if (!userId) return;
      getUserRequest(userId, cookies.accessToken).then(getUserResponse);
    }

    const patchNicknameResponse = (responseBody: PatchNicknameResponseDto | ResponseDto | null) => {

      if (!cookies.accessToken) return;

      if (!responseBody) return;
      const { code } = responseBody;
      if (code === 'VF') alert('비밀번호는 필수입니다.');
      if (code === 'AF') alert('인증에 실패했습니다.');
      if (code === 'DP') alert('기존 비밀번호와 중복되는 비밀번호입니다.');
      if (code === 'NU') alert('존재하지 않는 유저입니다.');
      if (code === 'DBE') alert('데이터베이스 오류입니다.');
      if (code !== 'SU') return;

      if (!userId) return;
      getUserRequest(userId, cookies.accessToken).then(getUserResponse);
      setNicknameChange(false);
    };
    const onProfileBoxClickHandler = () => {
      if (!isMyPage) return;
      if (!imageInputRef.current) return;
      imageInputRef.current.click();
    };

    const onNicknameEditButtonClickHandler = () => {
      if (isNicknameChange && changeNickname !== '') {
        const requestBody: PatchNicknameRequestDto = { nickname: changeNickname };
        patchNicknameRequest(requestBody, cookies.accessToken).then(patchNicknameResponse);
      }
      setNicknameChange(!isNicknameChange);
    };

    const onProfileImageChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
      if (!event.target.files || !event.target.files.length) return;

      const file = event.target.files[0];
      const data = new FormData();
      data.append('file', file);

      fileUploadRequest(data).then(fileUploadResponse);
    }

    const onNicknameChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setChangeNickname(value);
    }

    useEffect(() => {
      if (!userId) return;
      getUserRequest(userId, cookies.accessToken).then(getUserResponse);
    }, [userId]);

    if (!userId) return (<></>);
    return (
      <div>
        <div id='user-top-wrapper'>
          <div className='user-top-container'>
            {isMyPage ?
              <div className='user-top-my-profile-image-box' onClick={onProfileBoxClickHandler}>
                {profileImage !== null ?
                  <div className='user-top-profile-image' style={{ backgroundImage: `url(${profileImage})` }}></div> :
                  <div className='icon-box-large'>
                    <div className='icon image-box-white-icon'></div>
                  </div>
                }
                <input ref={imageInputRef} type='file' accept='image/*' style={{ display: 'none' }} onChange={onProfileImageChangeHandler} />
              </div> :
              <div className='user-top-profile-image-box' style={{ backgroundImage: `url(${profileImage ? profileImage : defaultProfileImage})` }}></div>
            }
            <div className='user-top-info-box'>
              <div className='user-top-info-nickname-box'>
                {isMyPage ?
                  <>
                    {isNicknameChange ?
                      <input className='user-top-info-nickname-input' type='text' size={nickname.length + 2} value={changeNickname} onChange={onNicknameChangeHandler} /> :
                      <div className='user-top-info-nickname'>{nickname}</div>
                    }
                    <div className='icon-box' onClick={onNicknameEditButtonClickHandler}>
                      <div className='icon edit-icon'></div>
                    </div></> :
                  <div className='user-top-info-nickname'>{nickname}</div>
                }
              </div>
              <div className='user-top-info-email'>{email}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };


  const UserBottom = () => {

    const { currentPage,
      setCurrentPage,
      currentSection,
      setCurrentSection,
      viewList,
      viewPageList,
      totalSection,
      setTotalList } = usePagination<BoardListItem>(5);

    const { loginUser, setLoginUser, resetLoginUser } = useLoginUserStore();
    const [count, setCount] = useState<number>(0);

    const getUserBoardListResponse = (responseBody: GetUserBoardListResponseDto | ResponseDto | null) => {
      if (!responseBody) return;
      const { code } = responseBody;
      if (code === 'NU') {
        alert('존재하지 않는 유저입니다.');
        navigator(MAIN_PATH());
        return;
      }
      if (code === 'DBE') alert('데이터베이스 오류입니다.');
      if (code !== 'SU') return;

      const { userBoardList } = responseBody as GetUserBoardListResponseDto;
      setTotalList(userBoardList);
      setCount(userBoardList.length);
    }

    const withDrawUserResponse = (responseBody: ResponseDto | null) => {
      if (!responseBody) return;
      const { code } = responseBody;
      if (code === 'AF') alert('인증에 실패했습니다.');
      if (code === 'NU') alert('존재하지 않는 유저입니다.');
      if (code === 'DBE') alert('데이터베이스 오류입니다.');
      if (code !== 'SU') return;

      resetLoginUser();
      setCookie('accessToken', '', { path: '/', expires: new Date() })
      alert('회원탈퇴가 완료되었습니다.');
      navigator(MAIN_PATH());
    }

    const withDrawalUserButtonClickHandler = () => {
      alert('정말 탈퇴하시겠습니까?');
      if (!cookies.accessToken) return;
      if (!loginUser) return;
      const { userId } = loginUser;

      withdrawUserRequest(userId, cookies.accessToken).then(withDrawUserResponse);
    }

    const onSideCardClickHandler = () => {
      if (isMyPage) navigator(BOARD_PATH() + '/' + WRITE_PATH());
      else if (loginUser) navigator(USER_PATH(loginUser.userId));
    }

    useEffect(() => {
      if (!userId) return;
      getUserBoardListRequest(userId).then(getUserBoardListResponse)
    }, [userId])

    return (
      <div id='user-bottom-wrapper'>
        <div className='user-bottom-container'>
          <div className='user-bottom-title'>{isMyPage ? '내 게시글 ' : '게시글 '}<span className='emphasis'>{count}</span></div>
          <div className='user-bottom-contents-box'>
            {count === 0 ?
              <div className='user-bottom-contents-nothing'>{'게시글이 없습니다.'}</div> :
              <div className='user-bottom-contents'>
                {viewList.map(boardListItem => <BoardItem key={boardListItem.itemNumber} boardListItem={boardListItem} />)}
              </div>
            }
            <div className='user-bottom-side-box'>
              <div className='user-bottom-side-card' onClick={onSideCardClickHandler}>
                <div className='user-bottom-side-container'>
                  {isMyPage ?
                    <>
                      <div className='icon-box'>
                        <div className='icon edit-icon'></div>
                      </div>
                      <div className='user-bottom-side-text'>{'글쓰기'}</div>
                    </> :
                    <>
                      <div className='user-bottom-side-text'>{'내 게시글로 가기'}</div>
                      <div className='icon-box'>
                        <div className='icon arrow-right-icon'></div>
                      </div>

                    </>
                  }
                </div>
              </div>
              <div className='withDrawal-user-box'>
                <div className='withDrawal-user' onClick={withDrawalUserButtonClickHandler}>{'회원탈퇴'}</div>
              </div>
            </div>
          </div>
          <div className='user-bottom-pagination-box'>
            {count !== 0 &&
              <Pagination
                currentPage={currentPage}
                currentSection={currentSection}
                setCurrentPage={setCurrentPage}
                setCurrentSection={setCurrentSection}
                viewPageList={viewPageList}
                totalSection={totalSection}
              />}
          </div>
        </div>
      </div>
    );
  };


  return (
    <>
      <UserTop />
      <UserBottom />
    </>
  )
}

