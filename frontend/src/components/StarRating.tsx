import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  interactive?: boolean;
  size?: number;
  onChange?: (rating: number) => void;
  showLabel?: boolean;
}

const RATING_LABELS: Record<number, string> = {
  1: '1 - Poor',
  2: '2 - Fair',
  3: '3 - Good',
  4: '4 - Very Good',
  5: '5 - Excellent',
};

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  interactive = false,
  size = 20,
  onChange,
  showLabel = false,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const displayRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="star-rating-container" role={interactive ? "radiogroup" : "img"} aria-label={`Rating: ${rating} out of ${maxRating} stars`}>
      <div className="stars-wrapper">
        {Array.from({ length: maxRating }, (_, idx) => {
          const starValue = idx + 1;
          const isFilled = starValue <= displayRating;
          const isHovered = hoverRating !== null && starValue <= hoverRating;

          return (
            <button
              type="button"
              key={starValue}
              className={`star-btn ${interactive ? 'interactive' : 'static'} ${isFilled ? 'filled' : 'empty'} ${isHovered ? 'hovered' : ''}`}
              disabled={!interactive}
              onClick={() => interactive && onChange && onChange(starValue)}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              onMouseLeave={() => interactive && setHoverRating(null)}
              onKeyDown={(e) => {
                if (!interactive || !onChange) return;
                if (e.key === 'ArrowRight' && rating < maxRating) {
                  onChange(rating + 1);
                } else if (e.key === 'ArrowLeft' && rating > 1) {
                  onChange(rating - 1);
                }
              }}
              aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
              role={interactive ? "radio" : undefined}
              aria-checked={interactive ? rating === starValue : undefined}
            >
              <Star
                size={size}
                className="star-icon"
                fill={isFilled ? 'currentColor' : 'none'}
                strokeWidth={isFilled ? 1.5 : 1.75}
              />
            </button>
          );
        })}
      </div>
      {showLabel && (
        <span className="rating-text-label">
          {displayRating > 0 ? RATING_LABELS[displayRating] || `${displayRating} Stars` : 'Select a rating'}
        </span>
      )}
    </div>
  );
};
