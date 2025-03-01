declare module 'react-360-view' {
  import React from 'react';

  interface React360ViewProps {
    amount: number;
    imagePath: string;
    fileName: string;
    spinReverse?: boolean;
    autoplay?: boolean;
    loop?: boolean;
    width?: number | string;
    height?: number | string;
  }

  const React360View: React.FC<React360ViewProps>;

  export default React360View;
}
