import { LucideIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export interface TabItem {
  icon?: LucideIcon;
  label: string;
  value: string;
}

interface HorizontalTabProps {
  onChange: (tab: TabItem['value']) => void;
  tabItems: TabItem[];
  defaultValue?: string;
  showScrollButtons?: boolean;
  className?: string;
  
}

export default function HorizontalTab({ 
  onChange, 
  tabItems, 
  defaultValue,
  showScrollButtons = true,
  className = ""
}: HorizontalTabProps) {
  const [activeTab, setActiveTab] = useState<string>(
    defaultValue || tabItems[0]?.value || ""
  );
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener('resize', checkScrollButtons);
    return () => window.removeEventListener('resize', checkScrollButtons);
  }, [tabItems]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const newScrollLeft = scrollContainerRef.current.scrollLeft + 
        (direction === 'left' ? -scrollAmount : scrollAmount);
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handleTabClick = (value: string) => {
    setActiveTab(value);
    onChange(value);
    
    // Scroll l'onglet actif en vue si nécessaire
    if (scrollContainerRef.current) {
      const activeElement = scrollContainerRef.current.querySelector(
        `[data-tab-value="${value}"]`
      ) as HTMLElement;
      
      if (activeElement) {
        const container = scrollContainerRef.current;
        const containerRect = container.getBoundingClientRect();
        const elementRect = activeElement.getBoundingClientRect();
        
        if (elementRect.left < containerRect.left) {
          // L'élément est à gauche du conteneur visible
          container.scrollTo({
            left: container.scrollLeft + (elementRect.left - containerRect.left) - 10,
            behavior: 'smooth'
          });
        } else if (elementRect.right > containerRect.right) {
          // L'élément est à droite du conteneur visible
          container.scrollTo({
            left: container.scrollLeft + (elementRect.right - containerRect.right) + 10,
            behavior: 'smooth'
          });
        }
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Boutons de scroll gauche/droite */}
      {showScrollButtons && canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-white"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
      )}

      {showScrollButtons && canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-white"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      )}

      {/* Conteneur scrollable */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScrollButtons}
        className="flex overflow-x-auto scrollbar-hide scroll-smooth pb-1"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        <div className="flex gap-1 px-1">
          {tabItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.value;
            
            return (
              <button
                key={item.value}
                data-tab-value={item.value}
                onClick={() => handleTabClick(item.value)}
                className={`
                  flex items-center gap-2 px-4 py-3 font-medium text-sm transition-all whitespace-nowrap
                  rounded-lg shrink-0
                  ${isActive 
                    ? "bg-blue-50 text-blue-600 border border-blue-200 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-transparent"
                  }
                `}
                aria-selected={isActive}
                role="tab"
              >
                {Icon && <Icon size={18} />}
                <span>{item.label}</span>
                {isActive && (
                  <div className="w-2 h-2 rounded-full bg-blue-600 ml-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Composants d'icônes pour les boutons de scroll
function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}