
import { SNS_SIGN_IN_URL, checkCertificationRequest, emailCertificationRequest, userIdCheckRequest, nicknameCheckRequest, signupRequest } from "apis";
import { CheckCertificationRequestDto, EmailCertificationRequestDto, SignUpRequestDto, userIdCheckRequestDto } from "apis/request/auth";
import nicknameCheckRequestDto from "apis/request/auth/nickname-check.request.dto";
import { CheckCertificationResponseDto, EmailCertificationResponseDto, SignUpResponseDto, userIdCheckResponseDto } from "apis/response/auth";
import nicknameCheckResponseDto from "apis/response/auth/nickname-check.response.dto";
import InputBox from "components/InputBox";
import { ChangeEvent, KeyboardEvent, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ResponseBody } from "types";
import { ResponseCode } from "types/enums";
import './style.css';
import { SIGNIN_PATH } from "constant";

export default function SignUp() {

    const userIdRef = useRef<HTMLInputElement | null>(null);
    const nicknameRef = useRef<HTMLInputElement | null>(null);
    const passwordRef = useRef<HTMLInputElement | null>(null);
    const passwordCheckRef = useRef<HTMLInputElement | null>(null);
    const emailRef = useRef<HTMLInputElement | null>(null);
    const certificationNumberRef = useRef<HTMLInputElement | null>(null);

    const [userId, setUserId] = useState<string>('');
    const [nickname, setNickname] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [passwordCheck, setPasswordCheck] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [certificationNumber, setCertificationNumber] = useState<string>('');
    const [agreedPersonal, setAgreenPersonal] = useState<boolean>(false);

    const [isUserIdError, setUserIdError] = useState<boolean>(false);
    const [isNicknameError, setNicknameError] = useState<boolean>(false);
    const [isPasswordError, setPasswordError] = useState<boolean>(false);
    const [isPasswordCheckError, setPasswordCheckError] = useState<boolean>(false);
    const [isEmailError, setEmailError] = useState<boolean>(false);
    const [isCertificationNumberError, setCertificationNumberError] = useState<boolean>(false);
    const [isAgreedPersonalError, setAgreedPersonalError] = useState<boolean>(false);

    const [userIdMessage, setUserIdMessage] = useState<string>('');
    const [NicknameMessage, setNicknameMessage] = useState<string>('');
    const [passwordMessage, setPasswordMessage] = useState<string>('');
    const [passwordCheckMessage, setPasswordCheckMessage] = useState<string>('');
    const [EmailMessage, setEmailMessage] = useState<string>('');
    const [CertificationNumberMessage, setCertificationNumberMessage] = useState<string>('');

    const [isUserIdCheck, setUserIdCheck] = useState<boolean>(false);
    const [isNicknameCheck, setNicknameCheck] = useState<boolean>(false);
    const [isCertificationCheck, setCertificationCheck] = useState<boolean>(false);

    const signUpButtonClass = userId && password && nickname && passwordCheck && email && certificationNumber ?
        'primary-button-lg' : 'disable-button-lg';

    const emailPattern = /^[a-zA-Z0-9]*@([-.]?[a-zA-Z0-9])*\.[a-zA-Z]{2,4}$/;
    const passwordPattern = /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]{8,13}$/;

    const navigate = useNavigate();

    const userIdCheckResponse = (responseBody: ResponseBody<userIdCheckResponseDto>) => {
        if (!responseBody) return;
        const { code } = responseBody;
        if (code === ResponseCode.VALIDATION_FAIL) alert('아이디를 입력하세요.');
        if (code === ResponseCode.DUPLICATE_ID) {
            setUserIdError(true);
            setUserIdMessage('이미 사용중인 아이디 입니다.');
            setUserIdCheck(false);
        }
        if (code === ResponseCode.DATABASE_ERROR) alert('데이터베이스 오류입니다.');
        if (code !== ResponseCode.SUCCESS) return;

        setUserIdError(false);
        setUserIdMessage('사용 가능한 아이디 입니다.');
        setUserIdCheck(true);
    };

    const nicknameCheckResponse = (responseBody: ResponseBody<nicknameCheckResponseDto>) => {
        if (!responseBody) return;
        const { code } = responseBody;
        if (code === ResponseCode.VALIDATION_FAIL) alert('닉네임을 입력하세요.');
        if (code === ResponseCode.DUPLICATE_NICKNAME) {
            setNicknameError(true);
            setNicknameMessage('이미 사용중인 닉네임 입니다.');
            setNicknameCheck(false);
        }
        if (code === ResponseCode.DATABASE_ERROR) alert('데이터베이스 오류입니다.');
        if (code !== ResponseCode.SUCCESS) return;

        setNicknameError(false);
        setNicknameMessage('사용 가능한 닉네임 입니다.');
        setNicknameCheck(true);
    };


    const emailCertificationResponse = (responseBody: ResponseBody<EmailCertificationResponseDto>) => {
        if (!responseBody) return;

        const { code } = responseBody;

        if (code === ResponseCode.VALIDATION_FAIL) alert('아이디와 이메일을 모두 입력하세요.');
        if (code === ResponseCode.MAIL_FAIL || code === ResponseCode.DATABASE_ERROR) {
            setEmailError(true);
            setEmailMessage('이메일 전송에 실패했습니다.');
        }
        if (code === ResponseCode.DUPLICATE_EMAIL) 
            setEmailError(true);
            setEmailMessage('이미 사용중인 이메일 입니다.');
        if (code !== ResponseCode.SUCCESS) return;
        setEmailError(false);
        setEmailMessage('인증번호가 전송되었습니다.');
    };

    const checkCertificationResponse = (responseBody: ResponseBody<CheckCertificationResponseDto>) => {
        if (!responseBody) return;

        const { code } = responseBody;
        if (code === ResponseCode.VALIDATION_FAIL) alert('아이디, 이메일, 인증번호를 모두 입력하세요.');
        if (code === ResponseCode.CERTIFICATION_FAIL) {
            setCertificationNumberError(true);
            setCertificationNumberMessage('인증번호가 일치하지 않습니다.');
            setCertificationCheck(false);
        }
        if (code === ResponseCode.DATABASE_ERROR) alert('데이터베이스 오류입니다.');
        if (code !== ResponseCode.SUCCESS) return;

        setCertificationNumberError(false);
        setCertificationNumberMessage('인증번호가 확인되었습니다.');
        setCertificationCheck(true);
    };

    const signUpResponse = (responseBody: ResponseBody<SignUpResponseDto>) => {
        if (!responseBody) return;

        const { code } = responseBody;
        if (code === ResponseCode.VALIDATION_FAIL) alert('모든 값을 입력하세요.');

        navigate(SIGNIN_PATH());
        alert('회원가입이 완료되었습니다.');
    };

    const onIdChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        setUserId(value);
        setUserIdMessage('');
        setUserIdCheck(false);
    };

    const onNicknameChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        setNickname(value);
        setNicknameMessage('');
        setNicknameCheck(false);
    };


    const onPasswordChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        setPassword(value);
        setPasswordMessage('');
    };

    const onPasswordCheckChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        setPasswordCheck(value);
        setPasswordCheckMessage('');
    };

    const onEmailChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        setEmail(value);
        setEmailMessage('');
    };

    const onCertificationNumberChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        setCertificationNumber(value);
        setCertificationNumberMessage('');
        setCertificationCheck(false);
    };

    const onIdButtenClickHandler = () => {
        if (!userId) return;
        const requestBody: userIdCheckRequestDto = { userId };

        userIdCheckRequest(requestBody).then(userIdCheckResponse);
    };

    const onNicknameButtenClickHandler = () => {
        if (!nickname) return;
        const requestBody: nicknameCheckRequestDto = { nickname };

        nicknameCheckRequest(requestBody).then(nicknameCheckResponse);
    };

    const onEmailButtenClickHandler = () => {
        if (!userId || !email) return;

        const checkedEmail = emailPattern.test(email);

        if (!checkedEmail) {
            setEmailError(true);
            setEmailMessage('이메일 형식이 아닙니다.');
            return;
        }

        const requestBody: EmailCertificationRequestDto = { userId, email };
        emailCertificationRequest(requestBody).then(emailCertificationResponse);

        setEmailError(false);
        setEmailMessage('이메일 전송중...');
    };


    const onCertificationNumberButtenClickHandler = () => {

        if (!userId || !email || !certificationNumber) return;

        const requestBody: CheckCertificationRequestDto = { userId, email, certificationNumber };
        checkCertificationRequest(requestBody).then(checkCertificationResponse);
    };

    const onAgreedPersonalClickHandler = () => {
        setAgreenPersonal(!agreedPersonal);
        setAgreedPersonalError(false);
    }

    const onSignUpButtonClickHandler = () => {

        if (!userId || !nickname || !password || !passwordCheck || !email || !certificationNumber) return;
        if (!isUserIdCheck) {
            alert('중복 확인은 필수입니다.');
            return;
        }
        if (!isNicknameCheck) {
            alert('중복 확인은 필수입니다.');
            return;
        }
        const checkedPassword = passwordPattern.test(password);
        if (!checkedPassword) {
            setPasswordError(true);
            setPasswordMessage('영문, 숫자를 혼용하여 8 ~ 13자 입력해주세요.');
            return;
        }
        if (password !== passwordCheck) {
            setPasswordError(true);
            setPasswordMessage('비밀번호가 일치하지 않습니다.');
            return;
        }
        if (!isCertificationCheck) {
            alert('이메일 인증은 필수입니다.');
            return;
        }

        const requestBody: SignUpRequestDto = { userId, nickname, password, email, certificationNumber, agreedPersonal };
        signupRequest(requestBody).then(signUpResponse)
    };

    const onSignInButtonClickHandler = () => {
        navigate(SIGNIN_PATH());
    };

    const onSnsSignInButtonClickHandler = (type: 'kakao' | 'naver' | 'google') => {

        console.log(SNS_SIGN_IN_URL(type));
        window.location.href = SNS_SIGN_IN_URL(type);
    };


    const onIdKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== 'Enter') return;
        onIdButtenClickHandler();
    };

    const onNicknameKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== 'Enter') return;
        onNicknameButtenClickHandler();
    };

    const onPasswordKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== 'Enter') return;
        if (!passwordCheckRef.current) return;
        passwordCheckRef.current.focus();
    };

    const onPasswordCheckKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== 'Enter') return;
        if (!emailRef.current) return;
        emailRef.current.focus();
    };

    const onEmailKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== 'Enter') return;
        onEmailButtenClickHandler();
    };

    const onCertificationNumberKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== 'Enter') return;
        onCertificationNumberButtenClickHandler();
    };


    return (
        <div id='sign-up-wrapper'>
            <div className='sign-up-image'></div>
            <div className='sign-up-container'>
                <div className='sign-up-box'>
                    <div className='sign-up-title'>{'?'}</div>
                    <div className='sign-up-content-box'>
                        <div className='sign-up-content-sns-sign-in-box'>
                            <div className='sign-up-content-sns-sign-in-title'>{'sns 회원가입'}</div>
                            <div className='sign-up-content-sns-sign-in-button-box'>
                                <div className='kakao-sign-in-button' onClick={() => onSnsSignInButtonClickHandler('kakao')}></div>
                                <div className='naver-sign-in-button' onClick={() => onSnsSignInButtonClickHandler('naver')}></div>
                                <div className='google-sign-in-button' onClick={() => onSnsSignInButtonClickHandler('google')}></div>
                            </div>
                        </div>
                        <div className='sign-up-content-divider'></div>
                        <div className='sign-up-content-input-box'>
                            <InputBox ref={userIdRef} title='아이디' placeholder='아이디를 입력해주세요' type='text' value={userId} onChange={onIdChangeHandler} isErrorMessage={isUserIdError} message={userIdMessage} buttonTitle='중복 확인' onButtonClick={onIdButtenClickHandler} onKeyDown={onIdKeyDownHandler} />
                            <InputBox ref={nicknameRef} title='닉네임' placeholder='닉네임을 입력해주세요' type='text' value={nickname} onChange={onNicknameChangeHandler} isErrorMessage={isNicknameError} message={NicknameMessage} buttonTitle='중복 확인' onButtonClick={onNicknameButtenClickHandler} onKeyDown={onNicknameKeyDownHandler} />
                            <InputBox ref={passwordRef} title='비밀번호' placeholder='비밀번호를 입력해주세요' type='password' value={password} onChange={onPasswordChangeHandler} isErrorMessage={isPasswordError} message={passwordMessage} onKeyDown={onPasswordKeyDownHandler} />
                            <InputBox ref={passwordCheckRef} title='비밀번호 확인' placeholder='비밀번호를 입력해주세요' type='password' value={passwordCheck} onChange={onPasswordCheckChangeHandler} isErrorMessage={isPasswordCheckError} message={passwordCheckMessage} onKeyDown={onPasswordCheckKeyDownHandler} />
                            <InputBox ref={emailRef} title='이메일' placeholder='이메일 주소를 입력해주세요' type='text' value={email} onChange={onEmailChangeHandler} isErrorMessage={isEmailError} message={EmailMessage} buttonTitle='이메일 인증' onButtonClick={onEmailButtenClickHandler} onKeyDown={onEmailKeyDownHandler} />
                            <InputBox ref={certificationNumberRef} title='인증번호' placeholder='인증번호 4자리를 입력해주세요' type='text' value={certificationNumber} onChange={onCertificationNumberChangeHandler} isErrorMessage={isCertificationNumberError} message={CertificationNumberMessage} buttonTitle='인증 확인' onButtonClick={onCertificationNumberButtenClickHandler} onKeyDown={onCertificationNumberKeyDownHandler} />
                        </div>
                        <div className="auth-consent-box">
                            <div className="auth-check-box" onClick={onAgreedPersonalClickHandler}>
                                <div className={`icon ${agreedPersonal ? 'check-round-fill-icon' : 'check-ring-light-icon'} `}></div>
                            </div>
                            <div className={isAgreedPersonalError ? "auth-consent-title-error" : "auth-consent-title"}>{'개인정보동의'}</div>
                            <div className="auth-consent-link">{'더보기 >'}</div>
                        </div>
                        <div className='sign-up-content-button-box'>
                            <div className={signUpButtonClass + ' full-width'} onClick={onSignUpButtonClickHandler}>{'회원가입'}</div>
                            <div className='text-link-lg full-width' onClick={onSignInButtonClickHandler}>{'로그인'}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}