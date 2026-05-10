'use client';

type StoneButtonProps = {
  color: 'black' | 'white';
  onClickAction: React.MouseEventHandler<HTMLButtonElement>;
};

export const StoneButton: React.FC<StoneButtonProps> = ({
  color,
  onClickAction
}) => {
  return (
    <button
      className={`px-4 py-2 rounded-md border-2 cursor-pointer text-lg ${
        color === 'black'
          ? 'bg-black text-white border-gray-700'
          : 'bg-white text-black border-gray-700'
      }`}
      onClick={onClickAction}
    >
      {color === 'black' ? 'Switch to White' : 'Switch to Black'}
    </button>
  );
};
