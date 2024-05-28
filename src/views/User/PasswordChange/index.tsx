import React, { useState, useEffect } from 'react';
import { patchPasswordRequest, getUserRequest } from 'apis';
import { ResponseMessage } from 'types/enums';
import { GetUserResponseDto, PatchPasswordResponseDto } from 'apis/response/user';
import { ResponseDto } from 'apis/response';
import { MAIN_PATH, USER_PATH } from 'constant';
import { useLoginUserStore } from 'stores';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';

const ChangePasswordForm = ({ accessToken }: { accessToken: string }) => {
    const { loginUser } = useLoginUserStore();
    const navigator = useNavigate();
    const { userId } = loginUser || {};

    const [cookies, setCookie] = useCookies();
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [nickname, setNickname] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState<null | ResponseMessage | string>(null);
    const [success, setSuccess] = useState(false);
    const [isPasswordChange, setPasswordChange] = useState<boolean>(false);
    const [isMyPage, setIsMyPage] = useState<boolean>(false);

    useEffect(() => {
        if (userId && cookies.accessToken) {
            getUserRequest(userId, accessToken).then(getUserResponse);
        }
    }, [userId, accessToken]);

    const getUserResponse = (responseBody: GetUserResponseDto | ResponseDto | null) => {
        if (!responseBody) return;
        const { code } = responseBody;
        if (code === 'NU') {
            alert('존재하지 않는 유저입니다.');
        } else if (code === 'DBE') {
            alert('데이터베이스 오류입니다.');
        } else if (code !== 'SU') {
            navigator(MAIN_PATH());
            return;
        }

        const { userId: responseUserId, nickname, email, profileImage } = responseBody as GetUserResponseDto;
        setNickname(nickname);
        setEmail(email);
        setProfileImage(profileImage);
        const isMyPage = loginUser?.userId === responseUserId;
        setIsMyPage(isMyPage);
    };

    const patchPasswordResponse = (responseBody: PatchPasswordResponseDto | ResponseDto | null) => {
        if (!cookies.accessToken) return;

        if (!userId) return;
        getUserRequest(userId, cookies.accessToken).then(getUserResponse);

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
        setSuccess(true);
        setPasswordChange(false);
        alert('비밀번호가 성공적으로 변경되었습니다.');
        navigator(USER_PATH(userId));
        
    };

    const onPasswordChangeButtonClickHandler = () => {
        if (!userId) return;

        if (currentPassword && newPassword) {
            const requestBody = { currentPassword, newPassword };
            patchPasswordRequest(userId, cookies.accessToken, requestBody).then(patchPasswordResponse);
        }
    };

    return (
        <div>
            <h2>비밀번호 변경</h2>
            <div>
                <label>현재 비밀번호:</label>
                <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>새로운 비밀번호:</label>
                <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />
            </div>
            <button type="button" onClick={onPasswordChangeButtonClickHandler}>비밀번호 변경</button>
        </div>
    );
};

export default ChangePasswordForm;
