import { describe, expect, test } from 'vitest';
import { bernoulli } from '../../../src/random/bernoulli';
import { beta } from '../../../src/random/beta';
import { binomial } from '../../../src/random/binomial';
import { dirichlet } from '../../../src/random/dirichlet';
import { dirichletInto } from '../../../src/random/dirichlet-into';
import { exponential } from '../../../src/random/exponential';
import { gamma } from '../../../src/random/gamma';
import { geometric } from '../../../src/random/geometric';
import { logNormal } from '../../../src/random/log-normal';
import { multivariateNormal } from '../../../src/random/multivariate-normal';
import { multivariateNormalInto } from '../../../src/random/multivariate-normal-into';
import { normal } from '../../../src/random/normal';
import { poisson } from '../../../src/random/poisson';
import { standardNormal } from '../../../src/random/standard-normal';
import { triangular } from '../../../src/random/triangular';
import { uniform } from '../../../src/random/uniform';

// 미리 정해진 값을 순서대로 반환하는 테스트용 sequence generator
const sequence = (values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length];
};

describe('uniform', () => {
  test('sequence([0.25])로 [10, 20) 범위에서 12.5를 반환한다', () => {
    expect(uniform(10, 20, sequence([0.25]))).toBe(12.5);
  });

  test('non-finite min은 RangeError를 던진다', () => {
    expect(() => uniform(Number.POSITIVE_INFINITY, 20)).toThrow(RangeError);
    expect(() => uniform(Number.NaN, 20)).toThrow(RangeError);
  });

  test('non-finite max는 RangeError를 던진다', () => {
    expect(() => uniform(10, Number.POSITIVE_INFINITY)).toThrow(RangeError);
    expect(() => uniform(10, Number.NaN)).toThrow(RangeError);
  });
});

describe('bernoulli', () => {
  test('p=0이면 항상 false를 반환한다', () => {
    expect(bernoulli(0)).toBe(false);
  });

  test('p=1이면 항상 true를 반환한다', () => {
    expect(bernoulli(1)).toBe(true);
  });

  test('rng 반환값이 p 미만이면 true를 반환한다', () => {
    expect(bernoulli(0.5, sequence([0.49]))).toBe(true);
  });

  test('rng 반환값이 p 이상이면 false를 반환한다', () => {
    expect(bernoulli(0.5, sequence([0.5]))).toBe(false);
  });

  test('non-finite p는 RangeError를 던진다', () => {
    expect(() => bernoulli(Number.POSITIVE_INFINITY)).toThrow(RangeError);
    expect(() => bernoulli(Number.NaN)).toThrow(RangeError);
  });

  test('범위를 벗어난 p는 RangeError를 던진다', () => {
    expect(() => bernoulli(-0.1)).toThrow(RangeError);
    expect(() => bernoulli(1.1)).toThrow(RangeError);
  });
});

describe('standardNormal', () => {
  test('sequence([0.5, 0.25])에 대해 deterministic 값을 tolerance 내에서 반환한다', () => {
    // Box-Muller: u1=0.5, u2=0.25
    // Math.sqrt(-2 * Math.log(0.5)) * Math.cos(2 * Math.PI * 0.25) ≈ 7.209557076787946e-17
    const expected = 7.209557076787946e-17;
    const result = standardNormal(sequence([0.5, 0.25]));
    expect(Math.abs(result - expected)).toBeLessThan(1e-10);
  });

  test('u1=0인 경우 Math.log(0) 회피로 finite number를 반환한다', () => {
    // sequence([0, 0.25])에서 u1=0이므로 Number.MIN_VALUE로 대체
    const result = standardNormal(sequence([0, 0.25]));
    expect(Number.isFinite(result)).toBe(true);
  });
});

describe('normal', () => {
  test('mean=10, stddev=2이면 mean + standardNormal * stddev 정책을 따른다', () => {
    // stddev=0이면 mean 그대로 반환
    expect(normal(10, 0, sequence([0.5, 0.25]))).toBe(10);
  });

  test('mean=10, stddev=2, rng가 주어지면 standardNormal 결과에 따른 값을 반환한다', () => {
    const rng1 = sequence([0.5, 0.25]);
    const rng2 = sequence([0.5, 0.25]);
    const expected = 10 + standardNormal(rng1) * 2;
    expect(Math.abs(normal(10, 2, rng2) - expected)).toBeLessThan(1e-10);
  });

  test('non-finite mean은 RangeError를 던진다', () => {
    expect(() => normal(Number.POSITIVE_INFINITY, 1)).toThrow(RangeError);
    expect(() => normal(Number.NaN, 1)).toThrow(RangeError);
  });

  test('non-finite stddev는 RangeError를 던진다', () => {
    expect(() => normal(0, Number.POSITIVE_INFINITY)).toThrow(RangeError);
    expect(() => normal(0, Number.NaN)).toThrow(RangeError);
  });

  test('음수 stddev는 RangeError를 던진다', () => {
    expect(() => normal(0, -1)).toThrow(RangeError);
  });
});

describe('exponential', () => {
  test('scale=2, rng=sequence([0.5])이면 -Math.log(0.5) * 2를 반환한다', () => {
    const expected = -Math.log(1 - 0.5) * 2;
    const result = exponential(2, sequence([0.5]));
    expect(Math.abs(result - expected)).toBeLessThan(1e-10);
  });

  test('non-finite scale은 RangeError를 던진다', () => {
    expect(() => exponential(Number.POSITIVE_INFINITY)).toThrow(RangeError);
    expect(() => exponential(Number.NaN)).toThrow(RangeError);
  });

  test('scale <= 0은 RangeError를 던진다', () => {
    expect(() => exponential(0)).toThrow(RangeError);
    expect(() => exponential(-1)).toThrow(RangeError);
  });

  test('rng가 1을 반환해도 Math.log(0) 회피로 finite number를 반환한다', () => {
    // 1 - random(rng) = 0이 되면 Math.log(0) = -Infinity
    // Math.max(..., Number.MIN_VALUE)로 보호하므로 finite여야 한다
    const result = exponential(1, sequence([1]));
    expect(Number.isFinite(result)).toBe(true);
  });
});

describe('triangular', () => {
  test('mode 기준 왼쪽 구간에서는 inverse CDF 왼쪽 공식을 따른다', () => {
    const result = triangular(0, 5, 10, sequence([0.25]));
    expect(Math.abs(result - 3.5355339059327378)).toBeLessThan(1e-10);
  });

  test('mode 기준 오른쪽 구간에서는 inverse CDF 오른쪽 공식을 따른다', () => {
    const result = triangular(0, 5, 10, sequence([0.75]));
    expect(Math.abs(result - 6.464466094067262)).toBeLessThan(1e-10);
  });

  test('left와 right가 같으면 degenerate constant를 반환한다', () => {
    expect(triangular(3, 3, 3, sequence([0.75]))).toBe(3);
  });

  test('non-finite parameter는 RangeError를 던진다', () => {
    expect(() => triangular(Number.NaN, 0, 1)).toThrow(RangeError);
    expect(() => triangular(0, Number.POSITIVE_INFINITY, 1)).toThrow(RangeError);
    expect(() => triangular(0, 1, Number.NaN)).toThrow(RangeError);
  });

  test('left <= mode <= right 순서가 아니면 RangeError를 던진다', () => {
    expect(() => triangular(1, 0, 2)).toThrow(RangeError);
    expect(() => triangular(0, 3, 2)).toThrow(RangeError);
  });
});

describe('poisson', () => {
  test('lambda=0이면 항상 0을 반환한다', () => {
    expect(poisson(0, sequence([0.9]))).toBe(0);
  });

  test('Knuth 알고리즘으로 deterministic count를 반환한다', () => {
    expect(poisson(1, sequence([0.9, 0.8, 0.2]))).toBe(2);
  });

  test('non-finite lambda는 RangeError를 던진다', () => {
    expect(() => poisson(Number.POSITIVE_INFINITY)).toThrow(RangeError);
    expect(() => poisson(Number.NaN)).toThrow(RangeError);
  });

  test('음수 lambda는 RangeError를 던진다', () => {
    expect(() => poisson(-1)).toThrow(RangeError);
  });
});

describe('binomial', () => {
  test('trials=0이면 항상 0을 반환한다', () => {
    expect(binomial(0, 0.5, sequence([0.1]))).toBe(0);
  });

  test('p=0이면 항상 0을 반환한다', () => {
    expect(binomial(4, 0, sequence([0.1]))).toBe(0);
  });

  test('p=1이면 항상 trials를 반환한다', () => {
    expect(binomial(4, 1, sequence([0.9]))).toBe(4);
  });

  test('Bernoulli loop로 성공 횟수를 센다', () => {
    expect(binomial(5, 0.5, sequence([0.1, 0.6, 0.3, 0.5, 0.49]))).toBe(3);
  });

  test('invalid trials는 RangeError를 던진다', () => {
    expect(() => binomial(-1, 0.5)).toThrow(RangeError);
    expect(() => binomial(1.5, 0.5)).toThrow(RangeError);
    expect(() => binomial(Number.POSITIVE_INFINITY, 0.5)).toThrow(RangeError);
    expect(() => binomial(0x100000000, 0.5)).toThrow(RangeError);
  });

  test('invalid p는 RangeError를 던진다', () => {
    expect(() => binomial(1, Number.NaN)).toThrow(RangeError);
    expect(() => binomial(1, -0.1)).toThrow(RangeError);
    expect(() => binomial(1, 1.1)).toThrow(RangeError);
  });
});

describe('geometric', () => {
  test('p=1이면 항상 1을 반환한다', () => {
    expect(geometric(1, sequence([0.9]))).toBe(1);
  });

  test('inverse CDF로 첫 성공까지의 1-based 시행 횟수를 반환한다', () => {
    expect(geometric(0.5, sequence([0.75]))).toBe(3);
  });

  test('invalid p는 RangeError를 던진다', () => {
    expect(() => geometric(0)).toThrow(RangeError);
    expect(() => geometric(-0.1)).toThrow(RangeError);
    expect(() => geometric(1.1)).toThrow(RangeError);
    expect(() => geometric(Number.NaN)).toThrow(RangeError);
  });
});

describe('logNormal', () => {
  test('sigma=0이면 Math.exp(mean)을 반환한다', () => {
    expect(logNormal(2, 0, sequence([0.5, 0.25]))).toBe(Math.exp(2));
  });

  test('normal 기반 deterministic 값을 반환한다', () => {
    const rng1 = sequence([0.5, 0.25]);
    const rng2 = sequence([0.5, 0.25]);
    const expected = Math.exp(normal(1, 2, rng1));
    expect(Math.abs(logNormal(1, 2, rng2) - expected)).toBeLessThan(1e-10);
  });

  test('non-finite mean은 RangeError를 던진다', () => {
    expect(() => logNormal(Number.POSITIVE_INFINITY, 1)).toThrow(RangeError);
    expect(() => logNormal(Number.NaN, 1)).toThrow(RangeError);
  });

  test('invalid sigma는 RangeError를 던진다', () => {
    expect(() => logNormal(0, Number.POSITIVE_INFINITY)).toThrow(RangeError);
    expect(() => logNormal(0, Number.NaN)).toThrow(RangeError);
    expect(() => logNormal(0, -1)).toThrow(RangeError);
  });
});

describe('gamma', () => {
  test('shape=1, scale=2 Marsaglia accepted path는 deterministic 값을 반환한다', () => {
    // x≈0 → v≈1, squeeze accept(u<1). 결과 = (shape - 1/3) * scale = 2/3 * 2
    const result = gamma(1, 2, sequence([0.5, 0.25, 0.5]));
    expect(Math.abs(result - (2 / 3) * 2)).toBeLessThan(1e-9);
  });

  test('shape>1 accepted path는 deterministic 값을 반환한다', () => {
    // d = 2 - 1/3 = 5/3, v≈1, scale=3 → 5
    const result = gamma(2, 3, sequence([0.5, 0.25, 0.5]));
    expect(Math.abs(result - 5)).toBeLessThan(1e-9);
  });

  test('shape>1 rejected-then-accepted path는 deterministic 값을 반환한다', () => {
    // iter1: x = -4 → base = 1 + c*(-4) <= 0 → reject(u 미소비, rng 2회).
    // iter2: x≈0 → accept. 결과 = 5/3.
    const result = gamma(2, 1, sequence([Math.exp(-8), 0.5, 0.5, 0.25, 0.5]));
    expect(Math.abs(result - 5 / 3)).toBeLessThan(1e-9);
  });

  test('0 < shape < 1 transformed path는 deterministic 값을 반환한다', () => {
    // boosted gamma(1.5) ≈ 7/6, 이후 u=0.25 → 7/6 * 0.25^(1/0.5)
    const result = gamma(0.5, 1, sequence([0.5, 0.25, 0.5, 0.25]));
    expect(Math.abs(result - (7 / 6) * 0.25 ** 2)).toBeLessThan(1e-9);
  });

  test('rng=0 경계: shape<1 path의 최종 u=0은 0을 반환한다', () => {
    // boosted gamma(1.5) 후 u=0 → boosted * 0^2 = 0
    const result = gamma(0.5, 1, sequence([0.5, 0.25, 0.5, 0]));
    expect(result).toBe(0);
  });

  test('rng=0 경계: shape>=1 squeeze u=0도 finite 결과를 반환한다', () => {
    const result = gamma(2, 1, sequence([0.5, 0.25, 0]));
    expect(Number.isFinite(result)).toBe(true);
  });

  test('invalid shape는 RangeError를 던진다', () => {
    expect(() => gamma(0)).toThrow(RangeError);
    expect(() => gamma(-1)).toThrow(RangeError);
    expect(() => gamma(Number.NaN)).toThrow(RangeError);
    expect(() => gamma(Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });

  test('invalid scale은 RangeError를 던진다', () => {
    expect(() => gamma(2, 0)).toThrow(RangeError);
    expect(() => gamma(2, -1)).toThrow(RangeError);
    expect(() => gamma(2, Number.NaN)).toThrow(RangeError);
  });
});

describe('beta', () => {
  test('deterministic gamma ratio를 반환한다', () => {
    // ga=gamma(2)=5/3, gb=gamma(2)=5/3 → 5/3 / (10/3) = 0.5
    const result = beta(2, 2, sequence([0.5, 0.25, 0.5]));
    expect(Math.abs(result - 0.5)).toBeLessThan(1e-9);
  });

  test('결과는 [0, 1] 범위다', () => {
    const result = beta(2, 5, sequence([0.5, 0.25, 0.5]));
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(1);
  });

  test('invalid alpha/beta는 RangeError를 던진다', () => {
    expect(() => beta(0, 1)).toThrow(RangeError);
    expect(() => beta(1, 0)).toThrow(RangeError);
    expect(() => beta(-1, 1)).toThrow(RangeError);
    expect(() => beta(Number.NaN, 1)).toThrow(RangeError);
    expect(() => beta(1, Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });

  test('두 gamma 합이 0이면 RangeError를 던진다', () => {
    // shape<1 path에서 두 gamma 모두 u=0 → 둘 다 0 → 합 0
    expect(() => beta(0.5, 0.5, sequence([0.5, 0.25, 0.5, 0, 0.5, 0.25, 0.5, 0]))).toThrow(RangeError);
  });
});

describe('dirichletInto / dirichlet', () => {
  test('deterministic alpha vector 결과를 반환하고 합이 1에 근사한다', () => {
    const result = dirichlet([2, 2], sequence([0.5, 0.25, 0.5]));
    expect(result).toHaveLength(2);
    expect(Math.abs(result[0] - 0.5)).toBeLessThan(1e-9);
    expect(Math.abs(result[1] - 0.5)).toBeLessThan(1e-9);
    expect(Math.abs(result[0] + result[1] - 1)).toBeLessThan(1e-12);
  });

  test('rng=0 경계: shape<1 entry의 u=0은 0 component를 만든다', () => {
    // alpha[0]=0.5 path에서 u=0 → 0, alpha[1]=2 → 5/3 → 정규화 [0, 1]
    const result = dirichlet([0.5, 2], sequence([0.5, 0.25, 0.5, 0, 0.5, 0.25, 0.5]));
    expect(result[0]).toBe(0);
    expect(Math.abs(result[1] - 1)).toBeLessThan(1e-9);
  });

  test('non-array alpha는 TypeError를 던진다', () => {
    expect(() => dirichletInto([], 5 as unknown as number[])).toThrow(TypeError);
  });

  test('empty alpha는 RangeError를 던진다', () => {
    expect(() => dirichlet([])).toThrow(RangeError);
  });

  test('non-finite 또는 0 이하 alpha entry는 RangeError를 던진다', () => {
    expect(() => dirichlet([1, 0])).toThrow(RangeError);
    expect(() => dirichlet([1, -1])).toThrow(RangeError);
    expect(() => dirichlet([1, Number.NaN])).toThrow(RangeError);
    expect(() => dirichlet([Number.POSITIVE_INFINITY, 1])).toThrow(RangeError);
  });

  test('invalid path에서 out을 수정하지 않는다', () => {
    const out = [9, 9];
    expect(() => dirichletInto(out, [-1])).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });

  test('out === alpha aliasing이 안전하다', () => {
    const a = [2, 2];
    const result = dirichletInto(a, a, sequence([0.5, 0.25, 0.5]));
    expect(result).toBe(a);
    expect(Math.abs(a[0] - 0.5)).toBeLessThan(1e-9);
    expect(Math.abs(a[1] - 0.5)).toBeLessThan(1e-9);
  });

  test('companion은 새 배열을 반환하고 Into와 같은 값을 반환한다', () => {
    const out: number[] = [];
    dirichletInto(out, [1, 2, 3], sequence([0.5, 0.25, 0.5]));
    const companion = dirichlet([1, 2, 3], sequence([0.5, 0.25, 0.5]));
    expect(companion).toEqual(out);
    expect(companion).not.toBe(out);
  });
});

describe('multivariateNormalInto / multivariateNormal', () => {
  test('diagonal covariance는 independent normal scaling을 적용한다', () => {
    const seq = [0.3, 0.7, 0.2, 0.9];
    const ref = sequence(seq);
    const z0 = standardNormal(ref);
    const z1 = standardNormal(ref);

    const out: number[] = [];
    multivariateNormalInto(
      out,
      [10, 20],
      [
        [4, 0],
        [0, 9],
      ],
      sequence(seq)
    );
    expect(out[0]).toBeCloseTo(10 + 2 * z0, 9);
    expect(out[1]).toBeCloseTo(20 + 3 * z1, 9);
  });

  test('correlated covariance는 lower Cholesky를 적용한다', () => {
    const seq = [0.3, 0.7, 0.2, 0.9];
    const ref = sequence(seq);
    const z0 = standardNormal(ref);
    const z1 = standardNormal(ref);
    const l11 = Math.sqrt(8.75);

    const out: number[] = [];
    multivariateNormalInto(
      out,
      [10, 20],
      [
        [4, 1],
        [1, 9],
      ],
      sequence(seq)
    );
    expect(out[0]).toBeCloseTo(10 + 2 * z0, 9);
    expect(out[1]).toBeCloseTo(20 + 0.5 * z0 + l11 * z1, 9);
  });

  test('rng=0 경계도 finite 결과를 반환한다', () => {
    const out: number[] = [];
    multivariateNormalInto(
      out,
      [10, 20],
      [
        [4, 0],
        [0, 9],
      ],
      sequence([0, 0.25, 0, 0.25])
    );
    expect(Number.isFinite(out[0])).toBe(true);
    expect(Number.isFinite(out[1])).toBe(true);
  });

  test('invalid mean/covariance shape는 RangeError를 던진다', () => {
    expect(() => multivariateNormal([], [])).toThrow(RangeError);
    expect(() => multivariateNormal([1, 2], [[1, 0]])).toThrow(RangeError);
    expect(() => multivariateNormal([1, 2], [[1, 0], [0]])).toThrow(RangeError);
    expect(() =>
      multivariateNormal(
        [1, Number.NaN],
        [
          [1, 0],
          [0, 1],
        ]
      )
    ).toThrow(RangeError);
    expect(() =>
      multivariateNormal(
        [1, 2],
        [
          [1, 0],
          [0, Number.NaN],
        ]
      )
    ).toThrow(RangeError);
  });

  test('non-symmetric covariance는 RangeError를 던진다', () => {
    expect(() =>
      multivariateNormal(
        [0, 0],
        [
          [1, 2],
          [3, 1],
        ]
      )
    ).toThrow(RangeError);
  });

  test('singular covariance는 RangeError를 던진다', () => {
    expect(() =>
      multivariateNormal(
        [0, 0],
        [
          [1, 1],
          [1, 1],
        ]
      )
    ).toThrow(RangeError);
  });

  test('invalid path에서 out을 수정하지 않는다', () => {
    const out = [9, 9];
    expect(() =>
      multivariateNormalInto(
        out,
        [1, 2],
        [
          [1, 2],
          [3, 1],
        ]
      )
    ).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });

  test('out === mean aliasing이 안전하다', () => {
    const m = [10, 20];
    const result = multivariateNormalInto(
      m,
      m,
      [
        [4, 0],
        [0, 9],
      ],
      sequence([0.5, 0.25, 0.5, 0.25])
    );
    expect(result).toBe(m);
    expect(m[0]).toBeCloseTo(10, 9);
    expect(m[1]).toBeCloseTo(20, 9);
  });

  test('companion은 새 배열을 반환하고 Into와 같은 값을 반환한다', () => {
    const seq = [0.3, 0.7, 0.2, 0.9];
    const out: number[] = [];
    multivariateNormalInto(
      out,
      [10, 20],
      [
        [4, 1],
        [1, 9],
      ],
      sequence(seq)
    );
    const companion = multivariateNormal(
      [10, 20],
      [
        [4, 1],
        [1, 9],
      ],
      sequence(seq)
    );
    expect(companion).toEqual(out);
    expect(companion).not.toBe(out);
  });
});
