import { compileForSandbox } from '@repo/playground';
import { describe, expect, it } from 'vitest';
import packageJson from '../../../../sub/vectra/package.json' with { type: 'json' };
import bezierControlInspectorCode from '../examples/bezier-control-inspector/source.exam.ts?raw';
import { EXAMPLES } from '../examples/catalog';
import ellipseFociSumCode from '../examples/ellipse-foci-sum/source.exam.ts?raw';
import infiniteLineDiagnosticsLabCode from '../examples/infinite-line-diagnostics-lab/source.exam.ts?raw';
import orbitSegmentCode from '../examples/orbit-segment/source.exam.ts?raw';
import pathMorphCode from '../examples/path-morph/source.exam.ts?raw';
import polylinePathWalkCode from '../examples/polyline-path-walk/source.exam.ts?raw';
import rayCastCode from '../examples/ray-cast/source.exam.ts?raw';
import rayIntersectionLabCode from '../examples/ray-intersection-lab/source.exam.ts?raw';
import svgPointsRoundtripEditorCode from '../examples/svg-points-roundtrip-editor/source.exam.ts?raw';
import transformHandlesCode from '../examples/transform-handles/source.exam.ts?raw';
import vectorSteeringFieldCode from '../examples/vector-steering-field/source.exam.ts?raw';
import { createPixiRunnerHtml, PIXI_ALLOWED_SPECIFIERS, PIXI_RUNTIME_MODULE_SPECIFIERS } from './pixi-runner-html';

const VECTRA_PACKAGE_NAME = packageJson.name;

function packageExportSpecifiers(): string[] {
  return Object.keys(packageJson.exports).map((key) => {
    return key === '.' ? VECTRA_PACKAGE_NAME : `${VECTRA_PACKAGE_NAME}/${key.slice(2)}`;
  });
}

describe('pixi runner html', () => {
  it('PixiJS와 vectra 번들을 인라인하고 setup(runtime) 계약으로 실행한다', () => {
    const html = createPixiRunnerHtml();

    expect(html).toContain('window.__PIXI__');
    expect(html).toContain('window.__modules__');
    expect(html).toContain('setup(__runtime)');
    expect(html).toContain('destroy(true');
  });

  it('pixi.js namespace import를 sandbox module map에서 해석한다', () => {
    const html = createPixiRunnerHtml();

    expect(html).toContain("__modules__['pixi.js'] = __PIXI__");
  });

  it('srcdoc opaque origin 메시지를 피하기 위해 MessagePort로 host에 전달한다', () => {
    const html = createPixiRunnerHtml();

    expect(html).toContain('__hostPort__');
    expect(html).toContain("msg.kind !== 'connect'");
    expect(html).toContain('__hostPort__.postMessage(msg)');
    expect(html).not.toContain('window.parent.postMessage');
  });

  it('iframe console 호출을 host console 메시지로 전달한다', () => {
    const html = createPixiRunnerHtml();

    expect(html).toContain("kind: 'console'");
    expect(html).toContain('installConsoleForwarder');
    expect(html).toContain('sanitizeConsoleValue');
  });

  it('Pixi 예제에서 사용하는 vectra import를 허용한다', () => {
    expect(PIXI_ALLOWED_SPECIFIERS).toEqual(
      expect.arrayContaining([
        '@cp949/vectra/angle',
        '@cp949/vectra/adapter',
        '@cp949/vectra/circle',
        '@cp949/vectra/curve',
        '@cp949/vectra/infinite-line',
        '@cp949/vectra/intersects',
        '@cp949/vectra/math',
        '@cp949/vectra/path',
        '@cp949/vectra/polygon',
        '@cp949/vectra/polyline',
        '@cp949/vectra/random',
        '@cp949/vectra/segment',
        '@cp949/vectra/vec',
      ])
    );
  });

  it('예제 import가 참조하는 vectra domain barrel 키를 runtime module로 등록한다', () => {
    const specifiers = packageExportSpecifiers();

    expect(PIXI_ALLOWED_SPECIFIERS).toEqual(specifiers);
    expect(PIXI_RUNTIME_MODULE_SPECIFIERS).toEqual(specifiers);
  });

  it('orbit-segment 예제 source는 Pixi sandbox allowlist로 컴파일된다', () => {
    const result = compileForSandbox(orbitSegmentCode, { allowedSpecifiers: PIXI_ALLOWED_SPECIFIERS });

    expect(result.diagnostics).toEqual([]);
    expect(result.compiledJs).toContain('const Circles = __modules__["@cp949/vectra/circle"]');
    expect(result.compiledJs).toContain('const Intersects = __modules__["@cp949/vectra/intersects"]');
    expect(result.compiledJs).toContain('const Segments = __modules__["@cp949/vectra/segment"]');
    expect(result.compiledJs).toContain('__modules__["@cp949/vectra/circle"]');
    expect(result.compiledJs).toContain('__modules__["@cp949/vectra/intersects"]');
    expect(result.compiledJs).toContain('__modules__["@cp949/vectra/segment"]');
  });

  it('bezier-control-inspector 예제 source는 Pixi sandbox allowlist로 컴파일된다', () => {
    const result = compileForSandbox(bezierControlInspectorCode, { allowedSpecifiers: PIXI_ALLOWED_SPECIFIERS });

    expect(result.diagnostics).toEqual([]);
    expect(result.compiledJs).toContain('const Curves = __modules__["@cp949/vectra/curve"]');
    expect(result.compiledJs).toContain('__modules__["@cp949/vectra/curve"]');
  });

  it('vector-steering-field 예제 source는 Pixi sandbox allowlist로 컴파일된다', () => {
    const result = compileForSandbox(vectorSteeringFieldCode, { allowedSpecifiers: PIXI_ALLOWED_SPECIFIERS });
    expect(result.diagnostics).toEqual([]);
    expect(result.compiledJs).toContain('const Anglex = __modules__["@cp949/vectra/angle"]');
    expect(result.compiledJs).toContain('const Randomx = __modules__["@cp949/vectra/random"]');
    expect(result.compiledJs).toContain('const Vectorx = __modules__["@cp949/vectra/vec"]');
    expect(result.compiledJs).toContain('__modules__["@cp949/vectra/angle"]');
    expect(result.compiledJs).toContain('__modules__["@cp949/vectra/random"]');
    expect(result.compiledJs).toContain('__modules__["@cp949/vectra/vec"]');
  });

  it('ray-cast 예제 source는 Pixi sandbox allowlist로 컴파일된다', () => {
    const result = compileForSandbox(rayCastCode, { allowedSpecifiers: PIXI_ALLOWED_SPECIFIERS });
    expect(result.diagnostics).toEqual([]);
    expect(result.compiledJs).toContain('const Intersects = __modules__["@cp949/vectra/intersects"]');
    expect(result.compiledJs).toContain('const Rays = __modules__["@cp949/vectra/ray"]');
    expect(result.compiledJs).toContain('__modules__["@cp949/vectra/intersects"]');
    expect(result.compiledJs).toContain('__modules__["@cp949/vectra/ray"]');
  });

  it('ray-intersection-lab 예제 source는 Pixi sandbox allowlist로 컴파일된다', () => {
    const result = compileForSandbox(rayIntersectionLabCode, { allowedSpecifiers: PIXI_ALLOWED_SPECIFIERS });
    expect(result.diagnostics).toEqual([]);
    expect(result.compiledJs).toContain('const Rays = __modules__["@cp949/vectra/ray"]');
    expect(result.compiledJs).toContain('__modules__["@cp949/vectra/ray"]');
  });

  it('infinite-line-diagnostics-lab 예제 source는 Pixi sandbox allowlist로 컴파일된다', () => {
    const result = compileForSandbox(infiniteLineDiagnosticsLabCode, { allowedSpecifiers: PIXI_ALLOWED_SPECIFIERS });
    expect(result.diagnostics).toEqual([]);
    expect(result.compiledJs).toContain('const InfiniteLines = __modules__["@cp949/vectra/infinite-line"]');
    expect(result.compiledJs).toContain('__modules__["@cp949/vectra/infinite-line"]');
  });

  it('transform-handles 예제 source는 Pixi sandbox allowlist로 컴파일된다', () => {
    const result = compileForSandbox(transformHandlesCode, { allowedSpecifiers: PIXI_ALLOWED_SPECIFIERS });
    expect(result.diagnostics).toEqual([]);
    expect(result.compiledJs).toContain('const EditorGeometry = __modules__["@cp949/vectra/editor-geometry"]');
    expect(result.compiledJs).toContain('const Matrix = __modules__["@cp949/vectra/matrix"]');
    expect(result.compiledJs).toContain('__modules__["@cp949/vectra/editor-geometry"]');
    expect(result.compiledJs).toContain('__modules__["@cp949/vectra/matrix"]');
  });

  it('path-morph 예제 source는 Pixi sandbox allowlist로 컴파일된다', () => {
    const result = compileForSandbox(pathMorphCode, { allowedSpecifiers: PIXI_ALLOWED_SPECIFIERS });
    expect(result.diagnostics).toEqual([]);
    expect(result.compiledJs).toContain('const Easing = __modules__["@cp949/vectra/easing"]');
    expect(result.compiledJs).toContain('const Interpolation = __modules__["@cp949/vectra/interpolation"]');
    expect(result.compiledJs).toContain('const Paths = __modules__["@cp949/vectra/path"]');
    expect(result.compiledJs).toContain('__modules__["@cp949/vectra/path"]');
  });

  it('polyline-path-walk 예제 source는 Pixi sandbox allowlist로 컴파일된다', () => {
    const result = compileForSandbox(polylinePathWalkCode, { allowedSpecifiers: PIXI_ALLOWED_SPECIFIERS });
    expect(result.diagnostics).toEqual([]);
    expect(result.compiledJs).toContain('const Polylines = __modules__["@cp949/vectra/polyline"]');
    expect(result.compiledJs).toContain('__modules__["@cp949/vectra/polyline"]');
  });

  it('svg-points-roundtrip-editor 예제 source는 Pixi sandbox allowlist로 컴파일된다', () => {
    const result = compileForSandbox(svgPointsRoundtripEditorCode, { allowedSpecifiers: PIXI_ALLOWED_SPECIFIERS });
    expect(result.diagnostics).toEqual([]);
    expect(result.compiledJs).toContain('const Adapters = __modules__["@cp949/vectra/adapter"]');
    expect(result.compiledJs).toContain('__modules__["@cp949/vectra/adapter"]');
  });

  it('ellipse-foci-sum 예제 source는 Pixi sandbox allowlist로 컴파일된다', () => {
    const result = compileForSandbox(ellipseFociSumCode, { allowedSpecifiers: PIXI_ALLOWED_SPECIFIERS });
    expect(result.diagnostics).toEqual([]);
    expect(result.compiledJs).toContain('const Ellipses = __modules__["@cp949/vectra/ellipse"]');
    expect(result.compiledJs).toContain('__modules__["@cp949/vectra/ellipse"]');
  });

  it('등록된 모든 Pixi 예제 source는 sandbox allowlist로 컴파일된다', () => {
    for (const example of EXAMPLES) {
      const result = compileForSandbox(example.source.code, { allowedSpecifiers: PIXI_ALLOWED_SPECIFIERS });

      expect(result.diagnostics, example.id).toEqual([]);
    }
  });

  it('ResizeObserver 기반 Pixi resize 동작을 포함한다', () => {
    const html = createPixiRunnerHtml();

    expect(html).toContain('ResizeObserver');
    expect(html).toContain('resizePixiApp');
    expect(html).toContain('app.renderer.resize');
  });

  it('stage 크기 변경 후 현재 예제를 새 runtime.size로 재실행한다', () => {
    const html = createPixiRunnerHtml();

    expect(html).toContain('__lastRunMessage__');
    expect(html).toContain('scheduleResizeRerun');
    expect(html).toContain('PIXEL_RESIZE_RERUN_DELAY_MS');
  });

  it('iframe 런타임 오류를 host diagnostics로 전달한다', () => {
    const html = createPixiRunnerHtml();

    expect(html).toContain("window.addEventListener('error'");
    expect(html).toContain("window.addEventListener('unhandledrejection'");
  });
});
