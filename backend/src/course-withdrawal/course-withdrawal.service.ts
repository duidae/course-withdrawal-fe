import { Injectable } from '@nestjs/common';

export type Withdrawal = {
  id: number;
  name: string;
  school: string;
  studentId: string;
  loginId: string;
  applyTime: string;
  deadline: string;
  reason: string;
  status: string;
};

export type CourseInfo = {
  courseName: string;
};

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};

@Injectable()
export class CourseWithdrawalService {
  private readonly withdrawals: Withdrawal[] = [
    {
      id: 1,
      name: '丁O寧',
      school: '國立臺灣科技大學',
      studentId: '臺科大_B11000000',
      loginId: 'B11000000@mail.ntust.edu.tw',
      applyTime: '2026/05/11 08:00',
      deadline: '2026/05/11 08:00',
      reason:
        '本課程《大型語言模型與資訊安全系統》內容極具前瞻性，惟修讀後發現個人在 Transformer 架構與對抗性攻擊（Adversarial Attacks）的數學基礎尚不完備，導致在實作 LLM 弱點掃描與防禦機制時，進度明顯落後。為確保學習品質，本人決定先補強相關先修知識，待準備充分後再行挑戰，故申請停修。',
      status: 'notSubmitted',
    },
    {
      id: 2,
      name: '王小明',
      school: '國立臺灣大學',
      studentId: '台大_B11000001',
      loginId: 'B11000001@mail.ntu.edu.tw',
      applyTime: '2026/05/12 09:00',
      deadline: '2026/05/12 09:00',
      reason: '因家庭因素暫時無法持續修習本課程，申請停修。',
      status: 'submitted',
    },
    {
      id: 3,
      name: '李小華',
      school: '國立清華大學',
      studentId: '清大_B11000002',
      loginId: 'B11000002@mail.nthu.edu.tw',
      applyTime: '2026/05/13 10:00',
      deadline: '2026/05/13 10:00',
      reason: '因學業規劃調整，決定暫停修讀。',
      status: 'approved',
    },
  ];

  private readonly courses: Array<{ courseId: string; courseName: string }> = [
    { courseId: 'CS101', courseName: '大型語言模型與資訊安全系統' },
    { courseId: 'CS102', courseName: '資料結構與演算法' },
  ];

  getWithdrawals(page = 1, pageSize = 10): PaginatedResult<Withdrawal> {
    const start = (page - 1) * pageSize;
    const data = this.withdrawals.slice(start, start + pageSize);

    return { data, total: this.withdrawals.length, page, pageSize };
  }

  getStudent(id: number): Withdrawal | undefined {
    return this.withdrawals.find((student) => student.id === id);
  }

  getCourseInfo(courseId: string): CourseInfo {
    const course = this.courses.find((entry) => entry.courseId === courseId);
    return { courseName: course?.courseName ?? '' };
  }
}
