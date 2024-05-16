import { create } from "zustand";

interface MusicStore {
    title: string;
    uploader: string;
    videoUrl: string;
    image: string;
    setTitle: (title: string) => void;
    setUploader: (uploader: string) => void;
    setVideoUrl: (videoUrl: string) => void;
    setImage: (image: string) => void;
    resetMusic: () => void;
};

const useMusicStore = create<MusicStore>(set => ({
    title: '',
    uploader: '',
    videoUrl: '',
    image: '',
    setTitle: (title) => set(state => ({ ...state, title})),
    setUploader: (uploader) => set(state => ({ ...state, uploader})),
    setVideoUrl: (videoUrl) => set(state => ({ ...state, videoUrl})),
    setImage: (image) => set(state => ({ ...state, image})),
    resetMusic: () => set(state => ({ ...state, title: '', uploader: '', url: '', image: ''}))
}));

export default useMusicStore;