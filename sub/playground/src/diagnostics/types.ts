/** 진단 메시지의 심각도 수준 */
export type DiagnosticSeverity = 'info' | 'warning' | 'error';

/** 소스 코드 내 진단 발생 위치 */
export interface PlaygroundDiagnosticLocation {
  readonly line: number;
  readonly column: number;
}

/** playground에서 발생하는 단일 진단 항목 */
export interface PlaygroundDiagnostic {
  /** 진단 출처 — 컴파일/임포트/런타임/보안/타임아웃 */
  readonly source: 'compile' | 'import' | 'runtime' | 'security' | 'timeout';
  readonly severity: DiagnosticSeverity;
  readonly message: string;
  readonly location?: PlaygroundDiagnosticLocation;
  readonly stack?: string;
}
