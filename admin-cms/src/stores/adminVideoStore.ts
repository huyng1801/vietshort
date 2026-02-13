import { create } from 'zustand';
import { Video, EncodingJob } from '@/types/admin';

interface AdminVideoState {
  videos: Video[];
  currentVideo: Video | null;
  encodingJobs: EncodingJob[];
  isUploading: boolean;
  uploadProgress: number;
  setVideos: (videos: Video[]) => void;
  setCurrentVideo: (video: Video | null) => void;
  setEncodingJobs: (jobs: EncodingJob[]) => void;
  updateEncodingJob: (job: EncodingJob) => void;
  setUploading: (uploading: boolean, progress?: number) => void;
}

export const useAdminVideoStore = create<AdminVideoState>((set) => ({
  videos: [],
  currentVideo: null,
  encodingJobs: [],
  isUploading: false,
  uploadProgress: 0,

  setVideos: (videos) => set({ videos }),
  setCurrentVideo: (video) => set({ currentVideo: video }),
  setEncodingJobs: (jobs) => set({ encodingJobs: jobs }),

  updateEncodingJob: (job) =>
    set((state) => ({
      encodingJobs: state.encodingJobs.map((j) => (j.id === job.id ? job : j)),
    })),

  setUploading: (uploading, progress = 0) =>
    set({ isUploading: uploading, uploadProgress: progress }),
}));
