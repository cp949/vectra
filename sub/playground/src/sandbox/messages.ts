import type { PlaygroundConsoleLog } from '../console/types';
import type { PlaygroundDiagnostic } from '../diagnostics/types';

/** sandbox 런타임에 주입하는 초기 데이터 */
export type SandboxRuntimePayload = unknown;

/**
 * sandbox 런타임에서 사용 가능한 모듈 맵
 *
 * key: 모듈 specifier, value: 모듈 export 객체
 */
export type SandboxRuntimeModuleMap = Record<string, unknown>;

/** sandbox host의 보안·실행 환경 설정 */
export interface SandboxHostConfig {
  /** 실행 타임아웃 (밀리초) */
  readonly timeoutMs?: number;
  /** Content-Security-Policy 헤더 값 */
  readonly csp?: string;
  /** sandbox iframe에 허용할 모듈 specifier 목록 */
  readonly allowedModuleSpecifiers?: readonly string[];
}

// ──────────────────────────────────────────────
// host → child 메시지
// ──────────────────────────────────────────────

/** host에서 child(iframe)로 보내는 메시지 union */
export type SandboxHostMessage = SandboxRunMessage | SandboxDisposeMessage;

/** 코드 실행 요청 메시지 */
export interface SandboxRunMessage {
  readonly protocol: 'vectra-playground/v1';
  readonly kind: 'run';
  /** 실행 세션을 구별하는 고유 ID */
  readonly runId: string;
  /** 트랜스파일된 JavaScript 코드 */
  readonly compiledJs: string;
  /** 런타임에 주입할 초기 데이터 */
  readonly runtimeSeed: SandboxRuntimePayload;
  /** 코드가 사용하는 모듈 specifier 목록 */
  readonly moduleSpecifiers: readonly string[];
}

/**
 * 실행 세션 정리 요청 메시지
 *
 * `src/index.ts`에서 명시적으로 export하지 않는다 (내부 프로토콜 전용).
 */
export interface SandboxDisposeMessage {
  readonly protocol: 'vectra-playground/v1';
  readonly kind: 'dispose';
  readonly runId: string;
}

// ──────────────────────────────────────────────
// child → host 메시지
// ──────────────────────────────────────────────

/** child(iframe)에서 host로 보내는 메시지 union */
export type SandboxChildMessage =
  | SandboxReadyMessage
  | SandboxStatusMessage
  | SandboxRenderMessage
  | SandboxConsoleMessage
  | SandboxDiagnosticMessage;

/** sandbox 초기화 완료 알림 */
export interface SandboxReadyMessage {
  readonly protocol: 'vectra-playground/v1';
  readonly kind: 'ready';
}

/** 실행 세션 상태 변경 알림 */
export interface SandboxStatusMessage {
  readonly protocol: 'vectra-playground/v1';
  readonly kind: 'status';
  readonly runId: string;
  readonly status: 'running' | 'completed' | 'disposed';
}

/** 렌더링 요청 알림 (캔버스 크기 포함) */
export interface SandboxRenderMessage {
  readonly protocol: 'vectra-playground/v1';
  readonly kind: 'render';
  readonly runId: string;
  readonly width: number;
  readonly height: number;
}

/** console log 알림 */
export interface SandboxConsoleMessage {
  readonly protocol: 'vectra-playground/v1';
  readonly kind: 'console';
  readonly runId: string;
  readonly log: PlaygroundConsoleLog;
}

/** 진단 메시지 알림 */
export interface SandboxDiagnosticMessage {
  readonly protocol: 'vectra-playground/v1';
  readonly kind: 'diagnostic';
  readonly runId: string;
  readonly diagnostic: PlaygroundDiagnostic;
}
