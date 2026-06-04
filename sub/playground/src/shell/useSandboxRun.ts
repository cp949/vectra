import { useCallback, useEffect, useRef, useState } from 'react';
import type { PlaygroundConsoleLog } from '../console/types';
import type { PlaygroundDiagnostic } from '../diagnostics/types';
import { compileForSandbox } from '../sandbox/compile';
import type { SandboxChildMessage, SandboxHostMessage, SandboxStatusMessage } from '../sandbox/messages';
import { PLAYGROUND_RUN_TIMEOUT_MS, type PlaygroundRuntimeAdapter, type PlaygroundSandboxStatus } from './types';

interface PendingRun {
  readonly compiledJs: string;
  readonly specifiers: readonly string[];
  readonly runId: string;
  readonly runtimeSeed: unknown;
}

export interface UseSandboxRunResult<RuntimeSeed = unknown> {
  readonly diagnostics: readonly PlaygroundDiagnostic[];
  readonly consoleLogs: readonly PlaygroundConsoleLog[];
  readonly srcdoc: string | undefined;
  readonly runId: string;
  readonly pendingMessage: SandboxHostMessage | undefined;
  readonly sandboxStatus: PlaygroundSandboxStatus;
  readonly runCode: (code: string, runtimeSeed: RuntimeSeed) => void;
  readonly clearConsole: () => void;
  readonly handleSandboxMessage: (msg: SandboxChildMessage) => void;
}

export interface SandboxRunLifecycle {
  readonly activeRunId: string | undefined;
}

export function createIdleSandboxRunLifecycle(): SandboxRunLifecycle {
  return { activeRunId: undefined };
}

export function activateSandboxRunLifecycle(_lifecycle: SandboxRunLifecycle, runId: string): SandboxRunLifecycle {
  return { activeRunId: runId };
}

export function invalidateSandboxRunLifecycle(_lifecycle: SandboxRunLifecycle): SandboxRunLifecycle {
  return createIdleSandboxRunLifecycle();
}

export function canDispatchPendingSandboxRun(
  lifecycle: SandboxRunLifecycle,
  pendingRunId: string | undefined
): boolean {
  return pendingRunId !== undefined && lifecycle.activeRunId === pendingRunId;
}

export function shouldAcceptSandboxChildMessage(lifecycle: SandboxRunLifecycle, msg: SandboxChildMessage): boolean {
  if (msg.kind === 'ready') return true;
  return lifecycle.activeRunId === msg.runId;
}

export function shouldKeepSandboxRunLifecycleForStatus(
  status: PlaygroundSandboxStatus | SandboxStatusMessage['status']
): boolean {
  return status === 'running' || status === 'completed' || status === 'ready';
}

export function useSandboxRun<RuntimeSeed>(
  runtimeAdapter: PlaygroundRuntimeAdapter<RuntimeSeed>
): UseSandboxRunResult<RuntimeSeed> {
  const [diagnostics, setDiagnostics] = useState<readonly PlaygroundDiagnostic[]>([]);
  const [consoleLogs, setConsoleLogs] = useState<readonly PlaygroundConsoleLog[]>([]);
  const [srcdoc, setSrcdoc] = useState<string | undefined>(undefined);
  const [runId, setRunId] = useState<string>('idle');
  const [pendingMessage, setPendingMessage] = useState<SandboxHostMessage | undefined>(undefined);
  const [sandboxStatus, setSandboxStatus] = useState<PlaygroundSandboxStatus>('idle');
  const pendingRunRef = useRef<PendingRun | null>(null);
  const lifecycleRef = useRef<SandboxRunLifecycle>(createIdleSandboxRunLifecycle());
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearRunTimeout = useCallback((): void => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const clearConsole = useCallback((): void => {
    setConsoleLogs([]);
  }, []);

  const invalidateRun = useCallback((): void => {
    pendingRunRef.current = null;
    lifecycleRef.current = invalidateSandboxRunLifecycle(lifecycleRef.current);
  }, []);

  useEffect(() => {
    return clearRunTimeout;
  }, [clearRunTimeout]);

  const runCode = useCallback(
    (code: string, runtimeSeed: RuntimeSeed): void => {
      clearRunTimeout();
      invalidateRun();
      setDiagnostics([]);
      setSandboxStatus('idle');
      setPendingMessage(undefined);
      setSrcdoc(undefined);
      setRunId('idle');

      const compileResult = compileForSandbox(code, {
        allowedSpecifiers: runtimeAdapter.allowedSpecifiers,
      });

      if (compileResult.diagnostics.length > 0) {
        setDiagnostics(compileResult.diagnostics);
        return;
      }

      const nextRunId = crypto.randomUUID();
      pendingRunRef.current = {
        compiledJs: compileResult.compiledJs,
        specifiers: compileResult.specifiers,
        runId: nextRunId,
        runtimeSeed,
      };
      lifecycleRef.current = activateSandboxRunLifecycle(lifecycleRef.current, nextRunId);

      setConsoleLogs([]);
      setPendingMessage(undefined);
      setRunId(nextRunId);
      setSrcdoc(runtimeAdapter.createRunnerHtml());
      timeoutRef.current = setTimeout(() => {
        invalidateRun();
        setSandboxStatus('timeout');
        setDiagnostics((prev) => [
          ...prev,
          {
            source: 'runtime',
            severity: 'error',
            message: `실행 타임아웃: ${PLAYGROUND_RUN_TIMEOUT_MS / 1000}초 초과`,
          },
        ]);
        setSrcdoc(undefined);
        setRunId('idle');
      }, PLAYGROUND_RUN_TIMEOUT_MS);
    },
    [clearRunTimeout, invalidateRun, runtimeAdapter]
  );

  const handleSandboxMessage = useCallback(
    (msg: SandboxChildMessage): void => {
      if (msg.kind === 'ready') {
        const pendingRun = pendingRunRef.current;
        if (!pendingRun || !canDispatchPendingSandboxRun(lifecycleRef.current, pendingRun.runId)) return;
        setSandboxStatus('ready');
        setPendingMessage({
          protocol: 'vectra-playground/v1',
          kind: 'run',
          runId: pendingRun.runId,
          compiledJs: pendingRun.compiledJs,
          moduleSpecifiers: pendingRun.specifiers,
          runtimeSeed: pendingRun.runtimeSeed,
        });
        pendingRunRef.current = null;
        return;
      }

      if (!shouldAcceptSandboxChildMessage(lifecycleRef.current, msg)) return;

      if (msg.kind === 'status') {
        if (msg.status === 'completed' || msg.status === 'disposed') {
          clearRunTimeout();
        }
        if (!shouldKeepSandboxRunLifecycleForStatus(msg.status)) {
          invalidateRun();
        }
        if (msg.status === 'running' || msg.status === 'completed') {
          setSandboxStatus(msg.status);
        } else if (msg.status === 'disposed') {
          setSandboxStatus('idle');
        }
        return;
      }

      if (msg.kind === 'diagnostic') {
        clearRunTimeout();
        invalidateRun();
        setSandboxStatus('error');
        setDiagnostics((prev) => [...prev, msg.diagnostic]);
        return;
      }

      if (msg.kind === 'console') {
        setConsoleLogs((prev) => [...prev, msg.log]);
      }
    },
    [clearRunTimeout, invalidateRun]
  );

  return {
    diagnostics,
    consoleLogs,
    srcdoc,
    runId,
    pendingMessage,
    sandboxStatus,
    runCode,
    clearConsole,
    handleSandboxMessage,
  };
}
