import type { PlaygroundExample } from '@repo/playground';
import type { ShowcaseRuntimeSeed } from '../../pixi/api';
import source from './source.exam.ts?raw';

export const cadMeasurementBoardExample: PlaygroundExample<ShowcaseRuntimeSeed> = {
  id: 'cad-measurement-board',
  title: 'CAD Measurement Board',
  description: 'Dimensions, angle arcs, circle metrics, and model bounds.',
  categoryId: 'cad-measurement',
  source: { language: 'ts', code: source },
  imports: ['pixi.js', '@cp949/vectra/segment', '@cp949/vectra/circle', '@cp949/vectra/curve', '@cp949/vectra/bounds'],
  runtimeSeed: { randomSeed: 20260523 },
};
