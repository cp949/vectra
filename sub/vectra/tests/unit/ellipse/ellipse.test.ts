/** 타원 생성과 복사의 평평한 출력, 참조 및 반지름 보존을 검증한다. */
import { describe, expect, test } from 'vitest';
import { copyInto, createEllipse, ellipseFrom } from '../../../src/ellipse';

describe('타원 생성과 복사', () => {
  test('createEllipse는 매번 새 영 타원을 반환한다', () => {
    const ellipse = createEllipse();
    expect(ellipse).toEqual({ cx: 0, cy: 0, rx: 0, ry: 0 });
    expect(createEllipse()).not.toBe(ellipse);
  });

  test('ellipseFrom은 원본과 값이 같은 새 타원을 반환한다', () => {
    const ellipse = { cx: 3, cy: 4, rx: 5, ry: 2 };
    const result = ellipseFrom(ellipse);
    expect(result).toEqual(ellipse);
    expect(result).not.toBe(ellipse);
  });

  test('copyInto는 out에 중심과 반지름을 기록한다', () => {
    const ellipse = { cx: 3, cy: 4, rx: 5, ry: 2 };
    const out = createEllipse();
    expect(copyInto(out, ellipse)).toBe(out);
    expect(out).toEqual(ellipse);
  });

  test('copyInto는 입력과 출력이 같은 타원이어도 값을 보존한다', () => {
    const ellipse = { cx: 3, cy: 4, rx: 5, ry: 2 };
    expect(copyInto(ellipse, ellipse)).toBe(ellipse);
    expect(ellipse).toEqual({ cx: 3, cy: 4, rx: 5, ry: 2 });
  });

  test('copyInto는 0과 음수 반지름을 그대로 기록한다', () => {
    const ellipse = { cx: 3, cy: 4, rx: 0, ry: -2 };
    expect(copyInto(createEllipse(), ellipse)).toEqual(ellipse);
  });
});
