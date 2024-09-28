"use client";

import { useCallback, useEffect, useRef } from "react";

type CanvasProps = {
  canvasWidth: number;
  canvasHeight: number;
  axisX: number;
  axisY: number;
  rectWidth: number;
  rectHeight: number;
  size: number;
};

export const GameBoard = (props: CanvasProps) => {
  const {
    canvasWidth,
    canvasHeight,
    axisX,
    axisY,
    rectWidth,
    rectHeight,
    size,
  } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startAxis = 30;
  const endAxis = 270;
  const distance = 40;

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
      rect.rect(axisX, axisY, rectWidth, rectHeight);
      ctx.beginPath();
      ctx.fillStyle = bgColor;
      ctx.fill(rect);
    },
    [axisX, axisY, rectWidth, rectHeight]
  );

  const drawLine = useCallback(
    (ctx: CanvasRenderingContext2D, {fgColor='black'}: Pick<Partial<Context2DCallbackOptions>, 'fgColor'>) => {
      ctx.beginPath();
      ctx.strokeStyle = fgColor;
      ctx.lineWidth = 2;
      for (let i = 0; i < size; i++) {
        const y = startAxis + i * distance;
        const x = startAxis + i * distance;
        ctx.moveTo(startAxis, y);
        ctx.lineTo(endAxis, y);
        ctx.moveTo(x, startAxis);
        ctx.lineTo(x, endAxis);
      }
      ctx.stroke();
    },
    [size]
  );

  const drawArc = useCallback(
    (ctx: CanvasRenderingContext2D, {fgColor='black'}: Pick<Partial<Context2DCallbackOptions>, 'fgColor'>) => {
      const radius = 5;
      const startAngle = 0;
      const endAngle = Math.PI * 2;
      ctx.beginPath();
      ctx.fillStyle = fgColor;
      for (let i = 0; i < 3; i++) {
        const pointAxis = startAxis + distance * i;
        ctx.moveTo(pointAxis, pointAxis);
        ctx.arc(pointAxis, pointAxis, radius, startAngle, endAngle, true);
      }
      ctx.fill();
    },
    []
  );

  const drawAll = useCallback(() => {
    const ctx: CanvasRenderingContext2D = getCtx();
    drawRect(ctx,{});
    drawLine(ctx,{});
    drawArc(ctx, {fgColor: "red"});
  }, [drawRect, drawLine, drawArc]);

  useEffect(() => drawAll(), [drawAll]);

  return <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} />;
};
