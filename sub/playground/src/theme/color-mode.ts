/** 예제 앱에서 지원하는 색상 모드 */
export type PlaygroundColorMode = 'light' | 'dark';

/** color mode 저장소에서 필요한 최소 읽기 interface */
export interface ColorModeReader {
  getItem(key: string): string | null;
}

/** color mode 저장소에서 필요한 최소 쓰기 interface */
export interface ColorModeWriter {
  setItem(key: string, value: string): void;
}

/** localStorage 문자열이 지원하는 color mode인지 확인한다 */
export function isPlaygroundColorMode(value: string | null): value is PlaygroundColorMode {
  return value === 'light' || value === 'dark';
}

/** 저장된 color mode를 읽는다. 접근 실패나 알 수 없는 값은 undefined로 처리한다. */
export function readStoredColorMode(storage: ColorModeReader, key: string): PlaygroundColorMode | undefined {
  try {
    const value = storage.getItem(key);
    return isPlaygroundColorMode(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

/** color mode를 저장한다. 저장소 접근 실패는 앱 실행을 막지 않는다. */
export function writeStoredColorMode(storage: ColorModeWriter, key: string, mode: PlaygroundColorMode): void {
  try {
    storage.setItem(key, mode);
  } catch {
    // private mode 등 storage 접근 실패는 color mode persistence만 포기한다.
  }
}

/** 현재 color mode의 반대값을 반환한다 */
export function getNextColorMode(mode: PlaygroundColorMode): PlaygroundColorMode {
  return mode === 'light' ? 'dark' : 'light';
}
