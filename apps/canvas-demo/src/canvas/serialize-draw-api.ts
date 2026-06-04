/**
 * CanvasDrawApi 직렬화 유틸리티.
 *
 * iframe runner는 srcdoc 문자열 안에서 실행되므로 원본 모듈의 클로저를 공유하지 않는다.
 * draw API 메서드와 그 메서드가 참조하는 작은 helper를 함께 직렬화한다.
 */

/** iframe 안에서 CanvasDrawApi 메서드가 참조할 helper 코드 */
const DRAW_API_HELPERS_JS = `
function rx(p) {
  return Array.isArray(p) ? (p[0] ?? 0) : p.x;
}

function ry(p) {
  return Array.isArray(p) ? (p[1] ?? 0) : p.y;
}

function readSegmentA(segment) {
  return Array.isArray(segment) ? segment[0] : segment.a;
}

function readSegmentB(segment) {
  return Array.isArray(segment) ? segment[1] : segment.b;
}

function readBoundsMin(bounds) {
  return Array.isArray(bounds) ? bounds[0] : bounds.min;
}

function readBoundsMax(bounds) {
  return Array.isArray(bounds) ? bounds[1] : bounds.max;
}

function readCircleCenter(circle) {
  return Array.isArray(circle) ? circle[0] : circle.center;
}

function readCircleRadius(circle) {
  return Array.isArray(circle) ? circle[1] : circle.radius;
}

function readRectX(rect) {
  return Array.isArray(rect) ? rect[0] : rect.x;
}

function readRectY(rect) {
  return Array.isArray(rect) ? rect[1] : rect.y;
}

function readRectWidth(rect) {
  return Array.isArray(rect) ? rect[2] : rect.width;
}

function readRectHeight(rect) {
  return Array.isArray(rect) ? rect[3] : rect.height;
}

function readPoints(shape) {
  if (Array.isArray(shape)) return shape;
  return shape.points ?? [];
}

const DEFAULT_STROKE_COLOR = '#e2e8f0';
const DEFAULT_FILL_COLOR = 'rgba(56, 189, 248, 0.15)';
const DEFAULT_POINT_COLOR = '#38bdf8';
const DEFAULT_POINT_RADIUS = 5;
const DEFAULT_STROKE_WIDTH = 1.5;
`;

/** object method shorthand toString 결과를 object value로 쓸 수 있는 function expression으로 바꾼다 */
function normalizeFunctionSource(fn: { toString(): string }): string {
  const source = fn.toString();
  if (/^(?:async\s+)?function\b/.test(source)) return source;
  if (/^\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>/.test(source)) return source;
  return `function ${source}`;
}

/**
 * 모듈 export 객체를 JSON-like 문자열로 직렬화한다.
 *
 * 함수는 `Function#toString()`으로 직렬화하고, object method shorthand는 function expression으로
 * 정규화한다.
 */
function serializeModule(mod: Record<string, unknown>): string {
  const entries = Object.entries(mod)
    .map(([k, v]) => {
      if (typeof v === 'function') {
        return `${JSON.stringify(k)}: ${normalizeFunctionSource(v)}`;
      }
      try {
        return `${JSON.stringify(k)}: ${JSON.stringify(v)}`;
      } catch {
        return `${JSON.stringify(k)}: undefined`;
      }
    })
    .join(',\n    ');
  return `{\n    ${entries}\n  }`;
}

/** CanvasDrawApi를 iframe runner 안에서 실행 가능한 객체 리터럴 표현식으로 직렬화한다 */
export function serializeCanvasDrawApi(api: Record<string, unknown>): string {
  return `(function () {\n${DRAW_API_HELPERS_JS}\nreturn ${serializeModule(api)};\n})()`;
}
