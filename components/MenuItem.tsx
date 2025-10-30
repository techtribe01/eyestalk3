import React from 'react';
import type { MenuItemData, Language } from '../types';

interface MenuItemProps {
  item: MenuItemData;
  language: Language;
  isHighlighted: boolean;
  accentColor: string;
  onItemClick?: (item: MenuItemData) => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ item, language, isHighlighted, accentColor }) => {
  const Icon = item.icon;

  const cardClasses = `
    relative flex flex-col items-center justify-center p-4 text-center 
    bg-light-card-bg dark:bg-dark-card-bg 
    rounded-3xl border-2 flex-shrink-0
    w-48 h-48 md:w-52 md:h-52
    transition-all duration-200 ease-in-out transform
    hover:scale-105
    ${isHighlighted 
      ? `border-transparent ring-2` 
      : 'border-light-card-border dark:border-dark-card-border'}
  `;

  return (
    <div
      className={cardClasses}
      style={isHighlighted ? {
        boxShadow: `0 0 20px ${accentColor}, 0 0 5px ${accentColor}`,
        borderColor: accentColor,
        // FIX: Cast style object to React.CSSProperties to allow for custom CSS properties like '--tw-ring-color'.
        '--tw-ring-color': accentColor,
      } as React.CSSProperties : {}}
    >
      <Icon className={`w-12 h-12 md:w-14 md:h-14 mb-2 transition-colors duration-200 ${isHighlighted ? '' : 'text-dark-text-secondary'}`} style={isHighlighted ? {color: accentColor} : {}} />
      <h2 className="text-xl md:text-2xl font-bold text-light-text dark:text-dark-text">
        {item.name[language]}
      </h2>
      <p className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">
        {item.description[language]}
      </p>
    </div>
  );
};

export default MenuItem;
