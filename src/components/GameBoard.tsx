"use client";

import { MouseEventHandler, useCallback, useEffect, useRef, useState } from "react";

type CanvasProps = {
  canvasWidth: number;
  canvasHeight: number;
  paddingX: number;
  paddingY: number;
  size: number;
  stoneColor?: 'black' | 'white';
};

export const GameBoard = (props: CanvasProps) => {
  const {
    canvasWidth,
    canvasHeight,
    paddingX,
    paddingY,
    size,
    stoneColor='black',
  } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [distanceX, setDistanceX] = useState((canvasWidth - 2*paddingX)/(size-1));
  const [distanceY, setDistanceY] = useState((canvasHeight - 2*paddingY)/(size-1));
  useEffect(()=>{
    setDistanceX((canvasWidth - 2*paddingX)/(size-1));
    setDistanceY((canvasHeight - 2*paddingY)/(size-1));
  }, [canvasHeight, canvasWidth,paddingX,paddingY,size])

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
    [size, canvasWidth, canvasHeight, paddingX, paddingY, distanceX, distanceY]
  );

  const drawArc = useCallback(
    (ctx: CanvasRenderingContext2D, {fgColor='black'}: Pick<Partial<Context2DCallbackOptions>, 'fgColor'>) => {
      if (![9,19].includes(size))return;
      const radius = 5;
      const startAngle = 0;
      const endAngle = Math.PI * 2;
      ctx.beginPath();
      ctx.fillStyle = fgColor;
      let arcPos=[[4,4],[10,4],[16,4], [4,10],[10,10],[16,10], [4,16],[10,16],[16,16]];
      if (size===9) arcPos=[[5,5]];
      for (const pos of arcPos) {
        const y = paddingY + (pos[1]-1) * distanceY;
        const x = paddingX + (pos[0]-1) * distanceX;
        ctx.moveTo(x, y);
        ctx.arc(x, y, radius, startAngle, endAngle, true);
      }
      ctx.fill();
    },
    [paddingX,paddingY,size,distanceX,distanceY]
  );

  type StoneRec = `${number}-${number}`;
  const [gameRecord, setGameRecord] = useState<StoneRec[]>([]);
  const drawStones = (ctx: CanvasRenderingContext2D, {fgColor=stoneColor}: Pick<Partial<Context2DCallbackOptions>, 'fgColor'>) => {
    const radius = Math.min(distanceX,distanceY)/2;
    const startAngle = 0;
    const endAngle = Math.PI * 2;

    ctx.beginPath();
    ctx.fillStyle=fgColor;
    for(const stoneRec of gameRecord ){
      const stoneX = parseInt(stoneRec.split('-')[0],10);
      const stoneY = parseInt(stoneRec.split('-')[1],10);
      const y = paddingY + stoneY * distanceY;
      const x = paddingX + stoneX * distanceX;
      ctx.moveTo(x,y);
      ctx.arc(x, y, radius, startAngle, endAngle, true);
      
    }
    ctx.fill()

    
  }

  const drawAll = useCallback(() => {
    const ctx: CanvasRenderingContext2D = getCtx();
    drawRect(ctx,{});
    drawLine(ctx,{});
    drawArc(ctx, {fgColor: "gray"});
  }, [drawRect, drawLine, drawArc]);

  useEffect(() => drawAll(), [drawAll]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(()=> drawStones(getCtx(), {}), []);

  const handleClick: MouseEventHandler<HTMLCanvasElement> = (e) => {
    /*
     * rectでcanvasの絶対座標位置を取得し、
     * クリック座標であるe.clientX,e.clientYからその分を引く
     * ※クリック座標はdocumentからの位置を返すため
     * ※rectはスクロール量によって値が変わるので、onClick()内でつど定義
     */
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
  
    // クリックしたのはどの交点かを計算
    let stoneX = 0, stoneY = 0;
    for (let i = 0; i < size; i++) {
      const lineY = paddingY + i * distanceY;
      const lineX = paddingX + i * distanceX;
      if (lineX - distanceX / 2 <= x && x <= lineX + distanceX / 2) stoneX = i;
      if (lineY - distanceY / 2 <= y && y <= lineY + distanceY / 2) stoneY = i;
    }
  
    const stoneRec: StoneRec = `${stoneX}-${stoneY}`;
    if (!gameRecord.includes(stoneRec)) {
      setGameRecord((prev) => [...prev, stoneRec]);
      const ctx = getCtx();
      const radius = Math.min(distanceX, distanceY) / 2 - 2; // 境界線分を引いて調整
      const startAngle = 0;
      const endAngle = Math.PI * 2;
      const y = paddingY + stoneY * distanceY;
      const x = paddingX + stoneX * distanceX;
  
      // 石の塗りつぶし描画
      ctx.beginPath();
      ctx.arc(x, y, radius, startAngle, endAngle, true);
      ctx.fillStyle = stoneColor;
      ctx.fill();
  
      // 境界線の描画
      ctx.beginPath();
      ctx.arc(x, y, radius, startAngle, endAngle, true);
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };
  

  return <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} onClick={handleClick} />;
};
