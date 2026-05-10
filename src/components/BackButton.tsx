export const BackButton = ({
  onClickAction
}: {
  onClickAction: React.MouseEventHandler<HTMLButtonElement>;
}) => {
  return (
    <button
      style={{
        backgroundColor: 'red',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '5px',
        border: 'none',
        cursor: 'pointer'
      }}
      onClick={onClickAction}
    >
      Back
    </button>
  );
};
