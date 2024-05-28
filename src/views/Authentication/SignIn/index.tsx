
import { SNS_SIGN_IN_URL, signInRequest } from "apis";
import { SignInRequestDto } from "apis/request/auth";
import { SignInResponseDto } from "apis/response/auth";
import InputBox from "components/InputBox";
import { ChangeEvent, KeyboardEvent, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { ResponseBody } from "types";
import { ResponseCode } from "types/enums";
import './style.css';
import { MAIN_PATH, SIGNUP_PATH } from "constant";
import { PasswordRecoveryRequestDto } from "apis/request/user";
import { PasswordRecoveryResponseDto } from "apis/response/user";
import { ResponseDto } from "apis/response";

export default function SignIn() {

    const userIdRef = useRef<HTMLInputElement | null>(null);
    const passwordRef = useRef<HTMLInputElement | null>(null);

    const [cookie, setCookie] = useCookies();
    const [email, setEmail] = useState<string>('');
    const [userId, setUserId] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [passwordType, setPasswordType] = useState<'text' | 'password'>('password');

    const [message, setMessage] = useState<string>('');

    const navigate = useNavigate();

    const signInResponse = (responseBody: ResponseBody<SignInResponseDto>) => {

        if (!responseBody) return;
        const { code } = responseBody;
        if (code === ResponseCode.VALIDATION_FAIL) alert('아이디와 비밀번호를 입력하세요.');
        if (code === ResponseCode.SING_IN_FAIL) setMessage('로그인 정보가 일치하지 않습니다.');
        if (code === ResponseCode.DATABASE_ERROR) alert('데이터베이스 오류입니다.');
        if (code !== ResponseCode.SUCCESS) return;

        const { token, expirationTime } = responseBody as SignInResponseDto;

        const now = (new Date().getTime()) * 1000;
        const expires = new Date(now + expirationTime);

        setCookie('accessToken', token, { expires, path: MAIN_PATH() });
        navigate(MAIN_PATH());
    };

    const onIdChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        setUserId(value);
        setMessage('');
    };

    const onPasswordChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        setPassword(value);
        setMessage('');
    };

    const onSignUpButtonClickHandler = () => {
        navigate(SIGNUP_PATH());
    };

    const onSignInButtonClickHandler = () => {

        if (!userId || !password) {
            alert('아이디와 비밀번호 모두 입력하세요.');
            return;
        }
        const requestBody: SignInRequestDto = { userId, password };
        signInRequest(requestBody).then(signInResponse);
    };

    const onSnsSignInButtonClickHandler = (type: 'kakao' | 'naver' | 'google') => {
        window.location.href = SNS_SIGN_IN_URL(type);
    };

    const onIdKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== 'Enter') return;
        if (!passwordRef.current) return;
        passwordRef.current.focus();
    };
    const onPasswordKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== 'Enter') return;
        onSignInButtonClickHandler();
    };

    const recoverPasswordResponse = (responseBody: ResponseBody<PasswordRecoveryResponseDto>) => {
        if (!responseBody) return;
        const { code } = responseBody;
        if (code === ResponseCode.VALIDATION_FAIL) alert('이메일을 입력하세요.');
        if (code === ResponseCode.SUCCESS) alert('비밀번호 재설정 메일이 발송되었습니다.');
        if (code === ResponseCode.DATABASE_ERROR) alert('데이터베이스 오류입니다.');
    };

    const recoverPassword = async () => {
        if(!email) return;
        const requestBody: PasswordRecoveryRequestDto = { email };
        passwordRecoveryRequest(requestBody).then(recoverPasswordResponse);
    };


    return (
        <div id='sign-in-wrapper'>
            <div className='sign-in-image'></div>
            <div className='sign-in-container'>
                <div className='sign-in-box'>
                    <div className='sign-in-title'>{'?'}</div>
                    <div className='sign-in-content-box'>
                        <div className='sign-in-content-input-box'>
                            <InputBox ref={userIdRef} title='아이디' placeholder='아이디를 입력해주세요' type='text' value={userId} onChange={onIdChangeHandler} onKeyDown={onIdKeyDownHandler} />
                            <InputBox ref={passwordRef} title='비밀번호' placeholder='비밀번호를 입력해주세요' type={passwordType} value={password} onChange={onPasswordChangeHandler} isErrorMessage message={message} onKeyDown={onPasswordKeyDownHandler} />
                            <div className='sign-in-content-button-box'>
                                <div className='primary-button-lg full-width' onClick={onSignInButtonClickHandler}>{'로그인'}</div>
                                <div className='text-link-lg full-width' onClick={onSignUpButtonClickHandler}>{'회원가입'}</div>
                            </div>
                            <div className='sign-in-content-divider'></div>
                            <div className='sign-in-content-sns-sign-in-box'>
                                <div className='sign-in-content-sns-sign-in-title'>{'sns 로그인'}</div>
                                <div className='sign-in-content-sns-sign-in-button-box'>
                                    <div className='kakao-sign-in-button' onClick={() => onSnsSignInButtonClickHandler('kakao')}></div>
                                    <div className='naver-sign-in-button' onClick={() => onSnsSignInButtonClickHandler('naver')}></div>
                                    <div className='google-sign-in-button' onClick={() => onSnsSignInButtonClickHandler('google')}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2>User Component</h2>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <button onClick={recoverPassword}>Recover Password</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function passwordRecoveryRequest(requestBody: PasswordRecoveryRequestDto) {
    throw new Error("Function not implemented.");
}
