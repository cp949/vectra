/**
 * 기본 CSP(Content-Security-Policy) 헤더 값
 *
 * script-src와 style-src에 'unsafe-inline'만 허용하고
 * 외부 네트워크·프레임·오브젝트 등은 모두 차단한다.
 */
const DEFAULT_CSP =
  "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; font-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'";

/** `createRunnerHtml` 함수의 옵션 */
export interface CreateRunnerHtmlOptions {
  /** Content-Security-Policy 헤더 값. 미지정 시 기본 CSP를 사용한다. */
  readonly csp?: string;
  /**
   * sandbox iframe에 주입할 추가 head 내용 (스타일 태그 등).
   * 미지정 시 빈 문자열.
   */
  readonly extraHead?: string;
}

/**
 * sandbox iframe에 사용할 runner HTML 문자열을 생성한다.
 *
 * 생성된 HTML은 postMessage로 `SandboxRunMessage`를 수신하면
 * compiledJs를 동적으로 실행하고 결과를 host에 보고할 수 있는
 * 최소 shell을 포함한다.
 */
export function createRunnerHtml(options: CreateRunnerHtmlOptions = {}): string {
  const csp = options.csp ?? DEFAULT_CSP;
  const extraHead = options.extraHead ?? '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta http-equiv="Content-Security-Policy" content="${escapeAttr(csp)}" />
${extraHead}
</head>
<body>
<script>
(function () {
  'use strict';

  var __hostPort__ = null;

  /** host에 메시지를 전송하는 헬퍼 */
  function postToHost(msg) {
    if (!__hostPort__) return;
    __hostPort__.postMessage(msg);
  }

  /** 오류를 diagnostic 메시지로 변환해 host에 보고한다 */
  function reportError(runId, err, source) {
    postToHost({
      protocol: 'vectra-playground/v1',
      kind: 'diagnostic',
      runId: runId,
      diagnostic: {
        source: source || 'runtime',
        severity: 'error',
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      },
    });
  }

  function handleHostMessage(msg) {
    if (!msg || msg.protocol !== 'vectra-playground/v1') return;

    if (msg.kind === 'run') {
      var runId = msg.runId;

      postToHost({
        protocol: 'vectra-playground/v1',
        kind: 'status',
        runId: runId,
        status: 'running',
      });

      try {
        var fn = new Function(msg.compiledJs);
        fn();

        postToHost({
          protocol: 'vectra-playground/v1',
          kind: 'status',
          runId: runId,
          status: 'completed',
        });
      } catch (err) {
        reportError(runId, err, 'runtime');
      }
    }

    if (msg.kind === 'dispose') {
      postToHost({
        protocol: 'vectra-playground/v1',
        kind: 'status',
        runId: msg.runId,
        status: 'disposed',
      });
    }
  }

  window.addEventListener('message', function (event) {
    var msg = event.data;
    if (!msg || msg.protocol !== 'vectra-playground/v1' || msg.kind !== 'connect') return;
    var port = event.ports && event.ports[0];
    if (!port) return;
    __hostPort__ = port;
    __hostPort__.onmessage = function (portEvent) {
      handleHostMessage(portEvent.data);
    };
    postToHost({ protocol: 'vectra-playground/v1', kind: 'ready' });
  });
})();
</script>
</body>
</html>`;
}

/** HTML 속성 값 내 특수 문자를 이스케이프한다 */
function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}
