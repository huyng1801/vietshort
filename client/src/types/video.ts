/** Shared base video fields used across list/card/search contexts */
export interface BaseVideo {
  id: string;
  title: string;
  slug?: string;
  poster?: string;
  thumbnail?: string;
  genres?: string;
  viewCount?: number;
  ratingAverage?: number;
  isSerial?: boolean;
  totalEpisodes?: number;
}

/** Video card data — extends BaseVideo with display-specific fields */
export interface VideoCardData extends BaseVideo {
  isVipOnly?: boolean;
  releaseYear?: number;
  duration?: number;
}
