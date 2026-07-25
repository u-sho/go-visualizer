'use strict';

import {
  MOVE_上,
  MOVE_右,
  MOVE_下,
  MOVES_隣接,
  MOVES_コスミ,
  MOVES_一間トビ,
  MOVES_ケイマ,
  MoveDistance,
  MOVE_右下,
  MOVE_右上,
  MOVES_二間トビ,
  MOVES_大ゲイマ
} from './moves';
import type {
  GoConnection,
  GoData,
  GoBoardSize,
  GoPlayer,
  GoPosition,
  GoPositionX,
  GoPositionY
} from './go-type';

const getOpposite = (player: GoPlayer): GoPlayer =>
  player === 'black' ? 'white' : 'black';

const isOnBoard = (x: number): x is GoPositionX<19> | GoPositionY<19> =>
  Number.isSafeInteger(x) && 1 <= x && x <= 19;

const isSamePosition = <Size extends GoBoardSize>(
  pos1: Readonly<GoPosition<Size>>,
  pos2: Readonly<GoPosition<Size>>
) => pos1.x === pos2.x && pos1.y === pos2.y;

/** 指定位置に移動（盤外の場合はnull） */
const addPosition = (
  pos: GoPosition<19>,
  dx: number,
  dy: number
): GoPosition<19> | null => {
  const x = pos.x + dx;
  const y = pos.y + dy;
  if (!isOnBoard(x) || !isOnBoard(y)) return null;
  return { x, y } satisfies GoPosition<19>;
};

export const calcGoConnects = (rec: Readonly<GoData>) => {
  const connects: GoConnection[] = [];

  for (const stone of rec) {
    const start = stone.position;

    // ナラビ・オシ・ノビ・マゲ・・・の繋がりを調べる（→と↓）
    for (const { dx, dy } of MOVES_隣接) {
      const end = addPosition(start, dx, dy);
      if (!end) continue;

      const hasConnectedStone = rec.some(
        ({ position, player }) =>
          isSamePosition(position, end) && player === stone.player
      );
      if (!hasConnectedStone) continue;

      connects.push({
        start,
        end,
        player: stone.player,
        strength: 1
      });
    }

    // コスミ・ハネ・切り違いの繋がりを調べる（↗と↘）
    for (const { dx, dy } of MOVES_コスミ) {
      const end = addPosition(start, dx, dy);
      if (!end) continue;

      const hasコスミpositionStone = rec.some(
        ({ position, player }) =>
          isSamePosition(position, end) && player === stone.player
      );
      if (!hasコスミpositionStone) continue;

      // 切り違いの位置にある石を調べる（↘に対して→と↓，↗に対して→と↑）
      const MOVES_キリチガイ = [
        MOVE_右,
        { dx: 0, dy }
      ] as const satisfies ReadonlyArray<MoveDistance>;
      const sidePositionStones = rec.filter(({ position }) =>
        MOVES_キリチガイ.some(({ dx, dy }) => {
          const target = addPosition(start, dx, dy);
          return target && isSamePosition(target, position);
        })
      );
      const キリチガイpositionOppositeStones = sidePositionStones.filter(
        ({ player }) => player === getOpposite(stone.player)
      );
      const マゲpositionStones = sidePositionStones.filter(
        ({ player }) => player === stone.player
      );

      // キリチガイ・マゲを含めない（アキ三角は含める）
      const isキリチガイ = キリチガイpositionOppositeStones.length === 2;
      const isマゲ =
        マゲpositionStones.length === 1 &&
        キリチガイpositionOppositeStones.length === 1;
      const isNotConnected = isキリチガイ || isマゲ;
      if (isNotConnected) continue;

      connects.push({
        start,
        end,
        player: stone.player,
        strength: キリチガイpositionOppositeStones.length > 0 ? 0.5 : 1
      });
    }

    // 一間トビの繋がりを調べる（⇢と⇣）
    for (const { dx, dy } of MOVES_一間トビ) {
      const end = addPosition(start, dx, dy);
      if (!end) continue;

      const has一間トビpositionStone = rec.some(
        ({ position, player }) =>
          isSamePosition(position, end) && player === stone.player
      );
      if (!has一間トビpositionStone) continue;

      // ワリコミの位置にある石を調べる
      const MOVE_ワリコミ = dx ? MOVE_右 : MOVE_下;
      const hasワリコミpositionStone = rec.some(({ position }) => {
        const target = addPosition(start, MOVE_ワリコミ.dx, MOVE_ワリコミ.dy);
        return target && isSamePosition(position, target);
      });
      if (hasワリコミpositionStone) continue;

      // ノゾキの位置にある石を調べる
      const MOVES_ノゾキ = [
        MOVE_右下,
        { dx: dx - 1, dy: dy - 1 } // ⇢なら↗，⇣なら↙
      ] as const satisfies ReadonlyArray<MoveDistance>;
      const ノゾキpositions = MOVES_ノゾキ.map(({ dx, dy }) =>
        addPosition(start, dx, dy)
      ).filter((pos) => pos !== null);
      const ノゾキpositionOppositeStones = rec.filter(
        ({ position, player }) =>
          ノゾキpositions.some((pos) => isSamePosition(pos, position)) &&
          player === getOpposite(stone.player)
      );

      connects.push({
        start,
        end,
        player: stone.player,
        strength: 1 - 0.25 * ノゾキpositionOppositeStones.length
      });
    }

    // ケイマの繋がりを調べる（4方向）
    for (const { dx, dy } of MOVES_ケイマ) {
      const end = addPosition(start, dx, dy);
      if (!end) continue;

      const hasケイマpositionStone = rec.some(
        ({ position, player }) =>
          isSamePosition(position, end) && player === stone.player
      );
      if (!hasケイマpositionStone) continue;

      // ツケコシ，ツキダシの位置にある石を調べる
      const betweenMoves = [
        dy > 0 ? MOVE_右下 : MOVE_右上,
        dx === 2 ? MOVE_右 : dy > 0 ? MOVE_下 : MOVE_上
      ] as const;
      const betweenPositions = betweenMoves.map(({ dx, dy }) =>
        addPosition(start, dx, dy)!
      );
      const sidePositions = [
        addPosition(start, 0, dy)!,
        addPosition(start, dx, 0)!
      ];

      /** 無
       * ○⦿＊　　○┼＊　　○┼＊
       * ＊⦿○　　＊○○　　＊●○
       */
      const betweenStones = rec.filter(({ position }) =>
        betweenPositions.some((pos) => isSamePosition(pos, position))
      );
      if (betweenStones.length) continue;

      /** 接
       * ○┼┼
       * ┼┼○
       */
      const sideStones = rec.filter(({ position }) =>
        sidePositions.some((pos) => isSamePosition(pos, position))
      );
      if (sideStones.length === 0) {
        connects.push({
          start,
          end,
          player: stone.player,
          strength: 0.5
        });
        continue;
      }

      /** タケフ
       * ○┼○
       * ○┼○
       */
      const sideSameColorStones = sideStones.filter(
        ({ player }) => player === stone.player
      );
      if (sideSameColorStones.length === 2) {
        connects.push({
          start,
          end,
          player: stone.player,
          strength: 1
        });
        continue;
      }

      /** 微強
       * ○┼○
       * ┼┼○
       */
      if (sideSameColorStones.length === sideStones.length) {
        connects.push({
          start,
          end,
          player: stone.player,
          strength: 0.75
        });
        continue;
      }

      /** 接
       * ○┼○
       * ●┼○
       */
      if (sideSameColorStones.length === 1) {
        connects.push({
          start,
          end,
          player: stone.player,
          strength: 0.5
        });
        continue;
      }

      /** 無
       * ○┼●
       * ●┼○
       */
      if (sideSameColorStones.length === 0) continue;
    }

    // 二間トビ・二間ビラキの繋がりを調べる
    for (const { dx, dy } of MOVES_二間トビ) {
      const end = addPosition(start, dx, dy);
      if (!end) continue;

      const has二間トビpositionStone = rec.some(
        ({ position, player }) =>
          isSamePosition(position, end) && player === stone.player
      );
      if (!has二間トビpositionStone) continue;

      const betweenPositions = [
        addPosition(start, dx / 3, dy / 3)!,
        addPosition(start, (2 * dx) / 3, (2 * dy) / 3)!
      ] satisfies GoPosition[];
      const hasBetweenStone = rec.some(({ position }) =>
        betweenPositions.some((target) => isSamePosition(position, target))
      );
      if (hasBetweenStone) continue;

      const nearPositions = [
        addPosition(start, dx / 3 + (dx ? 0 : 1), dy / 3 + (dy ? 0 : 1)),
        addPosition(start, dx / 3 + (dx ? 0 : -1), dy / 3 + (dy ? 0 : -1)),
        addPosition(
          start,
          (2 * dx) / 3 + (dx ? 0 : 1),
          (2 * dy) / 3 + (dy ? 0 : 1)
        ),
        addPosition(
          start,
          (2 * dx) / 3 + (dx ? 0 : -1),
          (2 * dy) / 3 + (dy ? 0 : -1)
        )
      ].filter((pos) => pos !== null);
      const nearStones = rec.filter(({ position }) =>
        nearPositions.some((pos) => isSamePosition(position, pos))
      );
      const nearOppositeStones = nearStones.filter(
        ({ player }) => player === getOpposite(stone.player)
      );
      const strength =
        0.5 + 0.25 * (nearStones.length - 2 * nearOppositeStones.length);
      if (strength <= 0) continue;
      connects.push({
        start,
        end,
        player: stone.player,
        strength
      });
    }

    // オオゲイマの繋がりを調べる
    for (const { dx, dy } of MOVES_大ゲイマ) {
      const end = addPosition(start, dx, dy);
      if (!end) continue;

      const has大ゲイマpositionStone = rec.some(
        ({ position, player }) =>
          isSamePosition(position, end) && player === stone.player
      );
      if (!has大ゲイマpositionStone) continue;

      const betweenPositions = [
        addPosition(start, Math.sign(dx), Math.sign(dy))!,
        addPosition(start, Math.round(dx / 3), Math.round(dy / 3))!,
        addPosition(
          start,
          Math.round(dx / 3) + Math.sign(dx),
          Math.round(dy / 3) + Math.sign(dy)
        )!,
        addPosition(
          start,
          Math.sign(dx) * Math.floor((2 * Math.abs(dx)) / 3),
          Math.sign(dy) * Math.floor((2 * Math.abs(dy)) / 3)
        )!
      ] as const satisfies GoPosition[];
      const betweenStones = rec.filter(({ position }) =>
        betweenPositions.some((pos) => isSamePosition(position, pos))
      );
      if (betweenStones.length) continue;

      const sidePositions = [
        addPosition(start, dx, 0)!,
        addPosition(start, 0, dy)!
      ] as const satisfies GoPosition[];
      const sideStones = rec.filter(({ position }) =>
        sidePositions.some((pos) => isSamePosition(position, pos))
      );
      const sideSameColorStones = sideStones.filter(
        ({ player }) => player === stone.player
      );

      let strength = 0.5;
      if (sideStones.length) {
        if (sideSameColorStones.length < sideStones.length) continue;
        else strength = 0.75;
      }
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
