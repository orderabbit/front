export default interface CommentListItem {
    id: number;
    writerId: string;
    nickname: string;
    profileImage: string | null;
    writeDatetime: string;
    content: string;
}