export const BackButton = ({ onClick }: { onClick: () => void }) => {
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
      onClick={onClick}
    >
      Back
    </button>
  );
};
