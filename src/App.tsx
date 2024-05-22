import { DETAIL_PATH, MAIN_PATH, BOARD_PATH, SEARCH_PATH, SIGNIN_PATH, SIGNUP_PATH, UPDATE_PATH, USER_PATH, WRITE_PATH, MUSIC_PATH } from 'constant';
import Container from 'layout/Container';
import { Route, Routes } from 'react-router-dom';
import SignIn from 'views/Authentication/SignIn';
import SignUp from 'views/Authentication/SignUp';
import Main from 'views/Main';
import Detail from 'views/PlayList/Detail';
import Update from 'views/PlayList/Update';
import Write from 'views/PlayList/Write';
import Search from 'views/Search';
import UserP from 'views/User';
import './App.css';
import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { useLoginUserStore } from 'stores';
import { getSignInUserRequest } from 'apis';
import { GetSignInUserResponseDto } from 'apis/response/user';
import { ResponseDto } from 'apis/response';
import { User } from 'types/interface';
import Player from 'components/Player/Player';
import ASDF from 'components/Player/asdf';
import OAuth from 'views/Authentication/OAuth';

function App() {
  const {setLoginUser, resetLoginUser} = useLoginUserStore();
  const [cookies, setCookies] = useCookies();

  const getSignInUserResponse = (responseBody: GetSignInUserResponseDto | ResponseDto | null) => {
    if(!responseBody) return;
    const {code} = responseBody;

    if(code === 'AF' || code === 'NU' || code === 'DBE'){
      resetLoginUser();
      return;
    }
    const loginUser: User = { ...responseBody as GetSignInUserResponseDto};
    setLoginUser(loginUser);
  }

  useEffect(() => {
    if(!cookies.accessToken) {
      resetLoginUser();
      return;
    }
    getSignInUserRequest(cookies.accessToken).then(getSignInUserResponse)
  }, [cookies.accessToken]);

  return (
    <Routes>
      <Route element={<Container />}>
        <Route path={MAIN_PATH()} element={<Main />} />
        <Route path={SIGNIN_PATH()} element={<SignIn />} />
        <Route path={SIGNUP_PATH()} element={<SignUp />} />
        <Route path='auth/oauth-response/:token/:expirationTime' element={<OAuth/>} />
        <Route path={SEARCH_PATH(':searchWord')} element={<Search />} />
        <Route path={USER_PATH(':userId')} element={<UserP />} />
        <Route path={BOARD_PATH()}>
          <Route path={WRITE_PATH()} element={<Write />} />
          <Route path={DETAIL_PATH(':Number')} element={<Detail />} />
          <Route path={UPDATE_PATH(':Number')} element={<Update />} />
        </Route>
        <Route path={MUSIC_PATH()} element={<Player playlist={[]} />} />
        <Route path='/asdf' element={<ASDF playlist={[]} />} />
        <Route path='*' element={<h1>404 Not Found</h1>} />
      </Route>
    </Routes>
  );
}

export default App;
