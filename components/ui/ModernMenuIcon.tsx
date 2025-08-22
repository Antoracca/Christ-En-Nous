// components/ui/ModernMenuIcon.tsx
import React from 'react';
import { Svg, Rect, G } from 'react-native-svg';

interface ModernMenuIconProps {
  size?: number;
  color?: string;
}

const ModernMenuIcon = ({ size = 28, color = "#fff" }: ModernMenuIconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G>
        {/* Ligne supérieure - plus courte */}
        <Rect x="3" y="6" width="14" height="2" rx="1" fill={color} />
        {/* Ligne du milieu - pleine largeur */}
        <Rect x="3" y="11" width="18" height="2" rx="1" fill={color} />
        {/* Ligne inférieure - largeur moyenne */}
        <Rect x="3" y="16" width="10" height="2" rx="1" fill={color} />
      </G>
    </Svg>
  );
};

export default ModernMenuIcon;