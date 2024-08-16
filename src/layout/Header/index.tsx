import { BOARD_PATH, DETAIL_PATH, MAIN_PATH, SEARCH_PATH, SIGNIN_PATH, SIGNUP_PATH, UPDATE_PATH, USER_PATH, WRITE_PATH } from 'constant';
import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useLoginUserStore, useBoardStore } from 'stores';
import './style.css';
import { fileUploadRequest, patchBoardRequest, postBoardRequest } from 'apis';
import { PatchBoardResponseDto, PostBoardResponseDto } from 'apis/response/board';
import { PostBoardRequestDto, PatchBoardRequestDto } from 'apis/request/board';
import { ResponseDto } from 'apis/response';

export default function Header() {

  const { loginUser, setLoginUser, resetLoginUser } = useLoginUserStore();
  const { pathname } = useLocation();
  const [cookies, setCookie] = useCookies();

  const [isLogin, setLogin] = useState<boolean>(false);
  const [isAuthPage, setAuthPage] = useState<boolean>(false);
  const [isMainPage, setMainPage] = useState<boolean>(false);
  const [isSearchPage, setSearchPage] = useState<boolean>(false);
  const [isDetailPage, setDetailPage] = useState<boolean>(false);
  const [isWritePage, setWritePage] = useState<boolean>(false);
  const [isUpdatePage, setUpdatePage] = useState<boolean>(false);
  const [isUserPage, setUserPage] = useState<boolean>(false);

  useEffect(() => {
    const isAuthPage = (pathname === SIGNIN_PATH() || pathname === SIGNUP_PATH());
    setAuthPage(isAuthPage);
    const isMainPage = pathname === MAIN_PATH();
    setMainPage(isMainPage);
    const isSearchPage = pathname.startsWith(SEARCH_PATH(''));
    setSearchPage(isSearchPage);
    const isDetailPage = pathname.startsWith(BOARD_PATH() + '/' + DETAIL_PATH(''));
    setDetailPage(isDetailPage);
    const isWritePage = pathname.startsWith(BOARD_PATH() + '/' + WRITE_PATH());
    setWritePage(isWritePage);
    const isUpdatePage = pathname.startsWith(BOARD_PATH() + '/' + UPDATE_PATH(''));
    setUpdatePage(isUpdatePage);
    const isUserPage = pathname.startsWith(USER_PATH(''));
    setUserPage(isUserPage);
  }, [pathname]);

  useEffect(() => {
    setLogin(loginUser !== null);
  }, [loginUser])

  const navigator = useNavigate();

  const onLogoClickHandler = () => {
    navigator(MAIN_PATH());
  }
  const SearchButton = () => {

    const searchButtonRef = useRef<HTMLDivElement | null>(null);

    const [status, setStatus] = useState<boolean>(false);
    const [word, setWord] = useState<string>('');

    const { searchWord } = useParams();

    const onSearchWordChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setWord(value);
    };

    const onSearchWordKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter') return;
      if (!searchButtonRef) return;
      searchButtonRef.current?.click();
    };

    const onSearchButtonClickHandler = () => {
      if (!status) {
        setStatus(!status);
        return;
      }
      navigator(SEARCH_PATH(word));
    };

    useEffect(() => {
      if (searchWord) {
        setWord(searchWord);
        setStatus(true);
      }
    })

    if (!status)
      return (
        <div className='icon-button' onClick={onSearchButtonClickHandler}>
          <div className='icon search-light-icon'></div>
        </div>
      );

    return (
      <div className='header-search-input-box'>
        <input className='header-search-input' type='text' placeholder='검색어를 입력해주세요.' value={word} onChange={onSearchWordChangeHandler} onKeyDown={onSearchWordKeyDownHandler} />
        <div className='icon-button' onClick={onSearchButtonClickHandler}>
          <div ref={searchButtonRef} className='icon search-light-icon'></div>
        </div>
      </div>
    );
  };
  const MyPageButton = () => {

    const onMyPageButtonClickHandler = () => {
      if (!loginUser) return;
      const { userId } = loginUser;
      navigator(USER_PATH(userId));
    };
    const onSignOutButtonClickHandler = () => {
      resetLoginUser();
      setCookie('accessToken', '', { path: MAIN_PATH(), expires: new Date() })
      navigator(MAIN_PATH());
    };
    const onSignInButtonClickHandler = () => {
      navigator(SIGNIN_PATH());
    };
    if (isLogin && isUserPage)
      return <div className='white-button' onClick={onSignOutButtonClickHandler}>{'로그아웃'}</div>
    if (isLogin && isMainPage || isDetailPage)
      return <div className='white-button' onClick={onMyPageButtonClickHandler}>{'마이페이지'}</div>
    if (!isLogin)
      return <div className='black-button' onClick={onSignInButtonClickHandler}>{'로그인'}</div>;
    return null;
  };
  
  const UploadButton = () => {

    const params = useParams();
    const itemNumber = Number(params["Number"]);
    const { title, content, videoUrl, boardImageFileList, resetBoard } = useBoardStore();

    const postBoardResponse = (responseBody: PostBoardResponseDto | ResponseDto | null) => {
      if (!responseBody) return;
      const { code } = responseBody;
      if (code === 'DBE') alert('데이터베이스 오류입니다.');
      if (code === 'AF' || code === 'NU') navigator(SIGNIN_PATH());
      if (code === 'VF') alert('모두 입력하세요.');
      if (code !== 'SU') return;

      resetBoard();

      if (!loginUser) return;
      const { userId } = loginUser;
      navigator(USER_PATH(userId));
    }

    const patchBoardResponse = (responseBody: PatchBoardResponseDto | ResponseDto | null) => {
      if (!responseBody) return;
      const { code } = responseBody;
      if (code === 'DBE') alert('데이터베이스 오류입니다.');
      if (code === 'AF' || code === 'NU' || code === 'NB' || code === 'NP') navigator(SIGNIN_PATH());
      if (code === 'VF') alert('모두 입력하세요.');
      if (code !== 'SU') return;

      if (!itemNumber) return;
      navigator(BOARD_PATH() + '/' + DETAIL_PATH(itemNumber));
    }

    const onUploadButtonClickHandler = async () => {
      const accessToken = cookies.accessToken;
      if (!accessToken) return;

      const boardImageList: string[] = [];

      for (const file of boardImageFileList) {
        const data = new FormData();
        data.append('file', file);

        const url = await fileUploadRequest(data);
        if (url) boardImageList.push(url);
      }

      const isWritePage = pathname === BOARD_PATH() + '/' + WRITE_PATH();
      if (isWritePage) {
        const requestBody: PostBoardRequestDto = {
          title, content, videoUrl, imageUrls: boardImageList
        }
        console.log(requestBody);
        postBoardRequest(requestBody, accessToken).then(postBoardResponse);
      } else {
        if (!itemNumber) {
          alert('존재하지 않는 번호입니다.');
        } else {
          const requestBody: PatchBoardRequestDto = { title, content, videoUrl, boardImageList }
          patchBoardRequest(itemNumber, requestBody, accessToken).then(patchBoardResponse);
        }
      }
    }

    if (title && content && boardImageFileList.length > 0)
      return <div className='black-button' onClick={onUploadButtonClickHandler}>{'업로드'}</div>;
    return <div className='disable-button'>{'업로드'}</div>;
  };

  return (
    <div id='header'>
      <div className='header-container'>
        <div className='header-left-box' onClick={onLogoClickHandler}>
          <div className='icon-box'>
            <div className='icon logo-dark-icon'></div>
          </div>
          <div className='header-logo'>{'blog'}</div>
        </div>
        <div className='header-right-box'>
          {(isAuthPage || isMainPage || isSearchPage || isDetailPage) && <SearchButton />}
          {(isMainPage || isSearchPage || isDetailPage || isUserPage) && <MyPageButton />}
          {(isWritePage || isUpdatePage) && <UploadButton />}
        </div>
      </div>
    </div>
  );
}
