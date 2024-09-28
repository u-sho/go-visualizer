"use client";

import { useCallback, useEffect, useRef } from "react";

type CanvasProps = {
  canvasWidth: number;
  canvasHeight: number;paddingX: number;paddingY: number;
  size: number;
};

export const GameBoard = (props: CanvasProps) => {
  const {
    canvasWidth,
    canvasHeight,
    paddingX,
    paddingY,
    size,
  } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getCtx = (): CanvasRenderingContext2D => {
    const canvas: HTMLCanvasElement | null = canvasRef.current;
    if (!canvas?.getContext) throw new Error("Something may happen.");
    return canvas.getContext("2d") as CanvasRenderingContext2D;
  };

  type Context2DCallbackOptions = {
    fgColor: string;
    bgColor: string;
    startX: number;
    startY: number;
  }&({
    endX: number;
    endY: number;
  }|{
    width: number;
    height: number;
  });

  const drawRect = useCallback(
    (ctx: CanvasRenderingContext2D, {bgColor='white'}: Pick<Partial<Context2DCallbackOptions>, 'bgColor'>) => {
      const rect = new Path2D();
      rect.rect(0, 0, canvasWidth, canvasHeight);
      ctx.beginPath();
      ctx.fillStyle = bgColor;
      ctx.fill(rect);
    },
    [canvasWidth,canvasHeight]
  );

  const drawLine = useCallback(
    (ctx: CanvasRenderingContext2D, {fgColor='black'}: Pick<Partial<Context2DCallbackOptions>, 'fgColor'>) => {
      ctx.beginPath();
      ctx.strokeStyle = fgColor;
      ctx.lineWidth = 2;
      const distanceX = (canvasWidth - 2*paddingX)/(size-1);
      const distanceY = (canvasHeight - 2*paddingY)/(size-1);
      for (let i = 0; i < size; i++) {
        const y = paddingY + i * distanceY;
        const x = paddingX + i * distanceX;
        ctx.moveTo(paddingX, y);
        ctx.lineTo(canvasWidth-paddingX, y);
        ctx.moveTo(x, paddingY);
        ctx.lineTo(x, canvasHeight-paddingY);
      }
      ctx.stroke();
    },
    [size, canvasWidth, canvasHeight, paddingX, paddingY]
  );

  const drawArc = useCallback(
    (ctx: CanvasRenderingContext2D, {fgColor='black'}: Pick<Partial<Context2DCallbackOptions>, 'fgColor'>) => {
      if (size!==19)return;
      const radius = 5;
      const startAngle = 0;
      const endAngle = Math.PI * 2;
      ctx.beginPath();
      ctx.fillStyle = fgColor;
      const distanceX = (canvasWidth - 2*paddingX)/(size-1);
      const distanceY = (canvasHeight - 2*paddingY)/(size-1);
      const arcPos=[[4,4],[10,4],[16,4],[4,10],[10,10],[16,10],[4,16],[10,16],[16,16]]as const;
      for (const pos of arcPos) {
        const y = paddingY + (pos[1]-1) * distanceY;
        const x = paddingX + (pos[0]-1) * distanceX;
        
        ctx.moveTo(x, y);
        ctx.arc(x, y, radius, startAngle, endAngle, true);
      }
      ctx.fill();
    },
    [canvasHeight,canvasWidth,paddingX,paddingY,size]
  );

  const drawAll = useCallback(() => {
    const ctx: CanvasRenderingContext2D = getCtx();
    drawRect(ctx,{});
    drawLine(ctx,{});
    drawArc(ctx, {fgColor: "gray"});
  }, [drawRect, drawLine, drawArc]);

  useEffect(() => drawAll(), [drawAll]);

  return <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} />;
};
