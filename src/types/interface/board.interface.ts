export default interface Board {
    itemNumber: number;
    title: string;
    videoUrl: string;
    content: string;
    boardImageList: string[];
    writeDatetime: string;
    writerId: string;
    writerNickname: string;
    writerProfileImage: string | null;
}