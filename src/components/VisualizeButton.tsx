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
      className={`switch-light px-4 py-2 rounded-md border-2 cursor-pointer text-lg border-gray-700 ${
        isVisualized ? 'switch-light-on' : 'pl-9'
      }`}
      onClick={onClickAction}
    >
      {isVisualized ? 'Unvisualize' : 'Visualize'}
    </button>
  );
};
