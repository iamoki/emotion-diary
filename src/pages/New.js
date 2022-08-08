import { useEffect } from 'react';

import DiaryEditor from '../components/DiaryEditor';

const New = () => {
  // 타이틀 번경
  useEffect(() => {
    const titleElement = document.getElementsByTagName('title')[0];
    titleElement.innerHTML = `감정 일기장 - 새 일기 쓰기`;
  }, []);

  return (
    <div>
      <DiaryEditor />
    </div>
  );
};

export default New;
