import { create } from "zustand";

interface BoardStore {
    title: string;
    content: string;
    videoUrl: string;
    boardImageFileList: File[];
    setTitle: (title: string) => void;
    setContent: (content: string) => void;
    setVideoUrl: (videoUrl: string) => void;
    setBoardImageFileList: (boardImageFileList: File[]) => void;
    resetBoard: () => void;
};

const useBoardStore = create<BoardStore>(set => ({
    title: '',
    content: '',
    videoUrl: '',
    boardImageFileList: [],
    setTitle: (title) => set(state => ({ ...state, title})),
    setContent: (content) => set(state => ({ ...state, content})),
    setVideoUrl: (videoUrl) => set(state => ({ ...state, videoUrl})),
    setBoardImageFileList: (boardImageFileList) => set(state => ({ ...state, boardImageFileList})),
    resetBoard: () => set(state => ({ ...state, title: '', content: '',  videoUrl: '', boardImageFileList: []}))
}));

export default useBoardStore;