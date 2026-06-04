/**
 * Canvas playground용 runner HTML 생성기.
 *
 * vectra IIFE 번들(virtual:vectra-sandbox-js)을 runner HTML에 인라인으로 삽입하여
 * window.__modules__에 vectra 모든 서브패스를 self-contained 형태로 주입한다.
 *
 * runner 구조:
 *   1. <canvas id="c"> 요소
 *   2. vectra IIFE 스크립트 (window.__modules__ 설정)
 *   3. canvasDrawApi 직렬화 (TASK-05 placeholder)
 *   4. postMessage 프로토콜 핸들러
 *      - 'ready' 전송
 *      - 'run' 수신 → draw(ctx, runtime) 실행
 *      - status/diagnostic 보고
 */
import { VECTRA_SANDBOX_JS } from 'virtual:vectra-sandbox-js';
import { canvasDrawApi } from '../canvas/draw';
import { serializeCanvasDrawApi } from '../canvas/serialize-draw-api';

export { VECTRA_ALLOWED_SPECIFIERS, VECTRA_SANDBOX_BARREL_SPECIFIERS } from './vectra-sandbox-specifiers';

// ──────────────────────────────────────────────
// CSP
// ──────────────────────────────────────────────

/** runner HTML에 사용하는 CSP 헤더 값 */
const CANVAS_RUNNER_CSP =
  "default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; font-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'";

const CANVAS_RESIZE_RERUN_DELAY_MS = 120;

// ──────────────────────────────────────────────
// HTML 생성
// ──────────────────────────────────────────────

/** HTML 속성 값 내 특수 문자를 이스케이프한다 */
function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

/**
 * Canvas playground용 runner HTML 문자열을 생성한다.
 *
 * 생성된 HTML은 `srcdoc`으로 iframe에 직접 주입되어
 * `run` 메시지 수신 시 `draw(ctx, runtime)` 함수를 실행한다.
 *
 * vectra IIFE 번들이 첫 번째 <script>로 삽입되어 window.__modules__를 설정한다.
 * 이후 runner 스크립트는 window.__modules__를 참조한다.
 */
export function createCanvasRunnerHtml(): string {
  const drawApiCode = serializeCanvasDrawApi(canvasDrawApi as unknown as Record<string, unknown>);
  const csp = escapeAttr(CANVAS_RUNNER_CSP);

  // <script> 본문에 삽입 전 </script> 태그를 이스케이프하여 HTML 파서 오작동을 방지한다
  const safeVectraSandboxJs = VECTRA_SANDBOX_JS.replace(/<\/script/gi, '<\\/script');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta http-equiv="Content-Security-Policy" content="${csp}" />
<style>
  html, body, #stage { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #1e1e1e; }
  canvas { display: block; }
</style>
</head>
<body>
<div id="stage"><canvas id="c"></canvas></div>
<script>
/* vectra IIFE 번들 — window.__modules__ 설정 */
${safeVectraSandboxJs}
</script>
<script>
(function () {
  'use strict';

  // ── vectra 모듈 레지스트리 ──────────────────
  // vectra IIFE 스크립트가 window.__modules__를 설정한다
  var __modules__ = window.__modules__ || {};

  // ── canvasDrawApi (TASK-05 placeholder) ───
  var __drawApi__ = ${drawApiCode};

  // ── MessagePort 헬퍼 ───────────────────────
  var __hostPort__ = null;

  function postToHost(msg) {
    if (!__hostPort__) return;
    __hostPort__.postMessage(msg);
  }

  // ── console forwarding ─────────────────────
  var __currentRunId__ = 'idle';
  var __consoleSeq__ = 0;
  var __lastRunMessage__ = null;
  var __resizeRerunTimer__ = null;
  var __lastStageWidth__ = 0;
  var __lastStageHeight__ = 0;
  var CANVAS_RESIZE_RERUN_DELAY_MS = ${CANVAS_RESIZE_RERUN_DELAY_MS};

  function sanitizeConsoleValue(value, depth, seen) {
    if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'undefined') return 'undefined';
    if (typeof value === 'bigint') return String(value) + 'n';
    if (typeof value === 'symbol' || typeof value === 'function') return String(value);
    if (value instanceof Error) {
      return {
        name: value.name,
        message: value.message,
        stack: value.stack,
      };
    }
    if (depth <= 0) return '[MaxDepth]';
    if (seen.indexOf(value) >= 0) return '[Circular]';

    seen.push(value);
    try {
      if (Array.isArray(value)) {
        return value.map(function (item) {
          return sanitizeConsoleValue(item, depth - 1, seen);
        });
      }

      var out = {};
      Object.keys(value).forEach(function (key) {
        out[key] = sanitizeConsoleValue(value[key], depth - 1, seen);
      });
      return out;
    } finally {
      seen.pop();
    }
  }

  function installConsoleForwarder() {
    var methods = ['log', 'debug', 'info', 'warn', 'error', 'table', 'clear', 'dir'];
    methods.forEach(function (method) {
      var nativeMethod = console[method];
      if (typeof nativeMethod !== 'function') return;

      console[method] = function () {
        nativeMethod.apply(console, arguments);

        var data = Array.prototype.map.call(arguments, function (value) {
          return sanitizeConsoleValue(value, 8, []);
        });

        postToHost({
          protocol: 'vectra-playground/v1',
          kind: 'console',
          runId: __currentRunId__,
          log: {
            id: 'console-' + Date.now() + '-' + (__consoleSeq__++),
            method: method,
            data: data,
            timestamp: new Date().toISOString(),
          },
        });
      };
    });
  }

  installConsoleForwarder();

  // ── 오류 보고 ─────────────────────────────
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

  // ── canvas 반응형 크기 조정 ────────────────
  function stageSize() {
    var stage = document.getElementById('stage');
    var rect = stage ? stage.getBoundingClientRect() : { width: 600, height: 400 };
    return {
      width: Math.max(1, Math.floor(rect.width || 600)),
      height: Math.max(1, Math.floor(rect.height || 400)),
    };
  }

  function resizeCanvas(canvas, ctx) {
    var ratio = window.devicePixelRatio || 1;
    var size = stageSize();
    var targetWidth = Math.floor(size.width * ratio);
    var targetHeight = Math.floor(size.height * ratio);
    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }
    canvas.style.width = size.width + 'px';
    canvas.style.height = size.height + 'px';
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    return size;
  }

  function scheduleResizeRerun(size) {
    if (!__lastRunMessage__) return;
    if (size.width === __lastStageWidth__ && size.height === __lastStageHeight__) return;

    __lastStageWidth__ = size.width;
    __lastStageHeight__ = size.height;

    if (__resizeRerunTimer__) {
      clearTimeout(__resizeRerunTimer__);
    }

    __resizeRerunTimer__ = setTimeout(function () {
      __resizeRerunTimer__ = null;
      if (__lastRunMessage__) handleHostMessage(__lastRunMessage__);
    }, CANVAS_RESIZE_RERUN_DELAY_MS);
  }

  // ── ResizeObserver (run마다 교체, dispose 시 정리) ─
  var __resizeObserver__ = null;

  // ── 오류 전달 ────────────────────────────
  window.addEventListener('error', function (event) {
    reportError(__currentRunId__, event.error || event.message, 'runtime');
  });

  window.addEventListener('unhandledrejection', function (event) {
    reportError(__currentRunId__, event.reason || 'Unhandled promise rejection', 'runtime');
  });

  function handleHostMessage(msg) {
    if (!msg || msg.protocol !== 'vectra-playground/v1') return;

    if (msg.kind === 'run') {
      var runId = msg.runId;
      __currentRunId__ = runId;
      __lastRunMessage__ = msg;
      var seed = msg.runtimeSeed || {};

      postToHost({
        protocol: 'vectra-playground/v1',
        kind: 'status',
        runId: runId,
        status: 'running',
      });

      try {
        // canvas 크기 설정
        var stage = document.getElementById('stage');
        var canvas = document.getElementById('c');
        if (!stage || !canvas) throw new Error('canvas stage를 찾을 수 없습니다');
        var ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('2D canvas context를 생성할 수 없습니다');
        var currentSize = resizeCanvas(canvas, ctx);
        var w = currentSize.width;
        var h = currentSize.height;
        __lastStageWidth__ = w;
        __lastStageHeight__ = h;
        if (__resizeObserver__) {
          __resizeObserver__.disconnect();
          __resizeObserver__ = null;
        }
        var resizeObserver = new ResizeObserver(function () {
          var size = resizeCanvas(canvas, ctx);
          scheduleResizeRerun(size);
        });
        resizeObserver.observe(stage);
        __resizeObserver__ = resizeObserver;

        // CanvasRuntime 구성
        var runtime = {
          size: { width: w, height: h },
          pointer: seed.pointer || { x: 0, y: 0 },
          segment: seed.segment || { a: { x: 0, y: 0 }, b: { x: 100, y: 100 } },
          rect: seed.rect || { x: 0, y: 0, width: w, height: h },
          bounds: seed.bounds || { min: { x: 0, y: 0 }, max: { x: w, y: h } },
          circle: seed.circle || { center: { x: w / 2, y: h / 2 }, radius: Math.min(w, h) / 4 },
          polygon: seed.polygon || [],
          matrix: seed.matrix || { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 },
          rng: (typeof seed.randomSeed === 'number' && __modules__['@cp949/vectra/random'] && __modules__['@cp949/vectra/random'].createRng)
            ? __modules__['@cp949/vectra/random'].createRng(seed.randomSeed)
            : Math.random,
          draw: __drawApi__,
        };

        // 사용자 코드를 AsyncFunction으로 실행
        // compiledJs에는 draw 함수 정의와 __modules__ 참조가 포함된다
        var AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
        var userFn = new AsyncFunction('__modules__', '__ctx', '__runtime',
          msg.compiledJs + '\\nreturn typeof draw === "function" ? draw(__ctx, __runtime) : undefined;'
        );

        Promise.resolve(userFn(__modules__, ctx, runtime))
          .then(function () {
            if (__currentRunId__ !== runId) return;
            postToHost({
              protocol: 'vectra-playground/v1',
              kind: 'status',
              runId: runId,
              status: 'completed',
            });
          })
          .catch(function (err) {
            if (__currentRunId__ !== runId) return;
            reportError(runId, err, 'runtime');
          });

      } catch (err) {
        reportError(runId, err, 'runtime');
      }
    }

    if (msg.kind === 'dispose') {
      __lastRunMessage__ = null;
      if (__resizeRerunTimer__) {
        clearTimeout(__resizeRerunTimer__);
        __resizeRerunTimer__ = null;
      }
      if (__resizeObserver__) {
        __resizeObserver__.disconnect();
        __resizeObserver__ = null;
      }
      postToHost({
        protocol: 'vectra-playground/v1',
        kind: 'status',
        runId: msg.runId,
        status: 'disposed',
      });
    }
  }

  // ── MessagePort 연결 수신 ──────────────────
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
