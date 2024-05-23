export const MAIN_PATH = () => '/';
export const SIGNIN_PATH = () => '/auth/sign-in';
export const SIGNUP_PATH = () => '/auth/sign-up';
export const SEARCH_PATH = (searchWord: string) => `/search/${searchWord}`;
export const USER_PATH = (userId: string) => `/user/${userId}`;
export const BOARD_PATH = () => '/board';
export const DETAIL_PATH = (Number: string | number) => `detail/${Number}`;
export const WRITE_PATH = () => 'write';
export const UPDATE_PATH = (Number: string | number) => `update/${Number}`;
export const DELETE_PATH = (Number: string | number) => `delete/${Number}`;
export const MUSIC_PATH = () => `/music`;
export const PASSWORD_PATH = () => '/password';