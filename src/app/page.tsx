'use client';
import { DeleteButton } from "@/components/DeleteButton";
import { GameBoard } from "@/components/GameBoard";
import { StoneButton } from "@/components/StoneButton";
import { VisualButton } from "@/components/VisualizeButton";
import { Header } from '@/components/Header';
import { useEffect, useState } from "react";

export default function Home() {
  // 碁盤の幅と石の色を管理するstate
  const [boardWidth, setBoardWidth] = useState(900);
  const [stoneColor, setStoneColor] = useState<'black' | 'white'>('black');

  // ウィンドウのリサイズに応じて碁盤のサイズを変更
  useEffect(() => {
    const handleResize = () => {
      const windowWidth = window.innerWidth;
      if (windowWidth < 640) {
        setBoardWidth(Math.min(windowWidth - 30, 900));
      } else {
        setBoardWidth(Math.min(windowWidth / 2, 900));
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 石の色を切り替える関数
  const handleToggleColor = () => {
    setStoneColor((prevColor) => (prevColor === 'black' ? 'white' : 'black'));
  };

  return (
    <div>
      <Header />
      <div className="flex flex-col sm:flex-row items-center justify-between min-h-screen p-1 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        
        {/* Gameboardを画面の左側に固定 */}
        <div className="sm:fixed sm:left-8 sm:top-1/2 sm:transform sm:-translate-y-1/2">
          <GameBoard
            canvasWidth={boardWidth}
            canvasHeight={boardWidth}
            paddingX={boardWidth * 0.03}
            paddingY={boardWidth * 0.03}
            size={19}
            stoneColor={stoneColor} // 石の色をGameBoardに渡す
          />
        </div>
        
        {/* ボタン群を右に、または小さい画面では下に表示 */}
        <div className="flex flex-col gap-4 sm:w-1/2 sm:ml-auto sm:flex-row sm:items-center sm:justify-center">
          <VisualButton />
          <StoneButton color={stoneColor} onToggleColor={handleToggleColor} /> {/* 石の色を切り替えるボタン */}
          <DeleteButton />
        </div>
      </div>
    </div>
  );
}
