import type {
  PlaygroundCategory,
  PlaygroundExample,
  PlaygroundExampleId,
  PlaygroundRuntimeAdapter,
} from '@repo/playground';
import { PlaygroundShell } from '@repo/playground';
import type { ReactElement, ReactNode } from 'react';
import type { PixiRuntimeSeed } from '../pixi/api';
import { createPixiRunnerHtml, PIXI_ALLOWED_SPECIFIERS } from '../sandbox/pixi-runner-html';

/** 예제가 runtimeSeed를 제공하지 않을 때 사용하는 기본 실행 입력 */
const DEFAULT_RUNTIME_SEED: PixiRuntimeSeed = {
  size: { width: 600, height: 400 },
  pointer: { x: 0, y: 0 },
  segment: { a: { x: 0, y: 0 }, b: { x: 100, y: 100 } },
  circle: { center: { x: 300, y: 200 }, radius: 100 },
};

const PIXI_RUNTIME_ADAPTER: PlaygroundRuntimeAdapter<PixiRuntimeSeed> = {
  allowedSpecifiers: PIXI_ALLOWED_SPECIFIERS,
  defaultRuntimeSeed: DEFAULT_RUNTIME_SEED,
  createRunnerHtml: createPixiRunnerHtml,
};

interface PlaygroundPageProps {
  selectedExample: PlaygroundExample<PixiRuntimeSeed>;
  categories: readonly PlaygroundCategory[];
  examples: readonly PlaygroundExample<PixiRuntimeSeed>[];
  onSelectExample: (id: PlaygroundExampleId) => void;
  onOpenIndex: () => void;
  onDirtyChange: (isDirty: boolean) => void;
  colorMode: 'light' | 'dark';
  onToggleColorMode: () => void;
  menuAction?: ReactNode;
  renderExampleMeta?: (example: PlaygroundExample<PixiRuntimeSeed>) => ReactNode;
}

/** Pixi demo playground 페이지. 공통 PlaygroundShell에 Pixi runtime adapter를 주입한다. */
export function PlaygroundPage(props: PlaygroundPageProps): ReactElement {
  return <PlaygroundShell {...props} runtimeAdapter={PIXI_RUNTIME_ADAPTER} />;
}
