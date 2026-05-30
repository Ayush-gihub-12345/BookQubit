// src/hooks/useRTLStyles.js
import { useRTL } from "@/contexts/RTLContext";

export const useRTLStyles = () => {
  const { isRTL, getRTLStyle, getRTLClass, getRTLSpacing } = useRTL();

  // Get direction-aware spacing
  const getSpacing = (ltrValue, rtlValue) => {
    return isRTL ? rtlValue : ltrValue;
  };

  // Get direction-aware flex direction
  const getFlexDirection = (direction = 'row') => {
    if (direction === 'row') return isRTL ? 'row-reverse' : 'row';
    if (direction === 'row-reverse') return isRTL ? 'row' : 'row-reverse';
    return direction;
  };

  // Get direction-aware text alignment
  const getTextAlign = (align = 'left') => {
    if (align === 'left') return isRTL ? 'right' : 'left';
    if (align === 'right') return isRTL ? 'left' : 'right';
    return align;
  };

  // Get direction-aware transform
  const getTransform = (transformType, value) => {
    if (!isRTL) return `${transformType}(${value})`;
    
    const transformMap = {
      'translateX': `translateX(-${value})`,
      'translate': `translate(-${value})`,
    };
    
    return transformMap[transformType] || `${transformType}(${value})`;
  };

  return {
    isRTL,
    getSpacing,
    getFlexDirection,
    getTextAlign,
    getTransform,
    getRTLStyle,
    getRTLClass,
    getRTLSpacing,
  };
};