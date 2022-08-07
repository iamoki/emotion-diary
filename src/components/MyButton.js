const MyButton = ({ text, type, onClick }) => {
  // 버튼의 타입이 지정된게 아니면 디폴트로 값 전환시키기
  const btnType = ['positive', 'negative'].includes(type) ? type : 'default';

  return (
    <button
      className={['MyButton', `MyButton_${btnType}`].join(' ')}
      onClick={onClick}
    >
      {text}
    </button>
  );
};

MyButton.defaultProps = {
  type: 'default',
};

export default MyButton;
