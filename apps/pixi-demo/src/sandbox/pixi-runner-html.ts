import { PIXI_SANDBOX_JS } from 'virtual:pixi-sandbox-js';
import { VECTRA_SANDBOX_JS } from 'virtual:vectra-sandbox-js';

export { PIXI_ALLOWED_SPECIFIERS, PIXI_RUNTIME_MODULE_SPECIFIERS } from './pixi-module-specifiers';

const PIXI_RUNNER_CSP =
  "default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; font-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'";

const PIXEL_RESIZE_RERUN_DELAY_MS = 120;

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function safeScript(source: string): string {
  return source.replace(/<\/script/gi, '<\\/script');
}

/** Pixi playground용 runner HTML 문자열을 생성한다. */
export function createPixiRunnerHtml(): string {
  const csp = escapeAttr(PIXI_RUNNER_CSP);
  const safePixiSandboxJs = safeScript(PIXI_SANDBOX_JS);
  const safeVectraSandboxJs = safeScript(VECTRA_SANDBOX_JS);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta http-equiv="Content-Security-Policy" content="${csp}" />
<style>
  html, body, #stage { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #111827; }
  canvas { display: block; }
</style>
</head>
<body>
<div id="stage"></div>
<script>
${safeVectraSandboxJs}
</script>
<script>
${safePixiSandboxJs}
</script>
<script>
(function () {
  'use strict';

  var __modules__ = window.__modules__ || {};
  var __PIXI__ = window.__PIXI__;
  __modules__['pixi.js'] = __PIXI__;
  var __currentRunId__ = 'idle';
  var __cleanup__ = null;
  var __app__ = null;
  var __resizeObserver__ = null;
  var __hostPort__ = null;
  var __consoleSeq__ = 0;
  var __lastRunMessage__ = null;
  var __resizeRerunTimer__ = null;
  var __lastStageWidth__ = 0;
  var __lastStageHeight__ = 0;
  var PIXEL_RESIZE_RERUN_DELAY_MS = ${PIXEL_RESIZE_RERUN_DELAY_MS};

  function postToHost(msg) {
    if (!__hostPort__) return;
    __hostPort__.postMessage(msg);
  }

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

  function stageSize() {
    var stage = document.getElementById('stage');
    var rect = stage ? stage.getBoundingClientRect() : { width: 720, height: 440 };
    return {
      width: Math.max(1, Math.floor(rect.width || 720)),
      height: Math.max(1, Math.floor(rect.height || 440)),
    };
  }

  function resizePixiApp(app) {
    var size = stageSize();
    app.renderer.resize(size.width, size.height);
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
    }, PIXEL_RESIZE_RERUN_DELAY_MS);
  }

  function disposeCurrent() {
    if (__resizeRerunTimer__) {
      clearTimeout(__resizeRerunTimer__);
      __resizeRerunTimer__ = null;
    }
    if (__resizeObserver__) {
      __resizeObserver__.disconnect();
      __resizeObserver__ = null;
    }
    if (typeof __cleanup__ === 'function') {
      __cleanup__();
      __cleanup__ = null;
    }
    if (__app__) {
      __app__.destroy(true, { children: true, texture: true });
      __app__ = null;
    }
    var stage = document.getElementById('stage');
    if (stage) stage.textContent = '';
  }

  function createRng(seed) {
    if (typeof seed !== 'number') return Math.random;
    var state = seed >>> 0;
    return function () {
      state = (1664525 * state + 1013904223) >>> 0;
      return state / 4294967296;
    };
  }

  async function createPixiApp(seed) {
    var stage = document.getElementById('stage');
    var initialSize = stageSize();
    var app = new __PIXI__.Application();
    await app.init({ width: initialSize.width, height: initialSize.height, background: '#111827', antialias: true });
    stage.appendChild(app.canvas);
    var observer = new ResizeObserver(function () {
      if (__app__ !== app) return;
      var size = resizePixiApp(app);
      scheduleResizeRerun(size);
    });
    observer.observe(stage);
    return { app: app, width: initialSize.width, height: initialSize.height, resizeObserver: observer };
  }

  window.addEventListener('error', function (event) {
    reportError(__currentRunId__, event.error || event.message, 'runtime');
  });

  window.addEventListener('unhandledrejection', function (event) {
    reportError(__currentRunId__, event.reason || 'Unhandled promise rejection', 'runtime');
  });

  function handleHostMessage(msg) {
    if (!msg || msg.protocol !== 'vectra-playground/v1') return;

    if (msg.kind === 'dispose') {
      __lastRunMessage__ = null;
      disposeCurrent();
      postToHost({ protocol: 'vectra-playground/v1', kind: 'status', runId: msg.runId, status: 'disposed' });
      return;
    }

    if (msg.kind !== 'run') return;

    var runId = msg.runId;
    __currentRunId__ = runId;
    __lastRunMessage__ = msg;
    var seed = msg.runtimeSeed || {};
    disposeCurrent();

    postToHost({ protocol: 'vectra-playground/v1', kind: 'status', runId: runId, status: 'running' });

    createPixiApp(seed)
      .then(function (created) {
        __app__ = created.app;
        __resizeObserver__ = created.resizeObserver;
        var currentSize = resizePixiApp(created.app);
        __lastStageWidth__ = currentSize.width;
        __lastStageHeight__ = currentSize.height;
        var __runtime = {
          PIXI: __PIXI__,
          app: created.app,
          size: currentSize,
          pointer: seed.pointer || { x: 0, y: 0 },
          segment: seed.segment || { a: { x: 0, y: 0 }, b: { x: currentSize.width, y: currentSize.height } },
          circle: seed.circle || {
            center: { x: currentSize.width / 2, y: currentSize.height / 2 },
            radius: Math.min(currentSize.width, currentSize.height) / 4,
          },
          rng: createRng(seed.randomSeed),
        };

        var AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
        var userFn = new AsyncFunction(
          '__modules__',
          '__runtime',
          msg.compiledJs + '\\nreturn typeof setup === "function" ? setup(__runtime) : undefined;'
        );

        return Promise.resolve(userFn(__modules__, __runtime));
      })
      .then(function (cleanup) {
        __cleanup__ = typeof cleanup === 'function' ? cleanup : null;
        postToHost({ protocol: 'vectra-playground/v1', kind: 'status', runId: runId, status: 'completed' });
      })
      .catch(function (err) {
        reportError(__currentRunId__, err, 'runtime');
      });
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
