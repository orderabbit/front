import React, { useState } from 'react';
import { changePasswordRequest, getUserRequest } from 'apis';
import { ResponseMessage } from 'types/enums';
import { GetUserResponseDto, PatchPasswordResponseDto } from 'apis/response/user';
import { ResponseDto } from 'apis/response';
import { MAIN_PATH } from 'constant';
import { useLoginUserStore } from 'stores';
import { useNavigate, useParams } from 'react-router-dom';
import { log } from 'console';

const ChangePasswordForm = ({ accessToken }: { accessToken: string }) => {
    const { loginUser } = useLoginUserStore();
    const [isMyPage, setMyPage] = useState<boolean>(false);
    const navigator = useNavigate();
    const { userId } = loginUser || {};
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [nickname, setNickname] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState<null | ResponseMessage | string>(null);
    const [success, setSuccess] = useState(false);
    const [isPasswordChange, setPasswordChange] = useState<boolean>(false);

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
        const isMyPage = loginUser?.userId === userId;
        setMyPage(isMyPage);
    };

    const patchPasswordResponse = (responseBody: PatchPasswordResponseDto | ResponseDto | null) => {
        if (!accessToken) return;

        if (!responseBody) return;
        const { code } = responseBody;
        if (code === 'VF') alert('비밀번호는 필수입니다.');
        if (code === 'AF') alert('인증에 실패했습니다.');
        if (code === 'DP') alert('기존 비밀번호와 중복되는 비밀번호입니다.');
        if (code === 'NU') alert('존재하지 않는 유저입니다.');
        if (code === 'DBE') alert('데이터베이스 오류입니다.');
        if (code !== 'SU') return;

        if (!userId) return;
        getUserRequest(userId, accessToken).then(getUserResponse);
        setPasswordChange(false);
    };

    const onPasswordChangeButtonClickHandler = () => {
        console.log('userId', userId);
        console.log('accessToken', accessToken);
        if (!userId) return;

        if (currentPassword && newPassword) {
            const requestBody = { userId, currentPassword, newPassword };
            console.log('requestBody', requestBody);
            console.log('accessToken', accessToken);    
            changePasswordRequest(accessToken, requestBody).then(patchPasswordResponse);
        }
    };

    return (
        <div>
            <h2>비밀번호 변경</h2>
            {success && <p>비밀번호가 성공적으로 변경되었습니다.</p>}
            {error && <p>오류: {error}</p>}
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
