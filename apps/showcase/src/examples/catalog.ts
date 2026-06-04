import type { PlaygroundCategory, PlaygroundExample } from '@repo/playground';
import type { ShowcaseRuntimeSeed } from '../pixi/api';
import { arcDesignerExample } from './arc-designer';
import { bezierLabExample } from './bezier-lab';
import { cadMeasurementBoardExample } from './cad-measurement-board';
import { collisionPlaygroundExample } from './collision-playground';
import { generativeConstellationExample } from './generative-constellation';
import { pathMorphStageExample } from './path-morph-stage';
import { rayLightFieldExample } from './ray-light-field';
import { splineComparisonTableExample } from './spline-comparison-table';
import { steeringSwarmExample } from './steering-swarm';
import { transformHandlesStudioExample } from './transform-handles-studio';

export const CATEGORIES: PlaygroundCategory[] = [
  { id: 'game-geometry', title: 'Game Geometry', order: 0, defaultExpanded: true },
  { id: 'creative-coding', title: 'Creative Coding', order: 1, defaultExpanded: true },
  { id: 'curve-tools', title: 'Curve Tools', order: 2, defaultExpanded: true },
  { id: 'motion', title: 'Motion', order: 3, defaultExpanded: true },
  { id: 'editor-tools', title: 'Editor Tools', order: 4, defaultExpanded: true },
  { id: 'cad-measurement', title: 'CAD / Measurement', order: 5, defaultExpanded: true },
  { id: 'path-curve', title: 'Path / Curve', order: 6, defaultExpanded: true },
];

export const EXAMPLES: PlaygroundExample<ShowcaseRuntimeSeed>[] = [
  rayLightFieldExample,
  steeringSwarmExample,
  bezierLabExample,
  pathMorphStageExample,
  transformHandlesStudioExample,
  generativeConstellationExample,
  cadMeasurementBoardExample,
  arcDesignerExample,
  collisionPlaygroundExample,
  splineComparisonTableExample,
];
