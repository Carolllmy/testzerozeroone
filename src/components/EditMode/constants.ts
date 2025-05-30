import type { DraggableInfo } from '../../types';

export const defaultFields = ['bookTitle', 'bookSubtitle', 'author', 'narrator', 'ratingStar'];

export const initialDraggables: DraggableInfo[] = [
  { id: 'bookTitle', label: 'Title', type: 'text', initialPosition: { x: -200, y: -150 } },
  { id: 'bookSubtitle', label: 'Subtitle', type: 'text', initialPosition: { x: 200, y: -150 } },
  { id: 'ratingStar', label: 'Rating Stars', type: 'number', initialPosition: { x: -200, y: 0 } },
  { id: 'numberOfReviews', label: 'Reviews', type: 'text', initialPosition: { x: 200, y: 0 } },
  { id: 'bookCashPrice', label: 'Price', type: 'number', initialPosition: { x: -150, y: 150 } },
  { id: 'discount', label: 'Discount', type: 'text', initialPosition: { x: 150, y: 150 } },
  { id: 'length', label: 'Length', type: 'text', initialPosition: { x: 0, y: -200 } },
  { id: 'author', label: 'Author', type: 'text', initialPosition: { x: -180, y: -120 } },
  { id: 'narrator', label: 'Narrator', type: 'text', initialPosition: { x: 180, y: -120 } },
  { id: 'releaseDate', label: 'Release Date', type: 'text', initialPosition: { x: -160, y: 80 } },
  { id: 'publisher', label: 'Publisher', type: 'text', initialPosition: { x: 160, y: 80 } },
  { id: 'category', label: 'Category', type: 'text', initialPosition: { x: 0, y: 200 } },
  { id: 'aiSummary', label: 'AI Summary', type: 'text', initialPosition: { x: -120, y: -180 } },
  { id: 'aiReview', label: 'AI Review', type: 'text', initialPosition: { x: 120, y: -180 } },
  { id: 'topicTags', label: 'Topics', type: 'text', initialPosition: { x: 0, y: 180 } }
];

export const formatValue = (id: string, value: unknown): string => {
  switch (id) {
    case 'ratingStar':
      return '★'.repeat(Math.floor(value as number));
    case 'bookCashPrice':
      return `$${value}`;
    case 'numberOfReviews':
      return `${value} reviews`;
    case 'topicTags':
      return String(value);
    default:
      return String(value);
  }
};