import type { Graphics as PixiGraphics, Text as PixiText, Ticker as PixiTicker } from 'pixi.js';

declare global {
  type PixiRuntime = import('../pixi/api').PixiRuntime;

  namespace PIXI {
    type Graphics = PixiGraphics;
    type Text = PixiText;
    type Ticker = PixiTicker;
  }
}

export {};
