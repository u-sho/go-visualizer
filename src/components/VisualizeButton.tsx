'use client';

type VisualizeButtonProps = {
  isVisualized: boolean;
  onClickAction: React.MouseEventHandler<HTMLButtonElement>;
};

export const VisualButton: React.FC<VisualizeButtonProps> = ({
  isVisualized,
  onClickAction
}) => {
  return (
    <button
      className={`px-4 py-2 rounded-md border-2 cursor-pointer text-lg ${
        isVisualized
          ? 'bg-black text-white border-gray-700'
          : 'bg-white text-black border-gray-700'
      }`}
      onClick={onClickAction}
    >
      {isVisualized ? 'Visualized' : 'Visualize'}
    </button>
  );
};
