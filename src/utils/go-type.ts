export type GoPlayer = 'black' | 'white';
export type GoStoneColor = 'black' | 'white';
export type GoLineColor = 'red' | 'blue';
export type GoAreaColor = 'red' | 'blue';

export type GoPosition = `${number}-${number}`;

export type GoStone = {
  readonly position: GoPosition;
  readonly player: GoPlayer;
};

export type GoData = (GoStone & { readonly id?: number })[];

export type GoConnection = {
  readonly start: GoPosition;
  readonly end: GoPosition;
  readonly player: GoPlayer;
  readonly strength: number; // 1が強連結，0に近いほど繋がりが弱い
};

export type GoArea = {
  readonly position: GoPosition;
  readonly player: GoPlayer;
  readonly strength: number; // 1が確定地，0に近いほど未確定
};
