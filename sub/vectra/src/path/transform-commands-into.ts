import { readMatrixA, readMatrixB, readMatrixC, readMatrixD, readMatrixTx, readMatrixTy } from '../internal/matrix';
import type { MatrixLike, PathCommand } from '../types/index';

/** transformCommandsInto 옵션. */
export interface TransformCommandsOptions {
  /**
   * arc command 처리 방식.
   *
   * - `'keep'`  : ArcCommand의 endpoint `(x, y)`에만 affine 적용. `rx`/`ry`/`xRotation` 미갱신.
   * - `'error'` : commands에 ArcCommand가 하나라도 있으면 throw.
   *
   * 기본값 `'keep'`.
   */
  arcHandling?: 'keep' | 'error';
}

/**
 * commands 전체에 affine matrix를 적용한 결과를 out에 기록하고 out을 반환한다.
 *
 * out을 clear(length = 0) 후 push 방식으로 채운다. 결과 command는 새 object이며
 * 입력 command reference를 보존하지 않는다.
 *
 * - Move/Line/Quadratic/Cubic: 모든 좌표 field(control point 포함)에 affine 적용.
 * - Close: 좌표가 없으므로 kind만 보존한 새 close marker를 push한다.
 * - Arc: `arcHandling`에 따른다. `'keep'`(기본값)은 endpoint `(x, y)`에만 affine을
 *   적용하고 `rx`/`ry`/`xRotation`은 그대로 둔다. **non-uniform scale / skew / rotation
 *   matrix에서는 arc shape가 부정확하다.** 정확한 arc transform은 `rx`/`ry`/`xRotation`
 *   재계산이 필요하며 curve domain 선행 작업이다. 이 한계는 caller가 인지하고 사용한다.
 *   `'error'`는 ArcCommand가 하나라도 있으면 throw한다.
 * - empty commands → out을 clear만 하고 반환한다.
 * - invalid numeric(NaN, Inf)은 throw 없이 전파한다.
 * - out과 commands가 같은 배열이어도 안전하다 (clear 전에 snapshot한다).
 *
 * @param out 변환 결과를 기록할 mutable PathCommand 배열
 * @param commands 변환할 입력 command sequence (absolute 전제)
 * @param matrix 적용할 affine matrix. `{ a, b, c, d, tx, ty }` object 또는 6-tuple.
 * @param options arc 처리 방식 옵션. 생략 시 `arcHandling: 'keep'`.
 * @returns 기록이 완료된 out (입력과 동일한 참조)
 */
export function transformCommandsInto<Out extends PathCommand[]>(
  out: Out,
  commands: readonly PathCommand[],
  matrix: MatrixLike,
  options?: TransformCommandsOptions
): Out {
  const arcHandling = options?.arcHandling ?? 'keep';

  // clear 전에 snapshot해 aliasing(out === commands)을 안전하게 처리
  const snapshot = commands === (out as readonly PathCommand[]) ? Array.from(commands) : commands;

  out.length = 0;

  if (snapshot.length === 0) {
    return out;
  }

  const a = readMatrixA(matrix);
  const b = readMatrixB(matrix);
  const c = readMatrixC(matrix);
  const d = readMatrixD(matrix);
  const tx = readMatrixTx(matrix);
  const ty = readMatrixTy(matrix);

  // transformPointInto와 동일한 affine 식: (x', y') = (a·x + c·y + tx, b·x + d·y + ty)
  const mapX = (x: number, y: number): number => a * x + c * y + tx;
  const mapY = (x: number, y: number): number => b * x + d * y + ty;

  for (const cmd of snapshot) {
    if (cmd.kind === 'move') {
      out.push({ kind: 'move', x: mapX(cmd.x, cmd.y), y: mapY(cmd.x, cmd.y) } as Out[number]);
    } else if (cmd.kind === 'line') {
      out.push({ kind: 'line', x: mapX(cmd.x, cmd.y), y: mapY(cmd.x, cmd.y) } as Out[number]);
    } else if (cmd.kind === 'quadratic') {
      out.push({
        kind: 'quadratic',
        x1: mapX(cmd.x1, cmd.y1),
        y1: mapY(cmd.x1, cmd.y1),
        x: mapX(cmd.x, cmd.y),
        y: mapY(cmd.x, cmd.y),
      } as Out[number]);
    } else if (cmd.kind === 'cubic') {
      out.push({
        kind: 'cubic',
        x1: mapX(cmd.x1, cmd.y1),
        y1: mapY(cmd.x1, cmd.y1),
        x2: mapX(cmd.x2, cmd.y2),
        y2: mapY(cmd.x2, cmd.y2),
        x: mapX(cmd.x, cmd.y),
        y: mapY(cmd.x, cmd.y),
      } as Out[number]);
    } else if (cmd.kind === 'arc') {
      if (arcHandling === 'error') {
        throw new Error(
          'transformCommandsInto: ArcCommand는 정확한 affine 변환을 지원하지 않는다 ' +
            "(rx/ry/xRotation 재계산 미구현). arcHandling 옵션을 생략하거나 'keep'으로 두면 " +
            'endpoint만 변환한다.'
        );
      }
      // 'keep': endpoint만 변환. rx/ry/xRotation은 보존 — non-uniform scale에서 부정확.
      out.push({
        kind: 'arc',
        rx: cmd.rx,
        ry: cmd.ry,
        xRotation: cmd.xRotation,
        largeArc: cmd.largeArc,
        sweep: cmd.sweep,
        x: mapX(cmd.x, cmd.y),
        y: mapY(cmd.x, cmd.y),
      } as Out[number]);
    } else {
      // close: 좌표 없음, kind만 보존한 새 marker push
      out.push({ kind: 'close' } as Out[number]);
    }
  }

  return out;
}
