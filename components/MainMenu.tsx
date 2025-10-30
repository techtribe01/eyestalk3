import React from 'react';
import { MENU_ITEMS, ACCENT_COLORS } from '../constants';
import MenuItem from './MenuItem';
import type { Language } from '../types';

interface MainMenuProps {
  selectedIndex: number;
  language: Language;
}

const MainMenu: React.FC<MainMenuProps> = ({ selectedIndex, language }) => {
  return (
    <div className="flex flex-row items-center justify-start md:justify-center gap-4 md:gap-6 p-4 w-full overflow-x-auto">
      {MENU_ITEMS.map((item, index) => (
        <MenuItem
          key={item.id}
          item={item}
          language={language}
          isHighlighted={selectedIndex === index}
          accentColor={ACCENT_COLORS[index % ACCENT_COLORS.length]}
        />
      ))}
    </div>
  );
};

export default MainMenu;