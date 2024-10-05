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

    // ナラビ・オシ・ノビ・マゲ・・・の繋がりを調べる
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

    // コスミ・ハネ・切り違いの繋がりを調べる
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
      const hasBetweenStones = rec.some(
        ({ position }) => betweenPos === position
      );
      if (hasBetweenStones) continue;

      const rightTopPos = `${x + 1}-${y - 1}` as StoneRec;
      const rightBottomPos = `${x + 1}-${y + 1}` as StoneRec;
      const leftBottomPos = `${x - 1}-${y + 1}` as StoneRec;
      const betweenSidePos = [rightBottomPos, dy ? leftBottomPos : rightTopPos];
      const neerOppositeStones = rec.filter(
        ({ position, color }) =>
          betweenSidePos.includes(position) &&
          color === getOppositeColor(stone.color)
      );
      connects.push({
        start,
        end,
        stoneColor: stone.color,
        strength: 1 - 0.25 * neerOppositeStones.length
      });
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

        const sidePositions = [
          dx === 1
            ? (`${x + dx}-${y}` as StoneRec)
            : (`${x}-${y + dy}` as StoneRec),
          dx === 1
            ? (`${x}-${y + dy}` as StoneRec)
            : (`${x + dx}-${y}` as StoneRec)
        ];
        const hasSideOppositeStones = rec.some(
          ({ position, color }) =>
            sidePositions.includes(position) &&
            color === getOppositeColor(stone.color)
        );
        if (hasSideOppositeStones) continue;
      }

      connects.push({
        start,
        end,
        stoneColor: stone.color,
        strength: 0.5 - 0.25 * betweenOppositeStones.length
      });
    }

    // 二間トビ・二間ビラキの繋がりを調べる
    const twoStepDirections = [
      [0, 3], // 下
      [3, 0] // 右
    ];
    for (const [dx, dy] of twoStepDirections) {
      const start = stone.position;
      const nx = x + dx;
      const ny = y + dy;
      const end = `${nx}-${ny}` as StoneRec;
      const isClosed = rec.some(
        ({ position, color }) => position === end && color === stone.color
      );
      if (!isClosed) continue;

      const nextPos =
        dx > 0 ? (`${x + 1}-${y}` as StoneRec) : (`${x}-${y + 1}` as StoneRec);
      const nextNextPos =
        dx > 0 ? (`${x + 2}-${y}` as StoneRec) : (`${x}-${y + 2}` as StoneRec);
      const betweenPos = [nextPos, nextNextPos];
      const hasBetweenOppositeStones = rec.some(
        ({ position, color }) =>
          betweenPos.includes(position) &&
          color === getOppositeColor(stone.color)
      );
      if (hasBetweenOppositeStones) continue;

      let strength = 0.75;
      const sidePositions = [
        `${x + dy / 2}-${y + dx / 2}` as StoneRec,
        `${x - dy / 2}-${y - dx / 2}` as StoneRec,
        `${x + dx + dy / 2}-${y + dy + dx / 2}` as StoneRec,
        `${x + dx - dy / 2}-${y + dy - dx / 2}` as StoneRec
      ];
      const nextSidePositions = [
        `${x + 1}-${y + 1}` as StoneRec,
        dx > 0
          ? (`${x + 1}-${y - 1}` as StoneRec)
          : (`${x - 1}-${y + 1}` as StoneRec)
      ];
      const nextNextSidePositions = [
        dx > 0
          ? (`${x + 2}-${y + 1}` as StoneRec)
          : (`${x + 1}-${y + 2}` as StoneRec),
        dx > 0
          ? (`${x + 2}-${y - 1}` as StoneRec)
          : (`${x - 1}-${y + 2}` as StoneRec)
      ];
      const neerPositions = [
        ...sidePositions,
        ...nextSidePositions,
        ...nextNextSidePositions
      ];
      const neerOppositeStones = rec.filter(
        ({ position, color }) =>
          neerPositions.includes(position) &&
          color === getOppositeColor(stone.color)
      );
      if (neerOppositeStones.length) {
        strength -= 0.2 * neerOppositeStones.length;
      }

      connects.push({
        start,
        end,
        stoneColor: stone.color,
        strength
      });
    }

    // オオゲイマの繋がりを調べる
    const bigKnightDirections = [
      [1, -3], // 右上（上）
      [3, -1], // 右上（右）
      [3, 1], // 右下（右）
      [1, 3] // 右下（下）
    ];
    for (const [dx, dy] of bigKnightDirections) {
      const start = stone.position;
      const nx = x + dx;
      const ny = y + dy;
      const end = `${nx}-${ny}` as StoneRec;
      const isClosed = rec.some(
        ({ position, color }) => position === end && color === stone.color
      );
      if (!isClosed) continue;

      const strength = 0.5;
      const betweenPositions = [
        dx === 1 ? `${x}-${y + dy / 3}` : `${x + dx / 3}-${y}`,
        dx === 1 ? `${x + dx}-${y + dy / 3}` : `${x + dx / 3}-${y + dy}`,
        dx === 1 ? `${x}-${y + (2 * dy) / 3}` : `${x + 2}-${y}`,
        dx === 1 ? `${x + dx}-${y + (2 * dy) / 3}` : `${x + 2}-${y + dy}`
      ] satisfies StoneRec[];
      const hasBetweenOppositeStones = rec.some(
        ({ position, color }) =>
          betweenPositions.includes(position) &&
          color === getOppositeColor(stone.color)
      );
      if (hasBetweenOppositeStones) continue;

      connects.push({
        start,
        end,
        stoneColor: stone.color,
        strength
      });
    }
  }
  return connects;
};
