// SVG path data token을 추출하는 정규식.
// 알파벳 전체와 숫자(부호, decimal, scientific notation 포함)를 동시에 매칭한다.
// 지원하지 않는 command letter도 포함하여 parser에서 실패 처리한다.
const TOKEN_RE = /[A-Za-z]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g;

/** Z/z 이후에 반사 상태를 초기화하기 위한 sentinel */
export const NO_SHORTHAND = 'none' as const;

/** 다음 토큰을 숫자로 읽는다. 실패하면 null을 반환한다. */
export function readNum(tokens: string[], idx: { i: number }): number | null {
  const tok = tokens[idx.i];
  if (tok === undefined) return null;
  const n = Number(tok);
  if (!Number.isFinite(n)) return null;
  idx.i++;
  return n;
}

/** flag 값 (0 또는 1)을 읽는다. 범위를 벗어나면 null을 반환한다. */
export function readFlag(tokens: string[], idx: { i: number }): boolean | null {
  const n = readNum(tokens, idx);
  if (n === null) return null;
  if (n !== 0 && n !== 1) return null;
  return n === 1;
}

/**
 * SVG path data string을 tokenize하여 token 배열을 반환한다.
 * command letter와 숫자 token이 순서대로 담긴다.
 */
export function tokenize(data: string): string[] {
  return data.match(TOKEN_RE) ?? [];
}
