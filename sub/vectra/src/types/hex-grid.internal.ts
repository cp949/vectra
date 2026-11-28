/** 육각 격자의 꼭짓점 방향이다. */
export type HexOrientation = 'pointy' | 'flat';

/** offset coordinate가 axial coordinate를 어떻게 shove하는지 정의하는 layout convention. default가 없다. */
export type HexOffsetLayout = 'odd-r' | 'even-r' | 'odd-q' | 'even-q';
