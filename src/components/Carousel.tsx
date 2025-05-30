import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Edit } from 'lucide-react';
import type { AudioBook, DraggableInfo } from '../types';
import { books } from '../data/books';
import EditMode from './EditMode/index';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useIsMobile } from '../hooks/useIsMobile';
import { BookCoverSkeleton } from './BookCoverSkeleton';

export default function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [direction, setDirection] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const [activeInfoFields, setActiveInfoFields] = useState<DraggableInfo[]>([
    { id: 'bookTitle', label: 'Title', type: 'text', initialPosition: { x: 0, y: 0 } },
    { id: 'bookSubtitle', label: 'Subtitle', type: 'text', initialPosition: { x: 0, y: 0 } },
    { id: 'author', label: 'Author', type: 'text', initialPosition: { x: 0, y: 0 } },
    { id: 'narrator', label: 'Narrator', type: 'text', initialPosition: { x: 0, y: 0 } },
    { id: 'ratingStar', label: 'Rating Stars', type: 'number', initialPosition: { x: 0, y: 0 } }
  ]);
  
  const carouselRef = useRef<HTMLDivElement>(null);

  const visibleBooks = (isMobile ? [-1, 0, 1] : [-2, -1, 0, 1, 2]).map(offset => {
    const index = (currentIndex + offset + books.length) % books.length;
    return { ...books[index], offset };
  });

  const nextSlide = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % books.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + books.length) % books.length);
  };

  // Add swipe gesture support
  useSwipeGesture(carouselRef, {
    onSwipeLeft: nextSlide,
    onSwipeRight: prevSlide
  });

  const handleImageLoad = (bookTitle: string) => {
    setLoadedImages(prev => new Set(prev).add(bookTitle));
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleSaveConfig = (config: DraggableInfo[]) => {
    setActiveInfoFields(config);
  };

  const formatValue = (id: string, value: unknown, book?: AudioBook): React.ReactNode => {
    switch (id) {
      case 'ratingStar':
        // Always show 5 stars and add the rating number
        return (
          <span className="whitespace-nowrap">
            <span>{'★'.repeat(5)}</span>
            {book && <span className="ml-1 text-sm">{book.ratingStar}</span>}
          </span>
        );
      case 'bookCashPrice':
        return `$${value}`;
      case 'numberOfReviews':
        return `${value}`;
      case 'discount':
        return `${value}`;
      case 'topicTags':
        // Split comma-separated tags and render each as a tag
        const tags = String(value).split(',').map(tag => tag.trim());
        return (
          <div className="flex flex-wrap gap-1 justify-center">
            {tags.map((tag, index) => (
              <span 
                key={index} 
                className="px-2 py-1 bg-[#002366] text-white text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        );
      case 'author':
        return `By ${value}`;
      case 'narrator':
        return `Narrated by ${value}`;
      default:
        return String(value);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-900 text-white overflow-hidden">
      <div className="absolute top-4 right-4 z-50">
        <motion.button
          onClick={() => setIsEditMode(true)}
          className={`flex items-center gap-2 ${isMobile ? 'px-4 py-2' : 'px-5 py-2.5'} border border-white/10 bg-transparent hover:bg-white/5 rounded-lg transition-all text-white font-medium tracking-wide backdrop-blur-sm`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Edit size={isMobile ? 16 : 18} className="opacity-90" />
          <span className={isMobile ? 'text-sm' : ''}>Edit</span>
        </motion.button>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="relative flex items-center justify-center h-[80vh]">
          <motion.button
            onClick={prevSlide}
            className="absolute left-4 z-40 p-3 bg-black/50 rounded-full hover:bg-black/70 transition-colors md:opacity-70 md:hover:opacity-100"
            aria-label="Previous book"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <ChevronLeft size={24} />
          </motion.button>

          <div ref={carouselRef} className="relative w-full h-full flex items-center justify-center">
            <AnimatePresence initial={false} mode="popLayout">
              {visibleBooks.map((book) => {
                const offset = book.offset;
                const isCenter = offset === 0;
                
                return (
                  <motion.div
                    key={book.bookTitle}
                    className={`absolute ${isCenter ? 'z-30' : 'z-20'}`}
                    initial={prefersReducedMotion ? false : { 
                      scale: 0.8,
                      opacity: 0,
                      x: direction >= 0 ? 600 : -600,
                      rotateY: direction >= 0 ? 25 : -25,
                      zIndex: isCenter ? 30 : 20
                    }}
                    animate={{ 
                      scale: isCenter ? 1 : 0.85 - Math.abs(offset) * 0.08,
                      opacity: isCenter ? 1 : 0.7 - Math.abs(offset) * 0.15,
                      x: offset * (isMobile ? 180 : 280),
                      rotateY: offset * -12,
                      zIndex: isCenter ? 30 : 20,
                      filter: isCenter ? 'blur(0px)' : `blur(${Math.abs(offset) * 1.5}px)`
                    }}
                    exit={prefersReducedMotion ? {} : { 
                      scale: 0.8,
                      opacity: 0,
                      x: direction >= 0 ? -600 : 600,
                      rotateY: direction >= 0 ? -25 : 25,
                      zIndex: isCenter ? 30 : 20
                    }}
                    transition={prefersReducedMotion ? { duration: 0 } : {
                      type: "spring",
                      stiffness: 260,
                      damping: 28,
                      mass: 0.8
                    }}
                  >
                    <div className={`${isCenter ? 'w-[90vw] max-w-[400px]' : 'w-[70vw] max-w-[320px]'}`}>
                      <div className="flex flex-col items-center">
                        <div className="relative w-full aspect-square">
                          {!loadedImages.has(book.bookTitle) && (
                            <div className="absolute inset-0">
                              <BookCoverSkeleton />
                            </div>
                          )}
                          <motion.img
                            src={book.coverArt}
                            alt={book.bookTitle}
                            className="w-full h-full object-cover rounded-[32px] shadow-2xl"
                            layoutId={`image-${book.bookTitle}`}
                            onLoad={() => handleImageLoad(book.bookTitle)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: loadedImages.has(book.bookTitle) ? 1 : 0 }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                        {isCenter && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="w-full mt-4 text-center"
                          >
                            {activeInfoFields.map((field) => {
                              // Handle discount and price on their own line
                              if (field.id === 'discount') {
                                const priceField = activeInfoFields.find(f => f.id === 'bookCashPrice');
                                const hasDiscount = activeInfoFields.some(f => f.id === 'discount');
                                const isDiscountProcessed = activeInfoFields.findIndex(f => f.id === 'discount') < activeInfoFields.findIndex(f => f.id === field.id);
                                
                                if (!isDiscountProcessed) {
                                  return (
                                    <div key={field.id} className="flex items-center justify-center gap-2 mb-2">
                                      <span className="text-[#ff4b33] font-medium">
                                        {formatValue(field.id, book[field.id as keyof AudioBook], book)}
                                      </span>
                                      {priceField && (
                                        <span className="text-white font-medium">
                                          {formatValue(priceField.id, book[priceField.id as keyof AudioBook], book)}
                                        </span>
                                      )}
                                    </div>
                                  );
                                }
                                return null;
                              }
                              
                              // Skip price as it's handled with discount
                              if (field.id === 'bookCashPrice') {
                                return null;
                              }
                              
                              // Handle rating stars with reviews
                              if (field.id === 'ratingStar') {
                                const reviewsField = activeInfoFields.find(f => f.id === 'numberOfReviews');
                                return (
                                  <div key={field.id} className="flex items-center justify-center gap-2 mb-2">
                                    <span className="flex items-center">
                                      {formatValue(field.id, book[field.id as keyof AudioBook], book)}
                                    </span>
                                    {reviewsField && (
                                      <span className="ml-1 text-sm text-gray-400">
                                        {formatValue(reviewsField.id, book[reviewsField.id as keyof AudioBook], book)}
                                      </span>
                                    )}
                                  </div>
                                );
                              }
                              
                              // Skip reviews as it's handled with rating
                              if (field.id === 'numberOfReviews') {
                                return null;
                              }
                              
                              // Handle other fields
                              return (
                                <div key={field.id} className={`mb-2 ${
                                  field.id === 'bookTitle' ? 'text-2xl font-bold' : 
                                  field.id === 'bookSubtitle' ? 'text-gray-300' : 
                                  field.id === 'releaseDate' ? 'whitespace-nowrap' :
                                  'flex items-center justify-center gap-2'
                                }`}>
                                  {formatValue(field.id, book[field.id as keyof AudioBook], book)}
                                </div>
                              );
                            })}
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <motion.button
            onClick={nextSlide}
            className="absolute right-4 z-40 p-3 bg-black/50 rounded-full hover:bg-black/70 transition-colors md:opacity-70 md:hover:opacity-100"
            aria-label="Next book"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <ChevronRight size={24} />
          </motion.button>
        </div>
        
        {/* Mobile swipe indicator */}
        <div className="md:hidden absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 text-sm flex items-center gap-2">
          <ChevronLeft size={16} />
          <span>Swipe to navigate</span>
          <ChevronRight size={16} />
        </div>
      </div>

      <AnimatePresence>
        {isEditMode && (
          <EditMode
            book={books[currentIndex]}
            onClose={() => setIsEditMode(false)}
            onSave={handleSaveConfig}
            currentConfig={activeInfoFields}
          />
        )}
      </AnimatePresence>
    </div>
  );
}