import Player from 'components/Player/Player';
import Test from 'components/Player/Test';
import { SIGNIN_PATH, SIGNUP_PATH } from 'constant';
import Footer from 'layout/Footer';
import Header from 'layout/Header';
import { Outlet, useLocation } from 'react-router-dom';

export default function Container() {

    const {pathname} = useLocation();

  return (
    <>
        <Header />
        <Outlet />
        <Test playlist={[]} />
        {(pathname !== SIGNIN_PATH() && pathname !== SIGNUP_PATH()) && <Footer />}
    </>
  )
}
