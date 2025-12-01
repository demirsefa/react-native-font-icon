import { useContext } from 'react';
import {
  FontIconContext,
  type FontIconContextType,
} from '../components/IconProvider';

export function useFontIconContext(): FontIconContextType {
  const context = useContext(FontIconContext);
  if (context === undefined) {
    throw new Error('useFontIconContext must be used within an IconProvider');
  }
  return context;
}
