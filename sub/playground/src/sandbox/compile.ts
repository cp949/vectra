/**
 * TypeScript → JavaScript 변환 모듈.
 *
 * sucrase를 사용해 타입 제거 후 import 구문을 __modules__ 참조로 변환한다.
 * vectra 모듈 allowlist 검증도 이 단계에서 수행한다.
 */
import { transform } from 'sucrase';
import type { PlaygroundDiagnostic } from '../diagnostics/types';

const VECTRA_PACKAGE_NAME = '@cp949/vectra';

// ──────────────────────────────────────────────
// 공개 타입
// ──────────────────────────────────────────────

/** 컴파일 결과 */
export interface CompileResult {
  /** 변환된 JavaScript 코드 */
  readonly compiledJs: string;
  /** 사용된 모듈 specifier 목록 */
  readonly specifiers: readonly string[];
  /** 컴파일 중 발생한 진단 메시지 */
  readonly diagnostics: readonly PlaygroundDiagnostic[];
}

/** 컴파일 옵션 */
export interface CompileOptions {
  /** 허용된 모듈 specifier 목록. 이 목록에 없으면 import 거부. */
  readonly allowedSpecifiers: readonly string[];
}

// ──────────────────────────────────────────────
// 내부 타입
// ──────────────────────────────────────────────

/** 파싱된 static import 정보 */
interface ParsedImport {
  /** 원본 import 구문 전체 */
  readonly raw: string;
  /** import 대상 specifier (e.g. "@cp949/vectra/vec") */
  readonly specifier: string;
  /**
   * named import 바인딩 목록.
   * `import { a as b, c } from '...'` → [{ name: 'a', alias: 'b' }, { name: 'c', alias: 'c' }]
   */
  readonly named: readonly { readonly name: string; readonly alias: string }[];
  /** namespace import 바인딩 (`import * as ns from '...'`) */
  readonly namespace?: string;
  /** default import 바인딩 (`import def from '...'`) */
  readonly defaultBinding?: string;
}

// ──────────────────────────────────────────────
// 정적 import 파싱
// ──────────────────────────────────────────────

/**
 * TypeScript 소스에서 정적 import 선언을 파싱한다.
 *
 * 지원:
 *   import { x, y as z } from 'specifier';
 *   import * as ns from 'specifier';
 *   import def from 'specifier';
 *   import type { ... } from 'specifier';   (타입 전용 → 무시)
 *   import 'specifier';                     (side-effect only → 수집만)
 *
 * 미지원:
 *   dynamic import()
 */
function parseStaticImports(source: string): readonly ParsedImport[] {
  const results: ParsedImport[] = [];

  // 정적 import 구문 패턴:
  //   import [type] <bindings> from '<specifier>';
  //   import '<specifier>';  (side-effect)
  // 멀티라인을 허용하기 위해 [\s\S]*? 사용
  const importRe = /^[ \t]*import\s+(?:(type)\s+)?([\s\S]*?from\s+)?['"]([^'"]+)['"]\s*;?/gm;

  let match: RegExpExecArray | null;
  // biome-ignore lint/suspicious/noAssignInExpressions: 정규식 루프 관용구
  while ((match = importRe.exec(source)) !== null) {
    const isTypeOnly = Boolean(match[1]);
    // 타입 전용 import는 번환 불필요 → specifier만 기록하지 않음 (sucrase가 제거)
    if (isTypeOnly) continue;

    const bindingsPart = match[2] ?? ''; // "{ x, y as z } from " or "* as ns from " or ""
    const specifier = match[3] ?? '';
    const raw = match[0];

    // side-effect import (바인딩 없음)
    if (!bindingsPart.trim()) {
      results.push({ raw, specifier, named: [] });
      continue;
    }

    // from 앞 부분만 추출
    const bindingsStr = bindingsPart.replace(/from\s*$/, '').trim();

    // namespace import: * as ns
    const nsMatch = /^\*\s+as\s+(\w+)$/.exec(bindingsStr);
    if (nsMatch) {
      results.push({ raw, specifier, named: [], namespace: nsMatch[1] });
      continue;
    }

    // default import + named import 혼합 처리
    // e.g. "def, { x, y }" or "{ x, y }" or "def"
    let defaultBinding: string | undefined;
    let namedStr = bindingsStr;

    // default 바인딩 추출 (중괄호 앞에 있는 식별자)
    const defaultPlusNamedMatch = /^(\w+)\s*,\s*\{([\s\S]+)\}$/.exec(bindingsStr);
    if (defaultPlusNamedMatch) {
      defaultBinding = defaultPlusNamedMatch[1];
      namedStr = `{${defaultPlusNamedMatch[2]}}`;
    } else {
      // 순수 default import
      const pureDefaultMatch = /^(\w+)$/.exec(bindingsStr);
      if (pureDefaultMatch) {
        defaultBinding = pureDefaultMatch[1];
        namedStr = '{}';
      }
    }

    // named bindings 파싱: { a, b as c, ... }
    const named: { name: string; alias: string }[] = [];
    const namedBlockMatch = /\{([\s\S]+)\}/.exec(namedStr);
    if (namedBlockMatch) {
      const inner = namedBlockMatch[1];
      for (const part of inner.split(',')) {
        const trimmed = part.trim();
        if (!trimmed) continue;
        const asMatch = /^(\w+)\s+as\s+(\w+)$/.exec(trimmed);
        if (asMatch) {
          named.push({ name: asMatch[1], alias: asMatch[2] });
        } else if (/^\w+$/.test(trimmed)) {
          named.push({ name: trimmed, alias: trimmed });
        }
      }
    }

    results.push({ raw, specifier, named, namespace: undefined, defaultBinding });
  }

  return results;
}

// ──────────────────────────────────────────────
// import 구문 → __modules__ 참조 변환
// ──────────────────────────────────────────────

/**
 * leaf specifier를 barrel 경로로 변환한다.
 *
 * @cp949/vectra/vec/add-into → @cp949/vectra/vec
 * @cp949/vectra/vec          → @cp949/vectra/vec (그대로)
 * @cp949/vectra              → @cp949/vectra (그대로)
 */
function resolveBarrelSpecifier(specifier: string): string {
  const prefix = `${VECTRA_PACKAGE_NAME}/`;
  if (!specifier.startsWith(prefix)) {
    return specifier;
  }

  const parts = specifier.slice(prefix.length).split('/');
  // @cp949/vectra/<domain>/<leaf> 형태인 경우 domain barrel 경로로 변환
  if (parts.length >= 2) {
    return `${VECTRA_PACKAGE_NAME}/${parts[0]}`;
  }
  return specifier;
}

/**
 * 파싱된 import를 `__modules__['specifier']` 구조분해 할당으로 변환한다.
 *
 * leaf specifier는 barrel 경로로 변환한다.
 *
 * 예:
 *   import { addInto } from '@cp949/vectra/vec/add-into';
 *   → const { addInto } = __modules__['@cp949/vectra/vec'];
 */
function importToModuleRef(parsed: ParsedImport): string {
  // leaf specifier를 barrel 경로로 변환하여 __modules__ 키와 일치시킨다
  const ref = `__modules__[${JSON.stringify(resolveBarrelSpecifier(parsed.specifier))}]`;

  // side-effect only: 아무것도 선언하지 않는다
  if (parsed.named.length === 0 && !parsed.namespace && !parsed.defaultBinding) {
    return `/* side-effect import '${parsed.specifier}' omitted */`;
  }

  const parts: string[] = [];

  // namespace import: import * as ns → const ns = __modules__['...'];
  if (parsed.namespace) {
    return `const ${parsed.namespace} = ${ref};`;
  }

  // default import: vectra 모듈에는 default export가 없으므로 구조분해 첫 키로 처리
  // (현실적으로 vectra allowlist에서는 default import가 발생하지 않는다)
  if (parsed.defaultBinding) {
    parts.push(`const ${parsed.defaultBinding} = ${ref}['default'] ?? ${ref};`);
  }

  // named import: { a as b, c } → const { a: b, c } = __modules__['...'];
  if (parsed.named.length > 0) {
    const destructure = parsed.named.map(({ name, alias }) => (name === alias ? name : `${name}: ${alias}`)).join(', ');
    parts.push(`const { ${destructure} } = ${ref};`);
  }

  return parts.join('\n');
}

// ──────────────────────────────────────────────
// export 키워드 제거
// ──────────────────────────────────────────────

/**
 * 최상위 export 키워드를 제거한다.
 *
 * `export function draw(...)` → `function draw(...)`
 * `export const x = ...`     → `const x = ...`
 * `export default ...`       → (제거)
 * `export { ... }`           → (제거)
 */
function stripExports(js: string): string {
  return (
    js
      // export function / export async function / export class
      .replace(/^export\s+(async\s+function|function|class)\b/gm, '$1')
      // export const / export let / export var
      .replace(/^export\s+(const|let|var)\b/gm, '$1')
      // export default ... (한 줄)
      .replace(/^export\s+default\s+.+$/gm, '')
      // export { ... } 블록
      .replace(/^export\s*\{[^}]*\}\s*;?/gm, '')
  );
}

// ──────────────────────────────────────────────
// 공개 API
// ──────────────────────────────────────────────

/**
 * TypeScript 코드를 sandbox 실행용 JavaScript로 변환한다.
 *
 * 변환 순서:
 *   1. 정적 import 선언 파싱 및 allowlist 검증
 *   2. import 구문 → `__modules__` 참조로 치환 (TS 소스 상태에서)
 *   3. sucrase로 TypeScript → JavaScript (타입 제거)
 *   4. export 키워드 제거
 *
 * sucrase의 `typescript` transform만 사용하면 import 구문이 제거되므로,
 * import 치환을 sucrase 변환 전에 먼저 수행한다.
 */
export function compileForSandbox(tsCode: string, options: CompileOptions): CompileResult {
  const diagnostics: PlaygroundDiagnostic[] = [];

  // 0단계: dynamic import() / require() 패턴 차단
  // allowlist는 static import만 허용하므로 동적 로딩은 모두 거부한다
  if (/\bimport\s*\(|\brequire\s*\(/.test(tsCode)) {
    return {
      compiledJs: '',
      specifiers: [],
      diagnostics: [
        {
          source: 'import',
          severity: 'error',
          message: 'dynamic import() 및 require()는 sandbox에서 허용되지 않습니다.',
        },
      ],
    };
  }

  // 1단계: 정적 import 파싱 및 allowlist 검증
  const parsedImports = parseStaticImports(tsCode);
  const specifiers: string[] = [];

  for (const imp of parsedImports) {
    // allowlist 검증
    if (!options.allowedSpecifiers.includes(imp.specifier)) {
      diagnostics.push({
        source: 'import',
        severity: 'error',
        message: `허용되지 않은 import: '${imp.specifier}'. vectra 하위 경로만 사용할 수 있습니다.`,
      });
    } else {
      if (!specifiers.includes(imp.specifier)) {
        specifiers.push(imp.specifier);
      }
    }
  }

  // import 오류가 있으면 빈 JS 반환
  if (diagnostics.length > 0) {
    return { compiledJs: '', specifiers: [], diagnostics };
  }

  // 2단계: import 구문을 __modules__ 참조로 치환 (TypeScript 소스 상태에서 먼저 수행)
  // sucrase의 'typescript' transform은 import 구문을 제거하므로,
  // sucrase 변환 이전에 치환해야 한다.
  let preprocessed = tsCode;
  for (const imp of parsedImports) {
    const replacement = importToModuleRef(imp);
    // raw 문자열 직접 교체
    if (preprocessed.includes(imp.raw)) {
      preprocessed = preprocessed.replace(imp.raw, replacement);
    } else {
      // 폴백: specifier 기반 정규식 치환
      const fallbackRe = new RegExp(`import\\s+[\\s\\S]*?from\\s+['"]${escapeRegExp(imp.specifier)}['"]\\s*;?`, 'g');
      preprocessed = preprocessed.replace(fallbackRe, replacement);
    }
  }

  // 3단계: sucrase로 TypeScript 타입 제거
  let outputJs: string;
  try {
    const result = transform(preprocessed, {
      transforms: ['typescript'],
    });
    outputJs = result.code;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    diagnostics.push({
      source: 'compile',
      severity: 'error',
      message: `TypeScript 변환 오류: ${message}`,
    });
    return { compiledJs: '', specifiers: [], diagnostics };
  }

  // 4단계: export 키워드 제거
  outputJs = stripExports(outputJs);

  return {
    compiledJs: outputJs.trim(),
    specifiers,
    diagnostics,
  };
}

// ──────────────────────────────────────────────
// 내부 유틸리티
// ──────────────────────────────────────────────

/** 정규식 특수 문자를 이스케이프한다 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
