import type { PlaygroundExample } from '@repo/playground';
import type { ShowcaseRuntimeSeed } from '../../pixi/api';
import source from './source.exam.ts?raw';

export const steeringSwarmExample: PlaygroundExample<ShowcaseRuntimeSeed> = {
  id: 'steering-swarm',
  title: 'Steering Swarm',
  description: 'Animated agents steer toward pointer-defined flow targets.',
  categoryId: 'creative-coding',
  source: { language: 'ts', code: source },
  imports: ['pixi.js', '@cp949/vectra/vec', '@cp949/vectra/angle'],
  runtimeSeed: { randomSeed: 20260523 },
};
