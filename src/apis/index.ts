import axios, { AxiosResponse } from "axios";
import { CheckCertificationRequestDto, EmailCertificationRequestDto, SignInRequestDto, SignUpRequestDto, userIdCheckRequestDto } from "./request/auth";
import nicknameCheckRequestDto from "./request/auth/nickname-check.request.dto";
import { PostBoardRequestDto, PostCommentRequestDto, patchBoardRequestDto } from "./request/board";
import { ResponseDto } from "./response";
import { CheckCertificationResponseDto, EmailCertificationResponseDto, SignInResponseDto, SignUpResponseDto, userIdCheckResponseDto } from "./response/auth";
import nicknameCheckResponseDto from "./response/auth/nickname-check.response.dto";
import { DeleteBoardResponseDto, GetBoardResponseDto, GetCommentListResponseDto, GetFavoriteListResponseDto, GetLatestBoardListResponseDto, GetSearchBoardListResponseDto, GetTop3BoardResponseDto, GetUserBoardListResponseDto, IncreaseViewCountResponseDto, PatchBoardResponseDto, PostBoardResponseDto, PostCommentResponseDto, PutFavoriteResponseDto } from "./response/board";
import { GetSignInUserResponseDto, GetUserResponseDto, PatchNicknameResponseDto, PatchProfileImageResponseDto } from "./response/user";
import { GetPopularListResponseDto, GetRelationListResponseDto } from "./response/search";
import { PatchNicknameRequestDto, PatchProfileImageRequestDto } from "./request/user";
import { PostMusicRequestDto } from "./request/music";
import { DeleteMusicResponseDto, GetMusicResponseDto, PostMusicResponseDto } from "./response/music";

const responseHandler = <T>(response: AxiosResponse<any, any>) => {
    const responseBody: T = response.data;
    return responseBody;
};

const errorHandler = (error: any) => {
    if (!error.response || !error.response.data) return null;
    const responseBody: ResponseDto = error.response.data;
    return responseBody;
};

const DOMAIN = 'http://localhost:4040';
const API_DOMAIN = `${DOMAIN}/api/v1`;

const authorization = (accessToken: string) => {
    return { headers: { Authorization: `Bearer ${accessToken}` } }
};

export const SNS_SIGN_IN_URL = (type: 'kakao' | 'naver' | 'google') => `${API_DOMAIN}/auth/oauth2/${type}`;
const GET_SIGN_IN_USER_URL = () => `${API_DOMAIN}/user`;
const SIGN_IN_URL = () => `${API_DOMAIN}/auth/sign-in`;
const SIGN_UP_URL = () => `${API_DOMAIN}/auth/sign-up`;
const ID_CHECK_URL = () => `${API_DOMAIN}/auth/userId-check`;
const NICKNAME_CHECK_URL = () => `${API_DOMAIN}/auth/nickname-check`;
const EMAIL_CERTIFICATION_URL = () => `${API_DOMAIN}/auth/email-certification`;
const CHECK_CERTIFICATION_URL = () => `${API_DOMAIN}/auth/check-certification`;

const POST_MUSIC_URL = () => `${API_DOMAIN}/music`
const GET_MUSIC_URL = () => `${API_DOMAIN}/music/list`;
const POST_BOARD_URL = () => `${API_DOMAIN}/board`;
const GET_TOP_3_BOARD_LIST_URL = () => `${API_DOMAIN}/board/top-3`;
const GET_LATEST_BOARD_LIST_URL = () => `${API_DOMAIN}/board/latest-list`;
const GET_POPULAR_LIST_URL = () => `${API_DOMAIN}/search/popular-list`;

const PATCH_NICKNAME_URL = () => `${API_DOMAIN}/user/nickname`;
const PATCH_PROFILE_IMAGE_URL = () => `${API_DOMAIN}/user/profile-image`;
const DELETE_MUSIC_URL = (url: string) => `${API_DOMAIN}/music/delete/${url}`;
const GET_USER_URL = (userId: string) => `${API_DOMAIN}/user/${userId}`
const GET_USER_BOARD_LIST_URL = (userId: string) => `${API_DOMAIN}/board/user-board-list/${userId}`;
const PATCH_BOARD_URL = (itemNumber: number | string) => `${API_DOMAIN}/board/${itemNumber}`;
const GET_BOARD_URL = (itemNumber: number | string) => `${API_DOMAIN}/board/detail/${itemNumber}`;
const DELETE_BOARD_URL = (itemNumber: number | string) => `${API_DOMAIN}/board/delete/${itemNumber}`;
const POST_COMMENT_URL = (itemNumber: number | string) => `${API_DOMAIN}/board/${itemNumber}/comment`;
const PUT_FAVORITE_URL = (itemNumber: number | string) => `${API_DOMAIN}/board/${itemNumber}/favorite`;
const GET_COMMENT_LIST_URL = (itemNumber: number | string) => `${API_DOMAIN}/board/${itemNumber}/comment-list`;
const GET_FAVORITE_LIST_URL = (itemNumber: number | string) => `${API_DOMAIN}/board/${itemNumber}/favorite-list`;
const INCREASE_VIEW_COUNT_URL = (itemNumber: number | string) => `${API_DOMAIN}/board/${itemNumber}/increase-view-count`;
const GET_RELATION_LIST_URL = (searchWord: string) => `${API_DOMAIN}/search/${searchWord}/relation-list}`;
const GET_SEARCH_BOARD_LIST_URL = (searchWord: string, preSearchWord: string | null) => `${API_DOMAIN}/board/search-list/${searchWord}${preSearchWord ? '/' + preSearchWord : ''}`;

const FILE_DOMAIN = `${DOMAIN}/file`;
const FILE_UPLOAD_URL = () => `${FILE_DOMAIN}/upload`;
const multipartFormData = { headers: { 'Url-Type': 'multipart/form-data' } };

export const deleteMusicRequest = async (url: string) => {
    const result = await axios.delete(DELETE_MUSIC_URL(url))
        .then(response => {
            const responseBody: DeleteMusicResponseDto = response.data;
            return responseBody;
        })
        .catch(error => {
            if (!error.response) return null;
            const responseBody: ResponseDto = error.data;
            return responseBody;
        });
    return result;
};

export const postMusicRequest = async (requestBody: PostMusicRequestDto) => {
    const result = await axios.post(POST_MUSIC_URL(), requestBody)
        .then(response => {
            const responseBody: PostMusicResponseDto = response.data;
            return responseBody;
        })
        .catch(error => {
            if (!error.response) return null;
            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
};

export const getBoardRequest = async (itemNumber: number | string) => {
    const result = await axios.get(GET_BOARD_URL(itemNumber))
        .then(response => {
            const responseBody: GetBoardResponseDto = response.data;
            return responseBody;
        })
        .catch(error => {
            if (!error.response) return null;
            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
};

export const getLatestBoardListRequest = async () => {
    const result = await axios.get(GET_LATEST_BOARD_LIST_URL())
        .then(response => {
            const responseBody: GetLatestBoardListResponseDto = response.data;
            return responseBody;
        })
        .catch(error => {
            if (!error.response) return null;
            const ResponseBody: ResponseDto = error.response.data;
            return ResponseBody;
        });
    return result;
};

export const getTop3BoardListRequest = async () => {
    const result = await axios.get(GET_TOP_3_BOARD_LIST_URL())
        .then(response => {
            const responseBody: GetTop3BoardResponseDto = response.data;
            return responseBody;
        })
        .catch(error => {
            if (!error.response) return null;
            const ResponseBody: ResponseDto = error.response.data;
            return ResponseBody;
        });
    return result;
};

export const getSearchBoardListRequest = async (searchWord: string, preSearchWord: string | null) => {
    const result = await axios.get(GET_SEARCH_BOARD_LIST_URL(searchWord, preSearchWord))
        .then(response => {
            const responseBody: GetSearchBoardListResponseDto = response.data;
            return responseBody;
        })
        .catch(error => {
            if (!error.response) return null;
            const ResponseBody: ResponseDto = error.response.data;
            return ResponseBody;
        });
    return result;
};

export const getUserBoardListRequest = async (userId: string) => {
    const result = await axios.get(GET_USER_BOARD_LIST_URL(userId))
        .then(response => {
            const responseBody: GetUserBoardListResponseDto = response.data;
            return responseBody;
        })
        .catch(error => {
            if (!error.response) return null;
            const ResponseBody: ResponseDto = error.response.data;
            return ResponseBody;
        });
    return result;
}

export const IncreaseViewCountRequest = async (itemNumber: number | string) => {
    const result = await axios.get(INCREASE_VIEW_COUNT_URL(itemNumber))
        .then(response => {
            const responseBody: IncreaseViewCountResponseDto = response.data;
            return responseBody;
        })
        .catch(error => {
            if (!error.response) return null;
            const ResponseBody: ResponseDto = error.response.data;
            return ResponseBody;
        })
    return result;
};

export const getFavoriteListRequest = async (itemNumber: number | string) => {
    const result = await axios.get(GET_FAVORITE_LIST_URL(itemNumber))
        .then(response => {
            const responseBody: GetFavoriteListResponseDto = response.data;
            return responseBody;
        })
        .catch(error => {
            if (error.response) return null;
            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
};

export const getCommentListRequest = async (itemNumber: number | string) => {
    const result = await axios.get(GET_COMMENT_LIST_URL(itemNumber))
        .then(response => {
            const responseBody: GetCommentListResponseDto = response.data;
            return responseBody;
        })
        .catch(error => {
            if (!error.response) return null;
            const responseBody: ResponseDto = error.data;
            return responseBody;
        })
    return result;
};

export const getMusicRequest = async () => {
    const result = await axios.get(GET_MUSIC_URL())
        .then(response => {
            const responseBody: GetMusicResponseDto = response.data;
            return responseBody;
        })
        .catch(error => {
            if (!error.response) return null;
            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
};

export const getPopularListRequest = async () => {
    const result = await axios.get(GET_POPULAR_LIST_URL())
        .then(response => {
            const responseBody: GetPopularListResponseDto = response.data;
            return responseBody;
        })
        .catch(error => {
            if (!error.response) return null;
            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
};

export const getRelationListRequest = async (searchWord: string) => {
    const result = await axios.get(GET_RELATION_LIST_URL(searchWord))
        .then(response => {
            const responseBody: GetRelationListResponseDto = response.data;
            return responseBody;
        })
        .catch(error => {
            if (!error.response) return null;
            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
};

export const getUserRequest = async (userId: string, accessToken: string) => {
    const result = await axios.get(GET_USER_URL(userId), authorization(accessToken))
        .then(response => {
            const responseBody: GetUserResponseDto = response.data;
            return responseBody;
        })
        .catch(error => {
            if (!error.response) return null;
            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        });
    return result;
}

export const getSignInUserRequest = async (accessToken: string) => {
    const result = await axios.get(GET_SIGN_IN_USER_URL(), authorization(accessToken))
        .then(response => {
            const responseBody: GetSignInUserResponseDto = response.data;
            return responseBody;
        })
        .catch(error => {
            if (!error.response) return null;
            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
};

export const patchNicknameRequest = async (requestBody: PatchNicknameRequestDto, accessToken: string) => {
    const result = await axios.patch(PATCH_NICKNAME_URL(), requestBody, authorization(accessToken))
        .then(response => {
            const responseBody: PatchNicknameResponseDto = response.data;
            return responseBody;
        })
        .catch(error => {
            if (!error.response) return null;
            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
}

export const patchProfileImageRequest = async (requestBody: PatchProfileImageRequestDto, accessToken: string) => {
    const result = await axios.patch(PATCH_PROFILE_IMAGE_URL(), requestBody, authorization(accessToken))
        .then(response => {
            const responseBody: PatchProfileImageResponseDto = response.data;
            return responseBody;
        })
        .catch(error => {
            if (!error.response) return null;
            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
}

export const patchBoardRequest = async (itemNumber: number | string, requestBody: patchBoardRequestDto, accessToken: string) => {
    const result = await axios.patch(PATCH_BOARD_URL(itemNumber), requestBody, authorization(accessToken))
        .then(response => {
            const responseBody: PatchBoardResponseDto = response.data;
            return responseBody;
        })
        .catch(error => {
            if (!error.response) return null;
            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
};

export const putFavoriteRequest = async (itemNumber: number | string, accessToken: string) => {
    const result = await axios.put(PUT_FAVORITE_URL(itemNumber), {}, authorization(accessToken))
        .then(response => {
            const responseBody: PutFavoriteResponseDto = response.data;
            return responseBody;
        })
        .catch(error => {
            if (!error.response) return null;
            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
};

export const postBoardRequest = async (requestBody: PostBoardRequestDto, accessToken: string) => {
    const result = await axios.post(POST_BOARD_URL(), requestBody, authorization(accessToken))
        .then(response => {
            const responseBody: PostBoardResponseDto = response.data;
            return responseBody;
        })
        .catch(error => {
            if (!error.response) return null;
            const responseBody: ResponseDto = error.response.data;
            return responseBody;
        })
    return result;
};

export const postCommentRequest = async (itemNumber: number | string, requestBody: PostCommentRequestDto, accessToken: string) => {
    const result = await axios.post(POST_COMMENT_URL(itemNumber), requestBody, authorization(accessToken))
        .then(response => {
            const responseBody: PostCommentResponseDto = response.data;
            return responseBody;
        })
        .catch(error => {
            return null;
        })
    return result;
};

export const fileUploadRequest = async (data: FormData) => {
    const result = await axios.post(FILE_UPLOAD_URL(), data, multipartFormData)
        .then(response => {
            const responseBody: string = response.data;
            return responseBody;
        })
        .catch(error => {
            return null;
        })
    return result;
};

export const deleteBoardRequest = async (itemNumber: number | string, accessToken: string) => {
    const result = await axios.delete(DELETE_BOARD_URL(itemNumber), authorization(accessToken))
        .then(response => {
            const responseBody: DeleteBoardResponseDto = response.data;
            return responseBody;
        })
        .catch(error => {
            if (!error.response) return null;
            const responseBody: ResponseDto = error.data;
            return responseBody;
        });
    return result;
};

export const SnsSignInRequest = async (requestBody: SignInRequestDto, type: 'kakao' | 'naver' | 'google') => {
    const result = await axios.post(SNS_SIGN_IN_URL(type), requestBody)
        .then(responseHandler<SignInRequestDto>)
        .catch(errorHandler);
    return result;
};

export const signInRequest = async (requestBody: SignInRequestDto) => {
    const result = await axios.post(SIGN_IN_URL(), requestBody)
        .then(responseHandler<SignInResponseDto>)
        .catch(errorHandler);
    return result;
};

export const signupRequest = async (requestBody: SignUpRequestDto) => {
    const result = await axios.post(SIGN_UP_URL(), requestBody)
        .then(responseHandler<SignUpResponseDto>)
        .catch(errorHandler);
    return result;
};

export const userIdCheckRequest = async (requestBody: userIdCheckRequestDto) => {
    const result = await axios.post(ID_CHECK_URL(), requestBody)
        .then(responseHandler<userIdCheckResponseDto>)
        .catch(errorHandler);
    return result;
};

export const nicknameCheckRequest = async (requestBody: nicknameCheckRequestDto) => {
    const result = await axios.post(NICKNAME_CHECK_URL(), requestBody)
        .then(responseHandler<nicknameCheckResponseDto>)
        .catch(errorHandler);
    return result;
};

export const emailCertificationRequest = async (requestBody: EmailCertificationRequestDto) => {
    const result = await axios.post(EMAIL_CERTIFICATION_URL(), requestBody)
        .then(responseHandler<EmailCertificationResponseDto>)
        .catch(errorHandler);
    return result;
};

export const checkCertificationRequest = async (requestBody: CheckCertificationRequestDto) => {
    const result = await axios.post(CHECK_CERTIFICATION_URL(), requestBody)
        .then(responseHandler<CheckCertificationResponseDto>)
        .catch(errorHandler);
    return result;
};