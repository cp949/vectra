import type { PlaygroundExample } from '@repo/playground';
import type { ShowcaseRuntimeSeed } from '../../pixi/api';
import source from './source.exam.ts?raw';

export const generativeConstellationExample: PlaygroundExample<ShowcaseRuntimeSeed> = {
  id: 'generative-constellation',
  title: 'Generative Constellation',
  description: 'Seeded points connect into animated local geometry.',
  categoryId: 'creative-coding',
  source: { language: 'ts', code: source },
  imports: ['pixi.js', '@cp949/vectra/random', '@cp949/vectra/segment', '@cp949/vectra/vec'],
  runtimeSeed: { randomSeed: 20260523 },
};
