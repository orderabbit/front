export default interface BoardListItem {
    itemNumber: number;
    boardTitleImage: string | null;
    title: string;
    content: string;
    videoUrl: string;
    favoriteCount: number;
    commentCount: number;
    viewCount: number;
    writerNickname: string;
    writerProfileImage: string | null;
    writeDatetime: string;
}