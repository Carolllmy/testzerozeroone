export interface AudioBook {
  coverArt: string;
  bookTitle: string;
  bookSubtitle: string;
  ratingStar: number;
  numberOfReviews: string;
  bookCashPrice: number;
  discount: string;
  author: string;
  narrator: string;
  length: string;
  releaseDate: string;
  language: string;
  publisher: string;
  category: string;
  aiSummary: string;
  aiReview: string;
  topicTags: string;
}

export interface InfoConfig {
  id: string;
  label: string;
  position: { x: number; y: number };
  isVisible: boolean;
}

export interface DraggableInfo {
  id: string;
  label: string;
  type: string;
  initialPosition: { x: number; y: number };
}