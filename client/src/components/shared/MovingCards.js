import React, { useState, useEffect, memo } from 'react';

const MovingCards = () => {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Load cards from localStorage - simplified
    const loadCards = () => {
      const savedCards = JSON.parse(localStorage.getItem('adminCards') || '[]');
      const activeCards = savedCards.filter(card => card.isActive);
      setCards(activeCards);
    };

    loadCards();
    
    // Check for updates less frequently
    const interval = setInterval(loadCards, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (cards.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % cards.length);
      }, 8000); // Change card every 8 seconds

      return () => clearInterval(interval);
    }
  }, [cards.length]);

  // Simplified category config
  const getCategoryConfig = (category) => {
    const configs = {
      announcement: { gradient: 'from-blue-50 to-blue-200', icon: '📢' },
      event: { gradient: 'from-emerald-50 to-emerald-200', icon: '🎉' },
      news: { gradient: 'from-purple-50 to-purple-200', icon: '📰' },
      promotion: { gradient: 'from-orange-50 to-orange-200', icon: '🎁' },
      update: { gradient: 'from-teal-50 to-teal-200', icon: '🔄' }
    };
    return configs[category] || configs.announcement;
  };

  if (cards.length === 0) {
    return null;
  }

  const currentCard = cards[currentIndex];
  const config = getCategoryConfig(currentCard.category);

  return (
    <div className="relative w-full mb-8">
      {/* Simple Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
          Latest Updates
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          Stay informed with our latest announcements and events
        </p>
      </div>

      {/* Simple Card Container */}
      <div className="relative h-[200px] sm:h-[220px] lg:h-[260px] overflow-hidden rounded-2xl">
        <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} rounded-2xl border border-gray-200 p-6`}>
          {/* Card Content */}
          <div className="flex flex-col h-full">
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-3">{config.icon}</span>
              <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                {currentCard.category}
              </span>
            </div>
            
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 line-clamp-2">
              {currentCard.title}
            </h3>
            
            <p className="text-gray-700 text-sm sm:text-base flex-1 line-clamp-3">
              {currentCard.content}
            </p>
            
            {currentCard.actionText && currentCard.actionUrl && (
              <div className="mt-4">
                <a
                  href={currentCard.actionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-white/80 text-gray-800 rounded-lg text-sm font-medium hover:bg-white transition-colors"
                >
                  {currentCard.actionText}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Simple Pagination Dots */}
      {cards.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {cards.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-gray-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default memo(MovingCards);