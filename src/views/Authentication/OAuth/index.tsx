import React, { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate, useParams } from 'react-router-dom';

export default function OAuth() {
    const { token, expirationTime } = useParams();
    const [cookies, setCookie] = useCookies(['access_token']);
    const navigate = useNavigate();

    useEffect(() => {
        if (!token || !expirationTime) return;

        const now = new Date().getTime();
        const expires = new Date(now + Number(expirationTime) * 1000);

        setCookie('access_token', token, { expires, path: '/' });
        navigate('/');

    }, [token, expirationTime, setCookie, navigate]);

    return null;
}
