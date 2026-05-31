declare module 'expo-symbols' {
  export type SymbolWeight = 'ultralight' | 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'heavy';
  
  export interface SymbolViewProps {
    name: string;
    weight?: SymbolWeight;
    size?: number;
    color?: string;
    style?: any;
    resizeMode?: 'cover' | 'contain' | 'center';
  }
}
