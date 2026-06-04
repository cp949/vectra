import { describe, expect, it } from 'vitest';
import { PLAYGROUND_RUN_TIMEOUT_MS } from './types';
import {
  activateSandboxRunLifecycle,
  canDispatchPendingSandboxRun,
  createIdleSandboxRunLifecycle,
  invalidateSandboxRunLifecycle,
  shouldAcceptSandboxChildMessage,
  shouldKeepSandboxRunLifecycleForStatus,
} from './useSandboxRun';

describe('shell v2 타입', () => {
  it('기본 실행 타임아웃으로 5초를 사용한다', () => {
    expect(PLAYGROUND_RUN_TIMEOUT_MS).toBe(5000);
  });
});

describe('sandbox run lifecycle 상태 관리', () => {
  it('현재 실행과 다른 runId 메시지를 무시한다', () => {
    const lifecycle = activateSandboxRunLifecycle(createIdleSandboxRunLifecycle(), 'current-run');

    expect(
      shouldAcceptSandboxChildMessage(lifecycle, {
        protocol: 'vectra-playground/v1',
        kind: 'status',
        runId: 'old-run',
        status: 'completed',
      })
    ).toBe(false);
    expect(
      shouldAcceptSandboxChildMessage(lifecycle, {
        protocol: 'vectra-playground/v1',
        kind: 'diagnostic',
        runId: 'old-run',
        diagnostic: {
          source: 'runtime',
          severity: 'error',
          message: 'old diagnostic',
        },
      })
    ).toBe(false);
    expect(
      shouldAcceptSandboxChildMessage(lifecycle, {
        protocol: 'vectra-playground/v1',
        kind: 'console',
        runId: 'old-run',
        log: {
          id: 'old-log',
          method: 'log',
          data: ['old'],
          timestamp: '2026-05-23T00:00:00.000Z',
        },
      })
    ).toBe(false);
    expect(
      shouldAcceptSandboxChildMessage(lifecycle, {
        protocol: 'vectra-playground/v1',
        kind: 'status',
        runId: 'current-run',
        status: 'running',
      })
    ).toBe(true);
  });

  it('컴파일 실패로 무효화된 pending run은 late ready로 전송하지 않는다', () => {
    const lifecycle = activateSandboxRunLifecycle(createIdleSandboxRunLifecycle(), 'previous-run');
    const invalidated = invalidateSandboxRunLifecycle(lifecycle);

    expect(canDispatchPendingSandboxRun(invalidated, 'previous-run')).toBe(false);
  });

  it('타임아웃으로 무효화된 실행은 이후 completed 메시지를 무시한다', () => {
    const lifecycle = activateSandboxRunLifecycle(createIdleSandboxRunLifecycle(), 'timed-out-run');
    const timedOut = invalidateSandboxRunLifecycle(lifecycle);

    expect(
      shouldAcceptSandboxChildMessage(timedOut, {
        protocol: 'vectra-playground/v1',
        kind: 'status',
        runId: 'timed-out-run',
        status: 'completed',
      })
    ).toBe(false);
  });

  it('setup 완료 후에도 같은 runId의 console 메시지를 수락한다', () => {
    const lifecycle = activateSandboxRunLifecycle(createIdleSandboxRunLifecycle(), 'interactive-run');

    expect(
      shouldAcceptSandboxChildMessage(lifecycle, {
        protocol: 'vectra-playground/v1',
        kind: 'console',
        runId: 'interactive-run',
        log: {
          id: 'log-after-setup',
          method: 'log',
          data: ['after setup'],
          timestamp: '2026-05-23T00:00:00.000Z',
        },
      })
    ).toBe(true);
  });

  it('completed 상태는 interactive Pixi app의 후속 console 메시지를 위해 lifecycle을 유지한다', () => {
    expect(shouldKeepSandboxRunLifecycleForStatus('completed')).toBe(true);
    expect(shouldKeepSandboxRunLifecycleForStatus('disposed')).toBe(false);
  });
});
