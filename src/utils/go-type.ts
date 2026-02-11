export type GoPlayer = 'black' | 'white';
export type GoStoneColor = 'black' | 'white';
export type GoLineColor = 'red' | 'blue';
export type GoAreaColor = 'red' | 'blue';

export type GoBoardSize = 9 | 19;
type GoPositionBase<Size extends GoBoardSize> =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | (Size extends 9 ? 9 : 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19);
export type GoPositionX<Size extends GoBoardSize = 19> = GoPositionBase<Size>;
export type GoPositionY<Size extends GoBoardSize = 19> = GoPositionBase<Size>;
export type GoPosition<Size extends GoBoardSize = 19> = {
  x: GoPositionX<Size>;
  y: GoPositionY<Size>;
};

export type GoStone<Size extends GoBoardSize = 19> = {
  readonly position: GoPosition<Size>;
  readonly player: GoPlayer;
};

export type GoDatum<Size extends GoBoardSize = 19> = GoStone<Size> & {
  readonly id?: number;
};
export type GoData<Size extends GoBoardSize = 19> = GoDatum<Size>[];

export type GoConnection<Size extends GoBoardSize = 19> = {
  readonly start: GoPosition<Size>;
  readonly end: GoPosition<Size>;
  readonly player: GoPlayer;
  readonly strength: number; // 1が強連結，0に近いほど繋がりが弱い
  // readonly diff: number; // TODO: 直前の手でのstrengthの差を表示する
};

export type GoArea<Size extends GoBoardSize = 19> = {
  readonly position: GoPosition<Size>;
  readonly player: GoPlayer;
  readonly strength: number; // 1が確定地，0に近いほど未確定
};
