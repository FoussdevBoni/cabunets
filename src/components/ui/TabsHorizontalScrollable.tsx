// src/components/ui/TabsHorizontalScrollable.tsx
import  { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface Tab {
  id: string;
  label: string;
  count?: number;
  subtitle?: string;
}

interface TabsHorizontalScrollableProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  showScrollButtons?: boolean;
}

export default function TabsHorizontalScrollable({
  tabs,
  activeTab,
  onTabChange,
  className = '',
  showScrollButtons = true
}: TabsHorizontalScrollableProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(false);

  const checkScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setShowLeftButton(container.scrollLeft > 0);
      setShowRightButton(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      );
    }
  };

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener('resize', checkScrollButtons);
    return () => window.removeEventListener('resize', checkScrollButtons);
  }, [tabs]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 200;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScrollButtons, 100);
    }
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      {showScrollButtons && showLeftButton && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 z-10 p-1 bg-white rounded-full shadow-md hover:bg-gray-50 -ml-3 border border-gray-200"
        >
          <ChevronLeft size={18} className="text-gray-600" />
        </button>
      )}

      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto scrollbar-hide gap-1 px-1 py-2 w-full"
        onScroll={checkScrollButtons}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all
              ${activeTab === tab.id
                ? 'bg-primary text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            <span className="text-sm font-medium">{tab.label}</span>
            {tab.subtitle && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-300 text-gray-700'
              }`}>
                {tab.subtitle}
              </span>
            )}
            {tab.count !== undefined && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-300 text-gray-700'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {showScrollButtons && showRightButton && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 z-10 p-1 bg-white rounded-full shadow-md hover:bg-gray-50 -mr-3 border border-gray-200"
        >
          <ChevronRight size={18} className="text-gray-600" />
        </button>
      )}
    </div>
  );
}