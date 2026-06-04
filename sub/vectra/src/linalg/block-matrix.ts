import { copyBlocksToMatrix, resolveBlockMatrixLayout } from './block-matrix-layout.internal';
import type { MatLike } from './types';

/**
 * nested block grid를 하나의 matrix로 합쳐 새 `number[][]`로 반환한다.
 *
 * `blocks[i][j]`는 `i`-번째 block row의 `j`-번째 block이다. 결과 matrix는 block row를 위에서
 * 아래로 stack하고, 각 block row 안에서 block을 왼쪽에서 오른쪽으로 augment한 형태다.
 *
 * 호환성 규칙:
 *
 *  - `blocks.length === 0`이면 `[]`를 반환한다.
 *  - 각 block row는 1개 이상의 block을 가져야 한다. 빈 row는 `RangeError`.
 *  - 모든 block row는 같은 block 개수를 가져야 한다.
 *  - 같은 block row 안에서 모든 block의 row count가 같아야 한다.
 *  - 같은 block column 위치(`j` 고정)에서 모든 block의 column count가 같아야 한다.
 *  - 결과 shape `[Σ rowHeights, Σ columnWidths]`는 safe integer 범위여야 한다.
 *
 * 각 block은 rectangular nested array여야 한다. ragged matrix와 `[[]]` 같은 one-sided zero shape는
 * `RangeError`. 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 *
 * 입력 block entry의 `-0`은 결과에 그대로 보존된다. `blockMatrix*`는 산술이 아닌 rearrangement
 * copy이므로 별도의 `-0` canonicalize를 수행하지 않는다.
 *
 * 입력 grid는 `MatLike[][]` type contract를 만족해야 한다. type-system을 우회한 입력(예: `null`
 * block)에는 동작을 보장하지 않는다. 정상 입력의 shape / finiteness 검증은 `blockMatrixInto`에
 * 위임한다.
 *
 * @param blocks block grid. `blocks[i][j]`는 `(i, j)` 위치 block이다.
 */
export function blockMatrix(blocks: readonly (readonly MatLike[])[]): number[][] {
  const layout = resolveBlockMatrixLayout(blocks);
  if (layout.totalRows === 0) {
    return [];
  }

  const out: number[][] = new Array(layout.totalRows);
  for (let r = 0; r < layout.totalRows; r++) {
    out[r] = new Array<number>(layout.totalColumns);
  }
  copyBlocksToMatrix(blocks, layout, out);
  return out;
}
