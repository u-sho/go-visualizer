import type { StoneData, StoneRec } from '@/components/GameBoard';

const getOppositeColor = (color: 'black' | 'white') =>
  color === 'black' ? 'white' : 'black';

export const calcGoConnects = (rec: ReadonlyArray<StoneData>) => {
  const connects: {
    start: StoneRec;
    end: StoneRec;
    stoneColor: 'black' | 'white';
    strength: number; // 1が強連結，0に近いほど繋がりが弱い
  }[] = [];
  for (const stone of rec) {
    const [x, y] = stone.position.split('-').map(Number);

    // 直線方向の繋がりを調べる
    const directDirections = [
      [1, 0],
      [0, 1]
    ];
    for (const [dx, dy] of directDirections) {
      const start = stone.position;
      const nx = x + dx;
      const ny = y + dy;
      const end = `${nx}-${ny}` as StoneRec;
      const isConnected = rec.some(
        ({ position, color }) => position === end && color === stone.color
      );
      if (isConnected) {
        connects.push({ start, end, stoneColor: stone.color, strength: 1 });
      }
    }

    // 斜め方向の繋がりを調べる
    const diagonalDirections = [
      [1, 1],
      [1, -1]
    ];
    for (const [dx, dy] of diagonalDirections) {
      const start = stone.position;
      const nx = x + dx;
      const ny = y + dy;
      const end = `${nx}-${ny}` as StoneRec;
      const isClosed = !!rec.find(
        ({ position, color }) => position === end && color === stone.color
      );
      if (!isClosed) continue;

      const rightPos = `${x + 1}-${y}` as StoneRec;
      const topPos = `${x}-${y - 1}` as StoneRec;
      const bottomPos = `${x}-${y + 1}` as StoneRec;
      const crossPos = [rightPos, dy === 1 ? bottomPos : topPos];
      const oppositeStones = rec.filter(
        ({ position, color }) =>
          crossPos.includes(position) && color === getOppositeColor(stone.color)
      );
      const is切り違い = oppositeStones.length === 2;
      const isConnected = isClosed && !is切り違い;
      if (isConnected) {
        connects.push({
          start,
          end,
          stoneColor: stone.color,
          strength: oppositeStones.length ? 0.5 : 1
        });
      }
    }

    // 一間トビの繋がりを調べる
    const oneStepDirections = [
      [0, 2], // 下
      [2, 0] // 右
    ];
    for (const [dx, dy] of oneStepDirections) {
      const start = stone.position;
      const nx = x + dx;
      const ny = y + dy;
      const end = `${nx}-${ny}` as StoneRec;
      const isClosed = rec.some(
        ({ position, color }) => position === end && color === stone.color
      );
      if (!isClosed) continue;

      const rightPos = `${x + 1}-${y}` as StoneRec;
      const bottomPos = `${x}-${y + 1}` as StoneRec;
      const betweenPos = dy ? bottomPos : rightPos;
      const betweenStones = rec.filter(
        ({ position }) => betweenPos === position
      );
      const hasSameColorStone = betweenStones.some(
        ({ color }) => color === stone.color
      );
      if (hasSameColorStone) continue;

      const isConnected = hasSameColorStone || betweenStones.length === 0;
      if (isConnected) {
        const rightTopPos = `${x + 1}-${y - 1}` as StoneRec;
        const rightBottomPos = `${x + 1}-${y + 1}` as StoneRec;
        const leftBottomPos = `${x - 1}-${y + 1}` as StoneRec;
        const betweenPos = [rightBottomPos, dy ? leftBottomPos : rightTopPos];
        const neerOppositeStones = rec.filter(
          ({ position, color }) =>
            betweenPos.includes(position) &&
            color === getOppositeColor(stone.color)
        );
        connects.push({
          start,
          end,
          stoneColor: stone.color,
          strength: 1 - 0.25 * neerOppositeStones.length
        });
      }
    }

    // ケイマの繋がりを調べる
    const knightDirections = [
      [1, -2], // 右上（上）
      [2, -1], // 右上（右）
      [2, 1], // 右下（右）
      [1, 2] // 右下（下）
    ];
    for (const [dx, dy] of knightDirections) {
      const start = stone.position;
      const nx = x + dx;
      const ny = y + dy;
      const end = `${nx}-${ny}` as StoneRec;
      const isClosed = rec.some(
        ({ position, color }) => position === end && color === stone.color
      );
      if (!isClosed) continue;

      const rightPos = `${x + 1}-${y}` as StoneRec;
      const topPos = `${x}-${y - 1}` as StoneRec;
      const bottomPos = `${x}-${y + 1}` as StoneRec;
      const rightTopPos = `${x + 1}-${y - 1}` as StoneRec;
      const rightBottomPos = `${x + 1}-${y + 1}` as StoneRec;
      const betweenPos = [
        dy > 0 ? rightBottomPos : rightTopPos,
        dx === 2 ? rightPos : dy > 0 ? bottomPos : topPos
      ];
      const betweenOppositeStones = rec.filter(
        ({ position, color }) =>
          betweenPos.includes(position) &&
          color === getOppositeColor(stone.color)
      );
      if (betweenOppositeStones.length === 2) continue;

      const isConnected = true;
      if (betweenOppositeStones.length === 1) {
        // TODO: 周囲の状況でstrengthを変える
        const oppositeStone = betweenOppositeStones[0];
        const hasSameColorStone = betweenPos.some(
          (pos) =>
            pos !== oppositeStone.position &&
            rec.some(
              ({ position, color }) => position === pos && color === stone.color
            )
        );
        if (hasSameColorStone) continue;
      }

      if (isConnected) {
        connects.push({
          start,
          end,
          stoneColor: stone.color,
          strength: 0.5 - 0.25 * betweenOppositeStones.length
        });
      }
    }
  }
  return connects;
};
