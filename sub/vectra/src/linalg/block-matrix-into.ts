import { copyBlocksToMatrix, resolveBlockMatrixLayout } from './block-matrix-layout.internal';
import { commitMatrixInto } from './commit-matrix.internal';
import type { MatLike, MatWritable } from './types';

/**
 * nested block grid를 하나의 matrix로 합쳐 `out`에 기록하고 `out`을 반환한다.
 *
 * `blocks[i][j]`는 `i`-번째 block row의 `j`-번째 block이다. 결과 matrix는 block row를 위에서
 * 아래로 stack하고, 각 block row 안에서 block을 왼쪽에서 오른쪽으로 augment한 형태다.
 *
 * 호환성 규칙:
 *
 *  - `blocks.length === 0`이면 `[]`(`[0, 0]`)를 commit한다.
 *  - 각 block row는 1개 이상의 block을 가져야 한다. 빈 row는 `RangeError`.
 *  - 모든 block row는 같은 block 개수를 가져야 한다.
 *  - 같은 block row 안에서 모든 block의 row count가 같아야 한다.
 *  - 같은 block column 위치(`j` 고정)에서 모든 block의 column count가 같아야 한다.
 *  - 결과 shape `[Σ rowHeights, Σ columnWidths]`는 safe integer 범위여야 한다.
 *
 * 각 block은 rectangular nested array여야 한다. ragged matrix와 `[[]]` 같은 one-sided zero shape는
 * `RangeError`. 모든 entry는 finite number여야 한다. 위반 시 `RangeError`.
 * `out`은 결과 shape에 맞는 row와 column capacity가 준비되어 있어야 한다. 부족하면 `RangeError`.
 * 위 조건 중 하나라도 위반하면 `out`은 호출 전 상태 그대로 남는다(temp matrix에서 계산을
 * 완성한 뒤 commit).
 * 성공 시 `out.length`는 결과 row 수로, 각 row length는 결과 column 수로 truncate된다.
 *
 * 입력 block entry의 `-0`은 결과에 그대로 보존된다. `blockMatrix*`는 산술이 아닌 rearrangement
 * copy이므로 별도의 `-0` canonicalize를 수행하지 않는다.
 *
 * 입력 grid는 `MatLike[][]` type contract를 만족해야 한다. type-system을 우회한 입력(예: `null`
 * block)에는 동작을 보장하지 않는다.
 *
 * `out`이 일부 block row 객체와 storage를 공유해도 안전하다. temp matrix에서 결과를 만든 뒤
 * commit한다.
 *
 * @param out block 결과를 기록할 writable matrix. 결과 shape에 맞는 capacity가 준비되어 있어야 한다.
 * @param blocks block grid. `blocks[i][j]`는 `(i, j)` 위치 block이다.
 */
export function blockMatrixInto<Out extends MatWritable>(out: Out, blocks: readonly (readonly MatLike[])[]): Out {
  const layout = resolveBlockMatrixLayout(blocks);
  if (layout.totalRows === 0) {
    commitMatrixInto(out, [], 0, 0, 'out');
    return out;
  }

  const temp: number[][] = new Array(layout.totalRows);
  for (let r = 0; r < layout.totalRows; r++) {
    temp[r] = new Array<number>(layout.totalColumns);
  }

  copyBlocksToMatrix(blocks, layout, temp);

  commitMatrixInto(out, temp, layout.totalRows, layout.totalColumns, 'out');
  return out;
}
