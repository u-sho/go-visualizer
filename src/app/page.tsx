'use client';

import { BackButton } from '@/components/BackButton';
import { GameBoard } from '@/components/GameBoard';
import { StoneButton } from '@/components/StoneButton';
import { VisualButton } from '@/components/VisualizeButton';
import { Header } from '@/components/Header';
import { useEffect, useRef, useState } from 'react';

export default function Page() {
  const [boardSize, setBoardSize] = useState(9);
  const [boardWidth, setBoardWidth] = useState(900);
  const [stoneColor, setStoneColor] = useState<'black' | 'white'>('black');
  const [isVisualized, setIsVisualized] = useState(false);
  const gameBoardRef = useRef<{ deleteLastStone: () => void }>(null);

  useEffect(() => {
    const handleResize = () => {
      const windowWidth = window.innerWidth;
      if (windowWidth < 640) {
        setBoardSize(9);
        setBoardWidth(Math.min(windowWidth - 30, 900));
      } else {
        setBoardSize(19);
        setBoardWidth(Math.min(windowWidth / 2, 900));
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 可視化状態を切り替える関数
  const handleToggleVisualize = () => {
    setIsVisualized((prev) => !prev);
  };

  // 石の色を切り替える関数
  const handleToggleColor = () => {
    setStoneColor((prevColor) => (prevColor === 'black' ? 'white' : 'black'));
  };

  // 直近の石を削除する関数
  const handleDeleteLastStone = () => {
    if (gameBoardRef.current) {
      gameBoardRef.current.deleteLastStone();
    }
  };

  return (
    <div className="pt-16">
      <Header />
      <div className="flex flex-col sm:flex-row items-center sm:justify-between xl:justify-center min-h-screen p-1 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        {/* Game boardを画面の左側に固定 */}
        <div className="mt-2 sm:mt-0 sm:fixed sm:left-8 sm:top-1/2 sm:transform sm:-translate-y-1/2">
          <GameBoard
            ref={gameBoardRef} // GameBoardの参照を取得
            canvasWidth={boardWidth}
            canvasHeight={boardWidth}
            paddingX={boardWidth * 0.03}
            paddingY={boardWidth * 0.03}
            size={boardSize}
            stoneColor={stoneColor}
            isVisualized={isVisualized}
          />
        </div>

        {/* ボタン群を右に、または小さい画面では下に表示 */}
        <div className="flex flex-col gap-4 sm:w-1/2 sm:ml-auto sm:flex-row sm:items-center sm:justify-center">
          <VisualButton
            isVisualized={isVisualized}
            onClick={handleToggleVisualize}
          />
          <StoneButton color={stoneColor} onClick={handleToggleColor} />
          <BackButton onClick={handleDeleteLastStone} />{' '}
          {/* 直近の石を削除するボタン */}
        </div>
      </div>
    </div>
  );
}
