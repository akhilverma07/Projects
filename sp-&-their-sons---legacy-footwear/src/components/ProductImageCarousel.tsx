import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductImageCarouselProps {
  images: string[];
  name: string;
}

const ProductImageCarousel: React.FC<ProductImageCarouselProps> = ({ images, name }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => (prevIndex + newDirection + images.length) % images.length);
  };

  return (
    <div className="space-y-6">
      {/* Main Carousel Container */}
      <div className="relative aspect-square rounded-3xl overflow-hidden bg-brand-gray border border-white/5 group">
        <AnimatePresence initial={false} custom={direction}>
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
              scale: { duration: 0.4, ease: "easeOut" }
            }}
            whileHover={{ scale: 1.1 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);

              if (swipe < -swipeConfidenceThreshold) {
                paginate(1);
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1);
              }
            }}
            alt={`${name} - Image ${currentIndex + 1}`}
            className="absolute inset-0 w-full h-full object-cover cursor-grab active:cursor-grabbing"
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>

        {/* Navigation Arrows */}
        <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <button
            onClick={() => paginate(-1)}
            className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-brand-red transition-all pointer-events-auto"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => paginate(1)}
            className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-brand-red transition-all pointer-events-auto"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Dots Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > currentIndex ? 1 : -1);
                setCurrentIndex(i);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                currentIndex === i ? 'bg-brand-red w-6' : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-3 gap-4">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > currentIndex ? 1 : -1);
              setCurrentIndex(i);
            }}
            className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
              currentIndex === i ? 'border-brand-red' : 'border-transparent opacity-50 hover:opacity-100'
            }`}
          >
            <img src={img} alt={`${name} thumbnail ${i}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductImageCarousel;
