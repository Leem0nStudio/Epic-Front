import React from 'react';

export const SpriteIcon = ({ col, row, size = 32, className = '' }: { col: number, row: number, size?: number | string, className?: string }) => (
  <div 
    className={`shrink-0 overflow-hidden ${className}`}
    style={{
      width: size,
      height: size,
      backgroundImage: `url('https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/icons/rouge_2.png')`,
      backgroundSize: '400% 400%',
      backgroundPosition: `calc(${col} * 100% / 3) calc(${row} * 100% / 3)`,
      imageRendering: 'pixelated'
    }}
  />
);
