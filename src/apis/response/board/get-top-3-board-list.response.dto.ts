import { BoardListItem } from "types/interface";
import ResponseDto from "../response.dto";

export default interface GetTop3BoardResponseDto extends ResponseDto{
    top3List: BoardListItem[];
}