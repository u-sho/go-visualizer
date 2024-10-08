'use client';

import type {
  GoAreaColor,
  GoData,
  GoLineColor,
  GoPlayer,
  GoPosition,
  GoStone,
  GoStoneColor
} from '@/utils/go-type';

import { calcGoConnects } from '@/utils/go-connect';
import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  type MouseEventHandler
} from 'react';
import { env } from 'process';

type CanvasProps = {
  canvasWidth: number;
  canvasHeight: number;
  paddingX: number;
  paddingY: number;
  size: number;
  isVisualized: boolean;
  stoneColor?: GoStoneColor;
};

export const getStoneColor = (player: GoPlayer): GoStoneColor => player;
export const getLineColor = (player: GoPlayer): GoLineColor =>
  player === 'black' ? 'red' : 'blue';
export const getAreaColor = (player: GoPlayer): GoAreaColor =>
  player === 'black' ? 'red' : 'blue';

export const GameBoard = forwardRef(function GameBoard(
  {
    canvasWidth,
    canvasHeight,
    paddingX,
    paddingY,
    size,
    isVisualized,
    stoneColor = 'black'
  }: Readonly<CanvasProps>,
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [distanceX, setDistanceX] = useState(
    (canvasWidth - 2 * paddingX) / (size - 1)
  );
  const [distanceY, setDistanceY] = useState(
    (canvasHeight - 2 * paddingY) / (size - 1)
  );
  const [gameRecord, setGameRecord] = useState<GoData>([]);

  useEffect(() => {
    setDistanceX((canvasWidth - 2 * paddingX) / (size - 1));
    setDistanceY((canvasHeight - 2 * paddingY) / (size - 1));
  }, [canvasHeight, canvasWidth, paddingX, paddingY, size]);

  const getCtx = (): CanvasRenderingContext2D => {
    const canvas: HTMLCanvasElement | null = canvasRef.current;
    if (!canvas?.getContext) throw new Error('Something may happen.');
    return canvas.getContext('2d') as CanvasRenderingContext2D;
  };

  type Context2DCallbackOptions = {
    fgColor: string;
    bgColor: string;
    startX: number;
    startY: number;
  } & (
    | {
        endX: number;
        endY: number;
      }
    | {
        width: number;
        height: number;
      }
  );

  const drawRect = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      { bgColor = 'white' }: Pick<Partial<Context2DCallbackOptions>, 'bgColor'>
    ) => {
      const rect = new Path2D();
      rect.rect(0, 0, canvasWidth, canvasHeight);
      ctx.beginPath();
      ctx.fillStyle = bgColor;
      ctx.fill(rect);
    },
    [canvasWidth, canvasHeight]
  );

  const drawLine = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      { fgColor = 'black' }: Pick<Partial<Context2DCallbackOptions>, 'fgColor'>
    ) => {
      ctx.beginPath();
      ctx.strokeStyle = fgColor;
      ctx.lineWidth = 2;
      for (let i = 0; i < size; i++) {
        const y = paddingY + i * distanceY;
        const x = paddingX + i * distanceX;
        ctx.moveTo(paddingX, y);
        ctx.lineTo(canvasWidth - paddingX, y);
        ctx.moveTo(x, paddingY);
        ctx.lineTo(x, canvasHeight - paddingY);
      }
      ctx.stroke();
    },
    [size, canvasWidth, canvasHeight, paddingX, paddingY, distanceX, distanceY]
  );

  const drawArc = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      { fgColor = 'black' }: Pick<Partial<Context2DCallbackOptions>, 'fgColor'>
    ) => {
      if (![9, 19].includes(size)) return;
      const radius = 5;
      const startAngle = 0;
      const endAngle = Math.PI * 2;
      ctx.beginPath();
      ctx.fillStyle = fgColor;
      let arcPos = [
        [4, 4],
        [10, 4],
        [16, 4],
        [4, 10],
        [10, 10],
        [16, 10],
        [4, 16],
        [10, 16],
        [16, 16]
      ];
      if (size === 9) arcPos = [[5, 5]];
      for (const pos of arcPos) {
        const y = paddingY + (pos[1] - 1) * distanceY;
        const x = paddingX + (pos[0] - 1) * distanceX;
        ctx.moveTo(x, y);
        ctx.arc(x, y, radius, startAngle, endAngle, true);
      }
      ctx.fill();
    },
    [paddingX, paddingY, size, distanceX, distanceY]
  );

  const drawStones = useCallback(() => {
    const ctx = getCtx();
    const radius = Math.min(distanceX, distanceY) / 2 - 2;
    const startAngle = 0;
    const endAngle = Math.PI * 2;

    for (const { position, player } of gameRecord) {
      const [stoneX, stoneY] = position.split('-').map(Number);
      const y = paddingY + stoneY * distanceY;
      const x = paddingX + stoneX * distanceX;

      // 石の塗りつぶし描画
      ctx.beginPath();
      ctx.arc(x, y, radius, startAngle, endAngle, true);
      ctx.fillStyle = getStoneColor(player);
      ctx.fill();

      // 境界線の描画
      ctx.beginPath();
      ctx.arc(x, y, radius, startAngle, endAngle, true);
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [gameRecord, distanceX, distanceY, paddingX, paddingY]);

  const drawVisualLine = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!isVisualized) return;

      const connects = calcGoConnects(gameRecord);
      if (env.DEV_MODE) {
        console.log(gameRecord);
        console.table(connects);
      }
      for (const connect of connects) {
        const [startX, startY] = connect.start.split('-').map(Number);
        const [endX, endY] = connect.end.split('-').map(Number);
        const start = [
          paddingX + startX * distanceX,
          paddingY + startY * distanceY
        ];
        const end = [paddingX + endX * distanceX, paddingY + endY * distanceY];
        ctx.beginPath();
        ctx.strokeStyle =
          connect.player === 'black'
            ? `rgba(255,0,0,${connect.strength})`
            : `rgba(0,0,255,${connect.strength})`;
        ctx.lineWidth = 2;
        ctx.moveTo(start[0], start[1]);
        ctx.lineTo(end[0], end[1]);
        ctx.stroke();
      }
    },
    [isVisualized, gameRecord, paddingX, paddingY, distanceX, distanceY]
  );

  const drawAll = useCallback(() => {
    const ctx = getCtx();
    drawRect(ctx, {});
    drawLine(ctx, {});
    drawArc(ctx, { fgColor: 'gray' });
    drawStones();
    drawVisualLine(ctx);
  }, [drawRect, drawLine, drawArc, drawStones, drawVisualLine]);

  useEffect(() => drawAll(), [drawAll]);

  const handleClick: MouseEventHandler<HTMLCanvasElement> = (e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let stoneX = 0,
      stoneY = 0;
    for (let i = 0; i < size; i++) {
      const lineY = paddingY + i * distanceY;
      const lineX = paddingX + i * distanceX;
      if (lineX - distanceX / 2 <= x && x <= lineX + distanceX / 2) stoneX = i;
      if (lineY - distanceY / 2 <= y && y <= lineY + distanceY / 2) stoneY = i;
    }

    const stoneRec: GoPosition = `${stoneX}-${stoneY}`;
    if (!gameRecord.some((record) => record.position === stoneRec)) {
      setGameRecord((prev) => [
        ...prev,
        { position: stoneRec, player: stoneColor } satisfies GoStone
      ]);
      drawAll();
    }
  };

  // 直近の石を削除する関数
  const deleteLastStone = () => {
    setGameRecord((prev) => {
      if (prev.length === 0) return prev;
      const newRecord = prev.slice(0, -1);
      drawAll(); // 盤面を再描画
      return newRecord;
    });
  };

  // refを使ってdeleteLastStoneを外部から呼び出せるようにする
  useImperativeHandle(ref, () => ({
    deleteLastStone
  }));

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      onClick={handleClick}
    />
  );
});
