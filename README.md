# 감정일기

## 페이지 라우팅

- SPA방식을 따르며 CSR로 페이지 렌더링

  - 페이지 이동시 서버와의 통신 없이 리액트앱이 페이지를 업데이트 시키므로 전환이 빠름
  - 데이터가 필요한 경우에는 서버와 데이터만 요청, 전달 받음

- react-router-dom 사용기능

  1. useParams - Path Varible

  ```jsx
  // :id <- id값을 useParams로 가져온다
  <Route path="/diary/:id" element={<Diary />} />
  ```

  2. useSearchParams - QueryString : url과 함께 데이터 전달

  ```jsx
  // useSearchParams()를 사용해 쿼리값을 가져온다
  // http://localhost:3000/edit?id=10&mode=dark
  const [searchParams, setSearchParams] = useSearchParams();

  // 첫번째 인덱스는 get을 통해 쿼리스트링을 꺼내서 사용, 두번째 인덱스는 첫번째인덱스의 값을 변경시키는데 사용(쿼리스트링 변경)
  const id = searchParams.get('id');
  console.log(`id: ${id}`);
  ```

  3. useNavigate - PageMoving : 비액션시에도 강제로 페이지 이동시키기

  ```jsx
  const navigate = useNavigate();

  // id, diaryList가 변할때 데이터꺼내오기
  useEffect(() => {
    if (diaryList.length >= 1) {
      const targetDiary = diaryList.find(
        (it) => parseInt(it.id) === parseInt(id),
      );
      if (targetDiary) {
        setOriginDate(targetDiary);
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [id, diaryList]);
  ```

## 기초공사

### 공통 컴포넌트 세팅

- Button : 하나의 버튼을 컴포넌트화 시켜서 각각의 페이지에서 재사용했다. 그러기 위해 어떤 기준으로 얼마만큼 변화하는지를 찾아내 패턴화 시켰다.

```jsx
// text : 버튼에 들어갈 텍스트를 props로 받기
// type : 타입을 받아 컬러 스타일링 달리하기
// onClick : 버튼별로 각각의 함수를 실행시키기 위해 부여
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
```

```jsx
// 버튼 컴포넌트 특정영역 사용예시
<MyButton
  type={'positive'}
  text={'새 일기 쓰기'}
  onClick={() => navigate('/new')}
/>
```

- Header : 반복되는 레이아웃중 하나인 헤더영역을 컴포넌트화 시켜 재사용 하였다. 텍스트와 버튼의 위치가 여러 페이지에서 동일한것을 체크해 css스타일링을 잡고 텍스트만 바꿀수있고, 버튼은 들어가야하는곳에만 들어갈 수 있도록 세팅.

```jsx
// headText : 영역별 달라지는 텍스트 props
// leftChild : 왼쪽 영역에 들어가는 컴포넌트 배치
// rightChild : 오른쪽 영역에 들어가는 컴포넌트 배치
const MyHeader = ({ headText, leftChild, rightChild }) => {
  return (
    <header>
      <div className="head_btn_left">{leftChild}</div>
      <div className="head_text">{headText}</div>
      <div className="head_btn_right">{rightChild}</div>
    </header>
  );
};

export default MyHeader;
```

```jsx
// 헤더 컴포넌트 사용예시
<MyHeader
  headText={isEdit ? '일기 수정하기' : '새 일기쓰기'}
  leftChild={<MyButton text={'< 뒤로가기'} onClick={() => navigate(-1)} />}
  rightChild={
    isEdit && (
      <MyButton text={'삭제하기'} type={'negative'} onClick={handleRemove} />
    )
  }
/>
```

## Home

- 최초 진입화면으로 상단의 날짜를 변경할수 있는 버튼컴포넌트와 작성된 일기리스트를 보여준다.

```jsx
// 초기 랜더시 현재에 해당하는 월에 있는 일기들만 보여지기
useEffect(() => {
  if (diaryList.length >= 1) {
    const firstDay = new Date(
      curDate.getFullYear(),
      curDate.getMonth(),
      1,
    ).getTime();

    const lastDay = new Date(
      curDate.getFullYear(),
      curDate.getMonth() + 1,
      0,
      23,
      56,
      59,
    ).getTime();

    setData(
      diaryList.filter((it) => firstDay <= it.date && it.date <= lastDay),
    );
  }
}, [curDate, diaryList]);

// 월 앞으로가기
const increaseMonth = () => {
  setCurDate(
    new Date(curDate.getFullYear(), curDate.getMonth() + 1, curDate.getDate()),
  );
};

// 월 뒤로가기
const decreaseMonth = () => {
  setCurDate(
    new Date(curDate.getFullYear(), curDate.getMonth() - 1, curDate.getDate()),
  );
};
```

## List

- 작성한 일기들의 리스트를 보여준다. 감정점수를 3가지 분류로 나누어주는 필터와, 날짜를 최신순과 오래된순으로 정렬할 수 있는 필터를 가지고 있다.

```jsx
// 셀렉트 옵션으로 들어갈 값들을 객체로 정리, 키값과 구조를 통일해 재사용이 가능하다.
const sortOptionList = [
  { value: 'latest', name: '최신 순' },
  { value: 'oldest', name: '오래된 순' },
];

const filterOptionList = [
  { value: 'all', name: '전부 다' },
  { value: 'good', name: '좋은 감정만' },
  { value: 'bad', name: '안 좋은 감정만' },
];
```

```jsx
// 하나의 셀렉트 컴포넌트를 만들어 두개의 필터를 제작.
const ControlMenu = ({ value, onChange, optionList }) => {
  return (
    <select
      className="ControlMenu"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {optionList.map((it, idx) => (
        <option key={idx} value={it.value}>
          {it.name}
        </option>
      ))}
    </select>
  );
};
```

```jsx
// 순서정렬, 감정정렬 필터 - 상태 값의 변화를 사용하기 위해 useState를 사용
const [sortType, setSortType] = useState('latest');
const [filter, setFilter] = useState('all');

// 순서 정렬 value에 따른 정렬값 반환 함수
const getProcessedDiaryList = () => {
  // diaryList의 원본을 건드리지않기 위해 깊은복사
  const copyList = JSON.parse(JSON.stringify(diaryList));

  // 감정 정렬 콜백함수
  const filterCallBack = (item) => {
    if (filter === 'good') {
      return parseInt(item.emotion) <= 3;
    } else {
      return parseInt(item.emotion) > 3;
    }
  };

  // 날짜 정렬 콜백함수
  const compare = (a, b) => {
    if (sortType === 'latest') {
      return parseInt(a.date) - parseInt(b.date);
    } else {
      return parseInt(b.date) - parseInt(a.date);
    }
  };

  // 감정 정렬함수
  const filteredList =
    filter === 'all' ? copyList : copyList.filter((it) => filterCallBack(it));

  // 날짜 정렬함수(감정점수를 필터시킨것을 정렬)
  const sortedList = filteredList.sort(compare);

  return sortedList;
};
```

```jsx
// 초기 데이터값이 잘못넘어오거나 없을경우 에러가 나지않기위해 default값으로 빈 배열 설정해두기
DiaryList.defaultProps = {
  diaryList: [],
};
```

## Diary DetailPage

- 리스트에 있는 일기를 클릭하면 해당 일기의 상세페이지를 보여준다.

```jsx
const Diary = () => {
  // :id 값과 일기데이터의 id 값을 매치하기 위함
  const { id } = useParams();
  // context를 활용해 list 가져오기
  const diaryList = useContext(DiaryStateContext);
  const navigate = useNavigate();
  const [data, setData] = useState();

  // 초기 렌더시
  useEffect(() => {
    // 일기데이터가 1개거나 1개 이상일 때
    if (diaryList.length >= 1) {
      // id 값을 사용해 가져올 일기데이터 찾기
      const targetDiary = diaryList.find(
        (it) => parseInt(it.id) === parseInt(id),
      );

      // 일기가 존재할때와 아닐때를 분기
      if (targetDiary) {
        setData(targetDiary);
      } else {
        alert('없는 일기입니다.');
        // 일기가 없다면 강제로 메인페지이 이동, 뒤로가기할 수 없도록 replace 설정
        navigate('/', { replace: true });
      }
    }
  }, [id, diaryList]);

  // 데이터가 없거나 불러오는 시간이 걸릴때에는 하기 텍스트 로드
  if (!data) {
    return <div className="DiaryPage">로딩중입니다.</div>;
  } else {
    // 데이터가 불러와지면 하기값 리턴하여 랜더링
    const curEmotionData = emotionList.find(
      (it) => parseInt(it.emotion_id) === parseInt(data.emotion),
    );

    return (
      ...
    );
  }
};

export default Diary;
```

## DiaryEditor

- 생성한 일기를 수정할 수 있는 페이지

```jsx
// context로 저장해둔 함수들 불러오기
const { onCreate, onEdit, onRemove } = useContext(DiaryDispatchContext);

// 작성하기 버튼
const handleSubmi = () => {
  if (content.length < 1) {
    contentRef.current.focus();
    return;
  }

  if (
    window.confirm(
      // isEdit = 수정하기 페이지와 새로작성하기 페이지를 나눌수 있도록 Edit페이지에서 props를 내려줌
      isEdit ? '일기를 수정하시겠습니까?' : '새로운 일기를 작성하시겠습니까?',
    )
  ) {
    // 수정하기와 생성하기에 전달하는 props가 다르므로 추가 분기
    if (!isEdit) {
      onCreate(date, content, emotion);
    } else {
      onEdit(originData.id, date, content, emotion);
    }
  }
  onCreate(date, content, emotion);
  navigate('/', { replace: true });
};
```

---

## 최적화 시키기 🛠

1. Home 영역의 월 변경시 하단의 셀렉트박스(ControlMenu)가 랜더링 되는 상태 발생

- 이유 : 현재 컴포넌트의 흐름이 [Home → DiaryList → ControlMenu]와 같은구조로 흐르고 있는 관계로 부모컴포넌트(Home)가 리랜더링 되면서 자식요소들도 리랜더링됨

- 해결 : ControlMenu컴포넌트를 React.memo로 사용하여 해결

```jsx
const ControlMenu = React.memo(({ value, onChange, optionList }) => {
  return (
    <select
      className="ControlMenu"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {optionList.map((it, idx) => (
        <option key={idx} value={it.value}>
          {it.name}
        </option>
      ))}
    </select>
  );
});
```

2. 일기 리스트순서 변경시 불필요한 랜더링 발생

- 이유 : [DiaryList → DiaryItem] 부모컴포넌트의 필터값 변경시 state가 변경되므로 업데이트가 발생하고 자식컴포넌트 DiaryItem도 자연스러운 재랜더링 발생

- 해결 : DiaryItem 컴포넌트에 React.memo 적용

```jsx
export default React.memo(DiaryItem);
```

- 해당문제는 꼭 최적화해야하는 이유 : 리스트아이템들은 몇개가 생성될지 모르며 이미지,동영상,많은양의 텍스트를 가지고 있거나 등등 그렇다면 지속적인 재랜더링으로 페이지의 성능이 저하된다.

3. 다이어리 입력시 이모션아이템들의 랜더링발생

- 이유 : [DiaryEditor → EmotionItem] 컴포넌트 안에는 컨텐트를 변화시키는 state를 가지고있다. 이것이 변화하면 자연히 자식요소인 EmotionItem의 재랜더링 발생

* 해결 : EmotionItem에도 React.memo 적용을 했지만 지속적인 재랜더링 발생, 그 이유는 **useState를 통해 전달받은 함수가 아니거나 useCallback로 묶어둔 함수가 아니라면 기본적으로 컴포넌트가 랜더링될 때 다시 생성되어 React.memo에 담은 컴포넌트에도 랜더링이 발생한다.** 그러므로 EmotionItem이 가지고 있는 onClick 함수를 보내고 있는 위치로 가서 그것을 useCallback으로 묶어준다.

```jsx
const handleClickEmote = useCallback((emotion) => {
  setEmotion(emotion);
}, []);
```
