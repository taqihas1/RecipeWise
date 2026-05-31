declare module 'expo-linear-gradient' {
  import * as React from 'react';
  import { ViewProps } from 'react-native';

  export interface LinearGradientProps extends ViewProps {
    colors: readonly string[];
    start?: { x: number; y: number };
    end?: { x: number; y: number };
    locations?: number[];
    children?: React.ReactNode;
  }

  export class LinearGradient extends React.Component<LinearGradientProps> {}
}
