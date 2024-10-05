import type { GoConnection, GoData, GoPlayer, GoPosition } from './go-type';

const getOpposite = (player: GoPlayer): GoPlayer =>
  player === 'black' ? 'white' : 'black';

export const calcGoConnects = (rec: GoData) => {
  const connects: GoConnection[] = [];
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
      const end = `${nx}-${ny}` satisfies GoPosition;
      const isConnected = rec.some(
        ({ position, player }) => position === end && player === stone.player
      );
      if (isConnected) {
        connects.push({ start, end, player: stone.player, strength: 1 });
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
      const end = `${nx}-${ny}` satisfies GoPosition;
      const isClosed = !!rec.find(
        ({ position, player }) => position === end && player === stone.player
      );
      if (!isClosed) continue;

      const rightPos = `${x + 1}-${y}` satisfies GoPosition;
      const topPos = `${x}-${y - 1}` satisfies GoPosition;
      const bottomPos = `${x}-${y + 1}` satisfies GoPosition;
      const crossPos = [rightPos, dy === 1 ? bottomPos : topPos];
      const crossPosStones = rec.filter(({ position }) =>
        crossPos.includes(position)
      );
      const oppositeStones = crossPosStones.filter(
        ({ player }) => player === getOpposite(stone.player)
      );

      const isマゲ = oppositeStones.length === 1 && crossPosStones.length === 2;
      const is切り違い = oppositeStones.length === 2;
      const isConnected = isClosed && !is切り違い && !isマゲ;
      if (isConnected) {
        connects.push({
          start,
          end,
          player: stone.player,
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
      const end = `${nx}-${ny}` satisfies GoPosition;
      const isClosed = rec.some(
        ({ position, player }) => position === end && player === stone.player
      );
      if (!isClosed) continue;

      const rightPos = `${x + 1}-${y}` satisfies GoPosition;
      const bottomPos = `${x}-${y + 1}` satisfies GoPosition;
      const betweenPos = dy ? bottomPos : rightPos;
      const hasBetweenStones = rec.some(
        ({ position }) => betweenPos === position
      );
      if (hasBetweenStones) continue;

      const rightTopPos = `${x + 1}-${y - 1}` satisfies GoPosition;
      const rightBottomPos = `${x + 1}-${y + 1}` satisfies GoPosition;
      const leftBottomPos = `${x - 1}-${y + 1}` satisfies GoPosition;
      const betweenSidePos = [rightBottomPos, dy ? leftBottomPos : rightTopPos];
      const neerOppositeStones = rec.filter(
        ({ position, player }) =>
          betweenSidePos.includes(position) &&
          player === getOpposite(stone.player)
      );
      connects.push({
        start,
        end,
        player: stone.player,
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
      const end = `${nx}-${ny}` satisfies GoPosition;
      const isClosed = rec.some(
        ({ position, player }) => position === end && player === stone.player
      );
      if (!isClosed) continue;

      const rightPos = `${x + 1}-${y}` satisfies GoPosition;
      const topPos = `${x}-${y - 1}` satisfies GoPosition;
      const bottomPos = `${x}-${y + 1}` satisfies GoPosition;
      const rightTopPos = `${x + 1}-${y - 1}` satisfies GoPosition;
      const rightBottomPos = `${x + 1}-${y + 1}` satisfies GoPosition;
      const betweenPos = [
        dy > 0 ? rightBottomPos : rightTopPos,
        dx === 2 ? rightPos : dy > 0 ? bottomPos : topPos
      ];
      const betweenOppositeStones = rec.filter(
        ({ position, player }) =>
          betweenPos.includes(position) && player === getOpposite(stone.player)
      );
      if (betweenOppositeStones.length === 2) continue;

      if (betweenOppositeStones.length === 1) {
        // TODO: 周囲の状況でstrengthを変える
        const oppositeStone = betweenOppositeStones[0];
        const hasSameColorStone = betweenPos.some(
          (pos) =>
            pos !== oppositeStone.position &&
            rec.some(
              ({ position, player }) =>
                position === pos && player === stone.player
            )
        );
        if (hasSameColorStone) continue;

        const sidePositions = [
          dx === 1 ? `${x + dx}-${y}` : `${x}-${y + dy}`,
          dx === 1 ? `${x}-${y + dy}` : `${x + dx}-${y}`
        ] satisfies GoPosition[];
        const hasSideOppositeStones = rec.some(
          ({ position, player }) =>
            sidePositions.includes(position) &&
            player === getOpposite(stone.player)
        );
        if (hasSideOppositeStones) continue;
      }

      connects.push({
        start,
        end,
        player: stone.player,
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
      const end = `${nx}-${ny}` satisfies GoPosition;
      const isClosed = rec.some(
        ({ position, player }) => position === end && player === stone.player
      );
      if (!isClosed) continue;

      const nextPos: GoPosition = dx > 0 ? `${x + 1}-${y}` : `${x}-${y + 1}`;
      const nextNextPos: GoPosition =
        dx > 0 ? `${x + 2}-${y}` : `${x}-${y + 2}`;
      const betweenPos = [nextPos, nextNextPos];
      const hasBetweenOppositeStones = rec.some(
        ({ position, player }) =>
          betweenPos.includes(position) && player === getOpposite(stone.player)
      );
      if (hasBetweenOppositeStones) continue;

      let strength = 0.75;
      const sidePositions = [
        `${x + dy / 2}-${y + dx / 2}`,
        `${x - dy / 2}-${y - dx / 2}`,
        `${x + dx + dy / 2}-${y + dy + dx / 2}`,
        `${x + dx - dy / 2}-${y + dy - dx / 2}`
      ] satisfies GoPosition[];
      const nextSidePositions = [
        `${x + 1}-${y + 1}`,
        dx > 0 ? `${x + 1}-${y - 1}` : `${x - 1}-${y + 1}`
      ] satisfies GoPosition[];
      const nextNextSidePositions = [
        dx > 0 ? `${x + 2}-${y + 1}` : `${x + 1}-${y + 2}`,
        dx > 0 ? `${x + 2}-${y - 1}` : `${x - 1}-${y + 2}`
      ] satisfies GoPosition[];
      const neerPositions = [
        ...sidePositions,
        ...nextSidePositions,
        ...nextNextSidePositions
      ];
      const neerOppositeStones = rec.filter(
        ({ position, player }) =>
          neerPositions.includes(position) &&
          player === getOpposite(stone.player)
      );
      if (neerOppositeStones.length) {
        strength -= 0.2 * neerOppositeStones.length;
      }

      connects.push({
        start,
        end,
        player: stone.player,
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
      const end = `${nx}-${ny}` satisfies GoPosition;
      const isClosed = rec.some(
        ({ position, player }) => position === end && player === stone.player
      );
      if (!isClosed) continue;

      const strength = 0.5;
      const betweenPositions = [
        dx === 1 ? `${x}-${y + dy / 3}` : `${x + dx / 3}-${y}`,
        dx === 1 ? `${x + dx}-${y + dy / 3}` : `${x + dx / 3}-${y + dy}`,
        dx === 1 ? `${x}-${y + (2 * dy) / 3}` : `${x + 2}-${y}`,
        dx === 1 ? `${x + dx}-${y + (2 * dy) / 3}` : `${x + 2}-${y + dy}`
      ] satisfies GoPosition[];
      const hasBetweenStones = rec.some(({ position }) =>
        betweenPositions.includes(position)
      );
      if (hasBetweenStones) continue;

      connects.push({
        start,
        end,
        player: stone.player,
        strength
      });
    }
  }
  return connects;
};
