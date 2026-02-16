// ===== Social / Comment / Rating Types =====

export interface Comment {
  id: string;
  content: string;
  userId: string;
  videoId: string;
  parentId?: string;
  isHidden: boolean;
  isApproved?: boolean;
  isReported?: boolean;
  reportCount?: number;
  likeCount: number;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    nickname?: string;
    avatar?: string;
  };
  video: {
    id: string;
    title: string;
    slug: string;
  };
  parent?: {
    id: string;
    content: string;
    user: { firstName?: string; lastName?: string; nickname?: string };
  };
  _count?: { replies: number };
  createdAt: string;
  updatedAt: string;
}

export interface CommentStats {
  totalComments: number;
  todayComments: number;
  hiddenComments: number;
  reportedComments: number;
  total?: number;
  approved?: number;
  pending?: number;
  reported?: number;
}

export interface RatingItem {
  id: string;
  score: number;
  rating?: number;
  userId: string;
  videoId: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    nickname?: string;
    vipTier?: string;
    avatar?: string;
  };
  video: {
    id: string;
    title: string;
    slug: string;
    ratingAverage: number;
    ratingCount: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface RatingDistribution {
  score: number;
  star?: number;
  count: number;
  percentage: number;
}

export interface TopRatedVideo {
  id: string;
  title: string;
  ratingAverage?: number;
  ratingCount?: number;
}

export interface RatingStats {
  totalRatings: number;
  total?: number;
  averageScore: number;
  averageRating?: number;
  distribution: RatingDistribution[];
  topRatedVideos?: TopRatedVideo[];
}

export interface VideoSocialStats {
  id?: string;
  videoId: string;
  title: string;
  slug: string;
  poster?: string;
  viewCount?: number;
  favoriteCount: number;
  likeCount: number;
  commentCount: number;
  ratingAverage: number;
  ratingCount: number;
}

export interface SocialOverview {
  totalComments: number;
  totalRatings: number;
  totalFavorites: number;
  totalLikes: number;
  averageRating: number;
  favorites?: { total: number; today: number };
  likes?: { total: number; today: number };
  comments?: { total: number; reported: number };
  ratings?: { total: number; today: number };
}
