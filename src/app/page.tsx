import { DeleteButton } from "@/components/DeleteButton";
import { GameBoard } from "@/components/GameBoard";
import { GameStone } from "@/components/GameStone";
import { VisualButton } from "@/components/VisualizeButton";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <DeleteButton></DeleteButton>
      <GameBoard
        canvasWidth={300}
        canvasHeight={300}
        axisX={0}
        axisY={0}
        rectWidth={300}
        rectHeight={300}
        size={19} />
      <GameStone></GameStone>
      <VisualButton></VisualButton>
    </div>
  );
}
