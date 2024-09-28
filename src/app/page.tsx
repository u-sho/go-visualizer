import { DeleteButton } from "@/components/DeleteButton";
import { Gameboard } from "@/components/GameBoard";
import { StoneButton } from "@/components/StoneButton";
import { VisualButton } from "@/components/VisualizeButton";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      
      {/* Gameboardを画面の左側に固定 */}
      <div className="sm:fixed sm:left-8 sm:top-1/2 sm:transform sm:-translate-y-1/2">
        <Gameboard />
      </div>
      
      {/* ボタン群を右に、または小さい画面では下に表示 */}
      <div className="flex flex-col sm:flex-col gap-4 sm:ml-auto sm:flex-row sm:items-center">
        <VisualButton />
        <StoneButton />
        <DeleteButton />
      </div>
    </div>
  );
}
