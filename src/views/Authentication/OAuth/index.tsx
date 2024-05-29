import React, { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate, useParams } from 'react-router-dom';

export default function OAuth() {



    const { token, expirationTime } = useParams();    
    const [cookies, setCookie] = useCookies(['accessToken']);
    const navigate = useNavigate();

    useEffect(() => {
        if (!token || !expirationTime) return;

        const now = new Date().getTime();
        const expires = new Date(now + Number(expirationTime) * 1000);

        setCookie('accessToken', token, { expires, path: '/' });
        navigate('/');
        alert('로그인 되었습니다.');

    }, [token, expirationTime, setCookie, navigate]);

    return null;
}
