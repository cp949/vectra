/** 순서가 고정된 난수 시퀀스를 반환하는 테스트용 rng 생성 헬퍼 */
export const sequence = (values: readonly number[]) => {
  let i = 0;
  return () => values[i++ % values.length] ?? 0;
};
