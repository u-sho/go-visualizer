export type MoveDistance = { dx: number; dy: number };
export type MoveBase =
  | typeof MOVE_上
  | typeof MOVE_右
  | typeof MOVE_左
  | typeof MOVE_下;

/* oxfmt-ignore */ export const MOVE_上 = { dx:  0, dy: -1 } as const satisfies MoveDistance;
/* oxfmt-ignore */ export const MOVE_右 = { dx:  1, dy:  0 } as const satisfies MoveDistance;
/* oxfmt-ignore */ export const MOVE_左 = { dx: -1, dy:  0 } as const satisfies MoveDistance;
/* oxfmt-ignore */ export const MOVE_下 = { dx:  0, dy:  1 } as const satisfies MoveDistance;

/* oxfmt-ignore */ export const MOVE_右上 = { dx: 1, dy: -1 } as const satisfies MoveDistance;
/* oxfmt-ignore */ export const MOVE_右下 = { dx: 1, dy:  1 } as const satisfies MoveDistance;

export const MOVES_隣接 = [
  MOVE_右,
  MOVE_下
] as const satisfies ReadonlyArray<MoveDistance>;

export const MOVES_コスミ = [
  MOVE_右上,
  MOVE_右下
] as const satisfies ReadonlyArray<MoveDistance>;

export const MOVES_一間トビ = [
  { dx: 2, dy: 0 } /** 右 */,
  { dx: 0, dy: 2 } /** 下 */
] as const satisfies ReadonlyArray<MoveDistance>;

/* oxfmt-ignore */
export const MOVES_ケイマ = [
  { dx: 1, dy: -2 } /** 右上（上） */,
  { dx: 2, dy: -1 } /** 右上（右） */,
  { dx: 2, dy:  1 } /** 右下（右） */,
  { dx: 1, dy:  2 } /** 右下（下） */
] as const satisfies ReadonlyArray<MoveDistance>;

export const MOVES_二間トビ = [
  { dx: 3, dy: 0 } /** 右 */,
  { dx: 0, dy: 3 } /** 下 */
] as const satisfies ReadonlyArray<MoveDistance>;

/* oxfmt-ignore */
export const MOVES_大ゲイマ = [
  { dx: 1, dy: -3 } /** 右上（上） */,
  { dx: 3, dy: -1 } /** 右上（右） */,
  { dx: 3, dy:  1 } /** 右下（右） */,
  { dx: 1, dy:  3 } /** 右下（下） */
] as const satisfies ReadonlyArray<MoveDistance>;

export function addMoves(move1: MoveBase, move2: MoveBase, move3?: MoveBase) {
  const dx = move1.dx + move2.dx + (move3?.dx ?? 0);
  const dy = move1.dy + move2.dy + (move3?.dy ?? 0);
  return { dx, dy } as const satisfies MoveDistance;
}
