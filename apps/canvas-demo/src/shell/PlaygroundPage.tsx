import type {
  PlaygroundCategory,
  PlaygroundExample,
  PlaygroundExampleId,
  PlaygroundRuntimeAdapter,
} from '@repo/playground';
import { PlaygroundShell } from '@repo/playground';
import type { ReactElement } from 'react';
import type { CanvasRuntimeSeed } from '../canvas/api';
import { createCanvasRunnerHtml, VECTRA_ALLOWED_SPECIFIERS } from '../sandbox/canvas-runner-html';

/** 예제가 runtimeSeed를 제공하지 않을 때 사용하는 기본 실행 입력 */
const DEFAULT_RUNTIME_SEED: CanvasRuntimeSeed = {
  size: { width: 600, height: 400 },
  pointer: { x: 0, y: 0 },
  segment: { a: { x: 0, y: 0 }, b: { x: 100, y: 100 } },
  rect: { x: 0, y: 0, width: 600, height: 400 },
  bounds: { min: { x: 0, y: 0 }, max: { x: 600, y: 400 } },
  circle: { center: { x: 300, y: 200 }, radius: 100 },
  polygon: [],
  matrix: { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 },
};

const CANVAS_RUNTIME_ADAPTER: PlaygroundRuntimeAdapter<CanvasRuntimeSeed> = {
  allowedSpecifiers: VECTRA_ALLOWED_SPECIFIERS,
  defaultRuntimeSeed: DEFAULT_RUNTIME_SEED,
  createRunnerHtml: createCanvasRunnerHtml,
};

interface PlaygroundPageProps {
  selectedExample: PlaygroundExample<CanvasRuntimeSeed>;
  categories: readonly PlaygroundCategory[];
  examples: readonly PlaygroundExample<CanvasRuntimeSeed>[];
  onSelectExample: (id: PlaygroundExampleId) => void;
  onOpenIndex: () => void;
  onDirtyChange: (isDirty: boolean) => void;
  colorMode: 'light' | 'dark';
  onToggleColorMode: () => void;
}

/** Canvas demo playground 페이지. 공통 PlaygroundShell에 Canvas runtime adapter를 주입한다. */
export function PlaygroundPage(props: PlaygroundPageProps): ReactElement {
  return <PlaygroundShell {...props} runtimeAdapter={CANVAS_RUNTIME_ADAPTER} homeLabel="Canvas Demo" />;
}
