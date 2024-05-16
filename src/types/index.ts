import { ResponseDto } from "apis/response";

interface ResponseDtoWithSuccess extends ResponseDto{
    success: boolean;
};

type ResponseBody <T> = T | ResponseDtoWithSuccess | null;

export type {
    ResponseBody
};
