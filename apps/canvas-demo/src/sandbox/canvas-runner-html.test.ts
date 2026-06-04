import { describe, expect, it } from 'vitest';
import packageJson from '../../../../sub/vectra/package.json' with { type: 'json' };
import {
  createCanvasRunnerHtml,
  VECTRA_ALLOWED_SPECIFIERS,
  VECTRA_SANDBOX_BARREL_SPECIFIERS,
} from './canvas-runner-html';

const VECTRA_PACKAGE_NAME = packageJson.name;

function packageExportSpecifiers(): string[] {
  return Object.keys(packageJson.exports).map((key) => {
    return key === '.' ? VECTRA_PACKAGE_NAME : `${VECTRA_PACKAGE_NAME}/${key.slice(2)}`;
  });
}

function resolveBarrelSpecifier(specifier: string): string {
  const prefix = '@cp949/vectra/';
  if (!specifier.startsWith(prefix)) {
    return specifier;
  }

  const parts = specifier.slice(prefix.length).split('/');
  if (parts.length >= 2) {
    return `@cp949/vectra/${parts[0]}`;
  }
  return specifier;
}

describe('createCanvasRunnerHtml', () => {
  it('사용자 코드를 AsyncFunction으로 실행할 수 있도록 CSP에서 eval을 허용한다', () => {
    const html = createCanvasRunnerHtml();

    expect(html).toContain("script-src 'unsafe-inline' 'unsafe-eval'");
  });

  it('iframe console 호출을 host console 메시지로 전달한다', () => {
    const html = createCanvasRunnerHtml();

    expect(html).toContain("kind: 'console'");
    expect(html).toContain('installConsoleForwarder');
    expect(html).toContain('sanitizeConsoleValue');
  });

  it('srcdoc opaque origin 메시지를 피하기 위해 MessagePort로 host에 전달한다', () => {
    const html = createCanvasRunnerHtml();

    expect(html).toContain('__hostPort__');
    expect(html).toContain("msg.kind !== 'connect'");
    expect(html).toContain('__hostPort__.postMessage(msg)');
    expect(html).not.toContain('window.parent.postMessage');
  });

  it('허용된 vectra leaf import의 barrel이 sandbox 모듈 번들에 포함된다', () => {
    const missingBarrels = [...new Set(VECTRA_ALLOWED_SPECIFIERS.map(resolveBarrelSpecifier))].filter(
      (specifier) => !VECTRA_SANDBOX_BARREL_SPECIFIERS.includes(specifier)
    );

    expect(missingBarrels).toEqual([]);
  });

  it('vectra sandbox allowlist가 package exports에서 파생된다', () => {
    const specifiers = packageExportSpecifiers();

    expect(VECTRA_ALLOWED_SPECIFIERS).toEqual(specifiers);
    expect(VECTRA_SANDBOX_BARREL_SPECIFIERS).toEqual(specifiers);
  });

  it('ResizeObserver 기반 canvas 크기 조정을 포함한다', () => {
    const html = createCanvasRunnerHtml();

    expect(html).toContain('<div id="stage"><canvas id="c"></canvas></div>');
    expect(html).toContain("document.getElementById('stage')");
    expect(html).toContain('ResizeObserver');
    expect(html).toContain('resizeCanvas');
    expect(html).toContain('devicePixelRatio');
  });

  it('ResizeObserver가 같은 크기를 다시 보고해도 canvas bitmap을 지우지 않는다', () => {
    const html = createCanvasRunnerHtml();

    expect(html).toContain('var targetWidth = Math.floor(size.width * ratio);');
    expect(html).toContain('var targetHeight = Math.floor(size.height * ratio);');
    expect(html).toContain('if (canvas.width !== targetWidth || canvas.height !== targetHeight)');
  });

  it('canvas 크기가 바뀌면 마지막 run message를 다시 실행한다', () => {
    const html = createCanvasRunnerHtml();

    expect(html).toContain('__lastRunMessage__');
    expect(html).toContain('scheduleResizeRerun');
    expect(html).toContain('if (__lastRunMessage__) handleHostMessage(__lastRunMessage__)');
  });

  it('iframe 런타임 오류를 host diagnostics로 전달한다', () => {
    const html = createCanvasRunnerHtml();

    expect(html).toContain("window.addEventListener('error'");
    expect(html).toContain("window.addEventListener('unhandledrejection'");
  });
});
