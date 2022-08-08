import { useContext, useEffect, useState } from 'react';

import { DiaryStateContext } from '../App';
import DiaryList from '../components/DiaryList';
import MyButton from '../components/MyButton';
import MyHeader from '../components/MyHeader';

const Home = () => {
  const diaryList = useContext(DiaryStateContext);

  const [data, setData] = useState([]);

  const [curDate, setCurDate] = useState(new Date());
  const headText = `${curDate.getFullYear()}년 ${curDate.getMonth() + 1}월`;

  // 타이틀 번경
  useEffect(() => {
    const titleElement = document.getElementsByTagName('title')[0];
    titleElement.innerHTML = `감정 일기장`;
  }, []);

  // 해당 월에 있는 일기들만 보여지기
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

  const increaseMonth = () => {
    setCurDate(
      new Date(
        curDate.getFullYear(),
        curDate.getMonth() + 1,
        curDate.getDate(),
      ),
    );
  };

  const decreaseMonth = () => {
    setCurDate(
      new Date(
        curDate.getFullYear(),
        curDate.getMonth() - 1,
        curDate.getDate(),
      ),
    );
  };

  return (
    <div>
      <MyHeader
        headText={headText}
        leftChild={<MyButton text={'<'} onClick={decreaseMonth} />}
        rightChild={<MyButton text={'>'} onClick={increaseMonth} />}
      />
      <DiaryList diaryList={data} />
    </div>
  );
};

export default Home;
