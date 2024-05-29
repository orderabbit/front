import React, { useState, useEffect } from 'react';
import { patchPasswordRequest, getUserRequest } from 'apis';
import { ResponseMessage } from 'types/enums';
import { GetUserResponseDto, PatchPasswordResponseDto } from 'apis/response/user';
import { ResponseDto } from 'apis/response';
import { MAIN_PATH, USER_PATH } from 'constant';
import { useLoginUserStore } from 'stores';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import InputBox from 'components/InputBox';
import './style.css';

const ChangePasswordForm = ({ accessToken }: { accessToken: string }) => {
    const { loginUser } = useLoginUserStore();
    const navigator = useNavigate();
    const { userId } = loginUser || {};

    const [cookies, setCookie] = useCookies();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState<null | ResponseMessage | string>(null);
    const [isPasswordChange, setPasswordChange] = useState<boolean>(false);

    // const getUserResponse = (responseBody: GetUserResponseDto | ResponseDto | null) => {
    //     if (!responseBody) return;
    //     const { code } = responseBody;
    //     if (code === 'NU') {
    //         alert('존재하지 않는 유저입니다.');
    //     } else if (code === 'DBE') {
    //         alert('데이터베이스 오류입니다.');
    //     } else if (code !== 'SU') {
    //         navigator(MAIN_PATH());
    //         return;
    //     }

    //     const { userId: responseUserId, nickname, email, profileImage } = responseBody as GetUserResponseDto;
    //     setNickname(nickname);
    //     setEmail(email);
    //     setProfileImage(profileImage);
    //     const isMyPage = loginUser?.userId === responseUserId;
    //     setIsMyPage(isMyPage);
    // };

    const patchPasswordResponse = (responseBody: PatchPasswordResponseDto | ResponseDto | null) => {
        if (!cookies.accessToken || !userId) return;

        if (!responseBody) return;
        const { code } = responseBody;
        if (code === 'VF') {
            alert('비밀번호는 필수입니다.');
        } else if (code === 'AF') {
            alert('인증에 실패했습니다.');
        } else if (code === 'DP') {
            alert('기존 비밀번호와 중복되는 비밀번호입니다.');
        } else if (code === 'NU') {
            alert('존재하지 않는 유저입니다.');
        } else if (code === 'DBE') {
            alert('데이터베이스 오류입니다.');
        } else if (code !== 'SU') {
            return;
        }
        setPasswordChange(false);
        alert('비밀번호가 변경되었습니다.');
        navigator(USER_PATH(userId));
    };

    const onPasswordChangeButtonClickHandler = () => {
        if (!userId) return;

        if (currentPassword && newPassword) {
            const requestBody = { currentPassword, newPassword };
            patchPasswordRequest(userId, requestBody, cookies.accessToken).then(patchPasswordResponse);
        }
    };

    return (
        <div id='password-change-wrapper'>
            <h2>비밀번호 변경</h2>
            <div className='password-change-input-box'>
                <InputBox
                    title='현재 비밀번호'
                    type="password"
                    value={currentPassword}
                    placeholder='현재 비밀번호를 입력하세요.'
                    onChange={(e) => setCurrentPassword(e.target.value)}
                />
            </div>
            <div className='password-change-input-box'>
                <InputBox
                    title='새로운 비밀번호'
                    type="password"
                    value={newPassword}
                    placeholder='새로운 비밀번호를 입력하세요.'
                    onChange={(e) => setNewPassword(e.target.value)}
                />
            </div>
            <button className='password-change-button' type="button" onClick={onPasswordChangeButtonClickHandler}>비밀번호 변경</button>
        </div>
    );
};

export default ChangePasswordForm;
