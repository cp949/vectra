import type { ReactNode } from 'react';
import type { PlaygroundCategory, PlaygroundExample, PlaygroundExampleId } from '../examples/types';
import type { SandboxChildMessage, SandboxHostMessage } from '../sandbox/messages';
import type { PlaygroundColorMode } from '../theme/color-mode';

export const PLAYGROUND_RUN_TIMEOUT_MS = 5000;

export type PlaygroundSandboxStatus = 'idle' | 'ready' | 'running' | 'completed' | 'error' | 'timeout';

export interface PlaygroundRuntimeAdapter<RuntimeSeed> {
  readonly allowedSpecifiers: readonly string[];
  readonly defaultRuntimeSeed: RuntimeSeed;
  createRunnerHtml(): string;
}

export interface PlaygroundShellProps<RuntimeSeed> {
  readonly selectedExample: PlaygroundExample<RuntimeSeed>;
  readonly categories: readonly PlaygroundCategory[];
  readonly examples: readonly PlaygroundExample<RuntimeSeed>[];
  readonly runtimeAdapter: PlaygroundRuntimeAdapter<RuntimeSeed>;
  readonly colorMode: PlaygroundColorMode;
  readonly onToggleColorMode: () => void;
  readonly onSelectExample: (id: PlaygroundExampleId) => void;
  readonly homeLabel?: string;
  readonly onOpenIndex?: () => void;
  readonly onDirtyChange?: (isDirty: boolean) => void;
  readonly showExampleDescriptions?: boolean;
  readonly showHeaderExampleTitle?: boolean;
  readonly menuAction?: ReactNode;
  readonly renderExampleMeta?: (example: PlaygroundExample<RuntimeSeed>) => ReactNode;
}

export interface SandboxRunInput<RuntimeSeed> {
  readonly code: string;
  readonly runtimeSeed: RuntimeSeed;
}

export interface SandboxRunState<RuntimeSeed = unknown> {
  readonly srcdoc: string | undefined;
  readonly runId: string;
  readonly pendingMessage: SandboxHostMessage | undefined;
  readonly sandboxStatus: PlaygroundSandboxStatus;
  readonly handleSandboxMessage: (msg: SandboxChildMessage) => void;
  readonly runCode: (code: string, runtimeSeed: RuntimeSeed) => void;
  readonly clearConsole: () => void;
}
