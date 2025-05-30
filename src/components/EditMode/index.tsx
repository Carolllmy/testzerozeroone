import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import type { AudioBook, DraggableInfo } from '../../types';
import { PreviewContainer } from './PreviewContainer';
import { DraggableBubble } from './DraggableBubble';
import { defaultFields, initialDraggables, formatValue } from './constants';
import { useIsMobile } from '../../hooks/useIsMobile';

interface EditModeProps {
  book: AudioBook;
  onClose: () => void;
  onSave: (config: DraggableInfo[]) => void;
  currentConfig?: DraggableInfo[];
}

export default function EditMode({ book, onClose, onSave, currentConfig }: EditModeProps) {
  const [draggables] = useState(initialDraggables);
  const [activeContainer, setActiveContainer] = useState<string[]>(
    currentConfig ? currentConfig.map(field => field.id) : defaultFields
  );
  const [positions, setPositions] = useState<{ [key: string]: { x: number; y: number } }>({});
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [draggedOverSlot, setDraggedOverSlot] = useState<number | null>(null);
  const [isDraggingFromContainer, setIsDraggingFromContainer] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [touchDragPosition, setTouchDragPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingTouch, setIsDraggingTouch] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragPreviewRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Prevent body scroll on iOS when modal is open
  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  useEffect(() => {
    const updatePositions = () => {
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;
      
      // Get the actual center of the viewport
      const viewportCenter = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      };
      
      // Calculate positions for visible bubbles only
      const visibleBubbles = draggables.filter(d => !activeContainer.includes(d.id));
      const radius = isMobile ? 120 : 420; // Much smaller radius for mobile to keep bubbles visible
      const angleStep = (2 * Math.PI) / visibleBubbles.length;
      
      const newPositions = draggables.reduce((acc, item) => {
        const visibleIndex = visibleBubbles.findIndex(b => b.id === item.id);
        if (visibleIndex !== -1) {
          const angle = visibleIndex * angleStep - Math.PI / 2;
          // Calculate from center (0,0) since bubbles are centered with CSS transforms
          acc[item.id] = {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius
          };
        }
        return acc;
      }, {} as { [key: string]: { x: number; y: number } });
      
      setPositions(newPositions);
    };

    updatePositions();
    window.addEventListener('resize', updatePositions);
    
    return () => window.removeEventListener('resize', updatePositions);
  }, [draggables, activeContainer, isMobile]);

  const handleDragStart = (e: React.DragEvent, itemId: string, fromContainer: boolean = false) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('itemId', itemId);
    e.dataTransfer.setData('fromContainer', fromContainer.toString());
    setDraggedItem(itemId);
    setIsDraggingFromContainer(fromContainer);
    setShowPreview(true);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDraggedOverSlot(null);
    setIsDraggingFromContainer(false);
    setShowPreview(false);
    
    if (window.getSelection) {
      window.getSelection()?.removeAllRanges();
    }
    if (document.getSelection) {
      document.getSelection()?.empty();
    }
    
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    
    document.querySelectorAll('[role="button"]').forEach(el => {
      if (el instanceof HTMLElement) {
        el.blur();
      }
    });
    
    const event = new MouseEvent('mouseleave', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    
    document.querySelectorAll('.reorderable-item').forEach(el => {
      el.dispatchEvent(event);
    });
  };

  const handleDragOver = (e: React.DragEvent, slotIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverSlot(slotIndex);
  };

  const handleDragLeave = () => {
    setDraggedOverSlot(null);
  };

  const handleDrop = (e: React.DragEvent, slotIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    const itemId = e.dataTransfer.getData('itemId');
    const fromContainer = e.dataTransfer.getData('fromContainer') === 'true';
    
    if (!itemId) return;

    if (fromContainer) {
      return;
    } else {
      if (!activeContainer.includes(itemId)) {
        const newOrder = [...activeContainer];
        newOrder.splice(slotIndex, 0, itemId);
        if (newOrder.length > 5) {
          newOrder.pop();
        }
        setActiveContainer(newOrder);
      }
    }
    
    handleDragEnd();
  };

  const handleBubbleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    const itemId = e.dataTransfer.getData('itemId');
    const fromContainer = e.dataTransfer.getData('fromContainer') === 'true';
    
    if (!itemId || fromContainer || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const isInContainer = 
      e.clientX >= containerRect.left &&
      e.clientX <= containerRect.right &&
      e.clientY >= containerRect.top &&
      e.clientY <= containerRect.bottom;

    if (isInContainer && !activeContainer.includes(itemId) && activeContainer.length < 5) {
      setActiveContainer(prev => [...prev, itemId]);
    }
    
    handleDragEnd();
  };

  const handleRemoveFromContainer = (id: string) => {
    setActiveContainer(prev => prev.filter(item => item !== id));
  };

  const handleSaveConfiguration = async () => {
    setIsSaving(true);
    
    // Simulate save process
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const config = activeContainer.map(id => {
      const draggable = draggables.find(d => d.id === id);
      return draggable!;
    });
    
    setShowSuccess(true);
    
    // Call onSave and close after showing success
    setTimeout(() => {
      onSave(config);
      onClose();
    }, 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-lg z-50 overflow-hidden"
    >
      {/* Touch drag preview */}
      {isDraggingTouch && touchDragPosition && draggedItem && (
        <motion.div
          ref={dragPreviewRef}
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: touchDragPosition.x - 40,
            top: touchDragPosition.y - 20,
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.1, opacity: 0.9 }}
          transition={{ duration: 0.2 }}
        >
          <div className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-medium text-sm shadow-2xl">
            {draggables.find(d => d.id === draggedItem)?.label}
          </div>
        </motion.div>
      )}
      <motion.button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-700/50 transition-all z-50 bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 shadow-md"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <X className="text-white/90" size={22} />
      </motion.button>

      <div className={`absolute ${isMobile ? 'inset-x-0 top-16 bottom-48' : 'inset-0'} flex items-center justify-center px-4`}>
        <motion.div 
          className="flex flex-col items-center z-40"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <PreviewContainer
            ref={containerRef}
            book={book}
            activeContainer={activeContainer}
            draggables={draggables}
            formatValue={formatValue}
            onReorder={setActiveContainer}
            onRemove={handleRemoveFromContainer}
            onDrop={handleBubbleDrop}
            draggedOverSlot={draggedOverSlot}
            isDraggingFromContainer={isDraggingFromContainer}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onSlotDrop={handleDrop}
          />
          
          <motion.p 
            className="text-xs text-gray-400 mt-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeContainer.length}/5 selected
          </motion.p>
        </motion.div>
      </div>

      {/* Mobile layout - fixed at bottom */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-safe">
          <div className="bg-gray-900/95 backdrop-blur-lg rounded-t-2xl p-4 border-t border-gray-700/50 shadow-2xl max-h-44 overflow-y-auto">
            <div className="flex flex-wrap gap-2">
              <AnimatePresence mode="popLayout">
                {draggables
                  .filter(item => !activeContainer.includes(item.id))
                  .map((item, index) => {
                    const originalIndex = draggables.findIndex(d => d.id === item.id);
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ delay: index * 0.03 }}
                        className="flex-shrink-0"
                      >
                        <motion.div
                          draggable
                          onDragStart={(e) => handleDragStart(e as React.DragEvent, item.id)}
                          onDragEnd={handleDragEnd}
                          onTouchStart={(e) => {
                            e.preventDefault();
                            const touch = e.touches[0];
                            setDraggedItem(item.id);
                            setIsDraggingTouch(true);
                            setTouchDragPosition({ x: touch.clientX, y: touch.clientY });
                          }}
                          onTouchMove={(e) => {
                            e.preventDefault();
                            if (!isDraggingTouch || !draggedItem) return;
                            const touch = e.touches[0];
                            setTouchDragPosition({ x: touch.clientX, y: touch.clientY });
                            
                            // Check if over container
                            const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
                            if (elementBelow && containerRef.current) {
                              const isOverContainer = containerRef.current.contains(elementBelow);
                              if (isOverContainer) {
                                elementBelow.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                              }
                            }
                          }}
                          onTouchEnd={(e) => {
                            e.preventDefault();
                            if (!isDraggingTouch || !draggedItem) return;
                            
                            const touch = e.changedTouches[0];
                            const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
                            const containerElement = containerRef.current;
                            
                            if (containerElement && elementBelow) {
                              const isOverContainer = containerElement.contains(elementBelow) || elementBelow === containerElement;
                              if (isOverContainer && !activeContainer.includes(item.id) && activeContainer.length < 5) {
                                setActiveContainer(prev => [...prev, item.id]);
                              }
                            }
                            
                            setDraggedItem(null);
                            setIsDraggingTouch(false);
                            setTouchDragPosition(null);
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-3 py-1.5 rounded-full cursor-grab active:cursor-grabbing touch-none
                            ${draggedItem === item.id
                              ? 'bg-gradient-to-r from-indigo-600/80 to-purple-700/80 scale-110 shadow-2xl opacity-60'
                              : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border border-white/10'
                            } text-white font-medium text-xs shadow-lg`}
                        >
                          <span className="pointer-events-none select-none">{item.label}</span>
                        </motion.div>
                      </motion.div>
                    );
                  })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}

      {/* Desktop layout - circular arrangement */}
      {!isMobile && (
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
          <div className="relative w-0 h-0">
            <AnimatePresence mode="popLayout">
              {draggables
                .filter(item => !activeContainer.includes(item.id))
                .map((item, index) => {
                  // Use original index from draggables array for stable animation timing
                  const originalIndex = draggables.findIndex(d => d.id === item.id);
                  return (
                    <DraggableBubble
                      key={item.id}
                      item={item}
                      book={book}
                      position={positions[item.id] || { x: 0, y: 0 }}
                      isDragging={draggedItem === item.id}
                      showPreview={showPreview}
                      formatValue={formatValue}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      index={originalIndex}
                    />
                  );
                })}
            </AnimatePresence>
          </div>
        </div>
      )}

      <motion.button
        onClick={handleSaveConfiguration}
        disabled={isSaving}
        className={`${isMobile ? 'fixed bottom-52 right-4 px-5 py-2.5' : 'absolute bottom-8 right-8 px-7 py-3.5'} text-white rounded-lg transition-all z-50 shadow-lg hover:shadow-xl font-medium tracking-wide ${
          showSuccess 
            ? 'bg-gradient-to-r from-green-500 to-green-600' 
            : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
        } ${isSaving ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        whileHover={!isSaving ? { scale: 1.05 } : {}}
        whileTap={!isSaving ? { scale: 0.95 } : {}}
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          scale: showSuccess ? [1, 1.2, 1] : 1
        }}
        transition={{ 
          delay: 0.3, 
          type: "spring", 
          stiffness: 300,
          scale: { duration: 0.4 }
        }}
      >
        <AnimatePresence mode="wait">
          {showSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="flex items-center gap-2"
            >
              <Check size={20} />
              <span>Saved!</span>
            </motion.div>
          ) : isSaving ? (
            <motion.div
              key="saving"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <motion.div
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <span>Saving...</span>
            </motion.div>
          ) : (
            <motion.span
              key="default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Save Configuration
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}