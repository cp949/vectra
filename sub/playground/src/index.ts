import type { ReactElement } from 'react';
import { createElement } from 'react';
import { LazyMonacoCodeEditor } from './editor/LazyMonacoCodeEditor';
import type { MonacoCodeEditorProps } from './editor/MonacoCodeEditor';

export function MonacoCodeEditor(props: MonacoCodeEditorProps): ReactElement {
  return createElement(LazyMonacoCodeEditor, props);
}

// ──────────────────────────────────────────────
// console
// ──────────────────────────────────────────────
export type { ConsoleLogPanelProps } from './console/ConsoleLogPanel';
export { ConsoleLogPanel } from './console/ConsoleLogPanel';
export { createConsoleLog } from './console/create-console-log';
export type { CreateConsoleLogInput, PlaygroundConsoleLog } from './console/types';
// ──────────────────────────────────────────────
// diagnostics
// ──────────────────────────────────────────────
export type { DiagnosticSeverity, PlaygroundDiagnostic, PlaygroundDiagnosticLocation } from './diagnostics/types';
// ──────────────────────────────────────────────
// editor component
// ──────────────────────────────────────────────
export type { MonacoCodeEditorProps } from './editor/MonacoCodeEditor';
// ──────────────────────────────────────────────
// examples
// ──────────────────────────────────────────────
export { assertUniqueExampleIds, findExampleById, isExampleIdSlug } from './examples/ids';
export type {
  PlaygroundCategory,
  PlaygroundExample,
  PlaygroundExampleId,
  PlaygroundExampleSource,
  PlaygroundExampleStatus,
} from './examples/types';
// ──────────────────────────────────────────────
// sandbox utilities
// ──────────────────────────────────────────────
export type { CompileOptions, CompileResult } from './sandbox/compile';
export { compileForSandbox } from './sandbox/compile';
export type { CreateRunnerHtmlOptions } from './sandbox/create-runner-html';
export { createRunnerHtml } from './sandbox/create-runner-html';
// ──────────────────────────────────────────────
// sandbox messages (SandboxDisposeMessage는 내부 전용이므로 제외)
// ──────────────────────────────────────────────
export type {
  SandboxChildMessage,
  SandboxConsoleMessage,
  SandboxDiagnosticMessage,
  SandboxHostConfig,
  SandboxHostMessage,
  SandboxReadyMessage,
  SandboxRenderMessage,
  SandboxRunMessage,
  SandboxRuntimeModuleMap,
  SandboxRuntimePayload,
  SandboxStatusMessage,
} from './sandbox/messages';
export type { SandboxPreviewProps } from './sandbox/SandboxPreview';
// ──────────────────────────────────────────────
// sandbox component
// ──────────────────────────────────────────────
export { SandboxPreview } from './sandbox/SandboxPreview';
// ──────────────────────────────────────────────
// shell
// ──────────────────────────────────────────────
export type { ConsoleDockProps } from './shell/ConsoleDock';
export { ConsoleDock } from './shell/ConsoleDock';
export type { ExampleMenuProps, GroupedExamples } from './shell/ExampleMenu';
export { ExampleMenu, groupExamplesByCategory } from './shell/ExampleMenu';
export { PlaygroundShell } from './shell/PlaygroundShell';
export type { SplitWorkspaceProps } from './shell/SplitWorkspace';
export { SplitWorkspace } from './shell/SplitWorkspace';
export type {
  PlaygroundRuntimeAdapter,
  PlaygroundSandboxStatus,
  PlaygroundShellProps,
  SandboxRunInput,
  SandboxRunState,
} from './shell/types';
export { PLAYGROUND_RUN_TIMEOUT_MS } from './shell/types';
export type { UseSandboxRunResult } from './shell/useSandboxRun';
export { useSandboxRun } from './shell/useSandboxRun';
export type { PlaygroundColorMode } from './theme/color-mode';
export { getNextColorMode, readStoredColorMode, writeStoredColorMode } from './theme/color-mode';
