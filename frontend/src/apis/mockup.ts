import { type Withdrawal } from "../models";

export const statusOptions = [
  { value: "待審核", label: "待審核" },
  { value: "逾期審核", label: "逾期審核" },
  { value: "同意停修", label: "同意停修" },
  { value: "不同意停修", label: "不同意停修" },
];

export const classOptions = [
  { value: "國立臺灣大學", label: "國立臺灣大學" },
  { value: "國立臺灣科技大學", label: "國立臺灣科技大學" },
  { value: "國立清華大學", label: "國立清華大學" },
  { value: "國立陽明交通大學", label: "國立陽明交通大學" },
  { value: "國立成功大學", label: "國立成功大學" },
  { value: "國立中山大學", label: "國立中山大學" },
  { value: "國立中央大學", label: "國立中央大學" },
  { value: "國立臺灣師範大學", label: "國立臺灣師範大學" },
  { value: "國立政治大學", label: "國立政治大學" },
  { value: "國立中興大學", label: "國立中興大學" },
  { value: "南臺科技大學", label: "南臺科技大學" },
  { value: "中國醫藥大學", label: "中國醫藥大學" },
  { value: "逢甲大學", label: "逢甲大學" },
].map(o => o.value);

export const INIT_COURSES = [
  {
    id: "1",
    semester: "114-2 (2026 Spring)",
    courseId: "57497",
    courseName: "深度學習 Deep Learning",
  },
  {
    id: "2",
    semester: "114-2 (2026 Spring)",
    courseId: "57493",
    courseName: "智慧製造執行系統 Intelligent Manufacturing Execution Systems",
  },
  {
    id: "3",
    semester: "114-2 (2026 Spring)",
    courseId: "57494",
    courseName:
      "大型語言模型與資訊安全系統 Applying Large Language Models in Cybersecurity Systems",
  },
  {
    id: "4",
    semester: "114-2 (2026 Spring)",
    courseId: "57496",
    courseName:
      "生成式AI應用系統與工程 Generative AI Application Systems and Engineering",
  },
  {
    id: "5",
    semester: "114-2 (2026 Spring)",
    courseId: "55850",
    courseName: "機率與統計 Probability and Statistics",
  },
];
export const BASE_SECS = [
  { id: "1", name: "國立政治大學", alwaysOn: true },
  { id: "2", name: "國立清華大學", alwaysOn: true },
  { id: "3", name: "國立臺灣大學", alwaysOn: false },
  { id: "4", name: "國立臺灣師範大學", alwaysOn: false },
  { id: "5", name: "國立成功大學", alwaysOn: false },
  { id: "6", name: "國立中興大學", alwaysOn: false },
  { id: "7", name: "國立陽明交通大學", alwaysOn: false },
];
type CourseSection = {
  id: string;
  name: string;
  alwaysOn: boolean;
  st: string;
  et: string;
  ad: string;
  op: string;
  ot: string;
  vis: boolean;
  notes: string;
};

const mkSecs = (
  st?: string,
  et?: string,
  ad?: string,
  notes?: string,
): CourseSection[] =>
  BASE_SECS.map((b) => ({
    ...b,
    st: st || "2026/07/01 00:00",
    et: et || "2026/07/25 23:59",
    ad: ad || "2026/08/08 23:59",
    op: "admin2",
    ot: "2026/03/17 16:54",
    vis: ["1", "2", "3", "4", "5"].includes(b.id),
    notes: notes || "",
  }));

export const initCS = (): Record<string, CourseSection[]> => {
  const o: Record<string, CourseSection[]> = {};
  INIT_COURSES.forEach((c) => {
    o[c.id] = mkSecs();
  });
  return o;
};

export const INIT_STUDENTS: Withdrawal[] = [
  {
    id: 1,
    studnetName: "丁O寧",
    studentId: "臺科大_B11000000",
    loginId: "B11000000@mail.ntust.edu.tw",
    submittedAt: "2026/05/11 08:00",
    endAt: "2026/05/11 08:00",
    reason:
      "本課程《大型語言模型與資訊安全系統》內容極具前瞻性，惟修讀後發現個人在 Transformer 架構與對抗性攻擊（Adversarial Attacks）的數學基礎尚不完備，導致在實作 LLM 弱點掃描與防禦機制時，進度明顯落後。為確保學習品質，本人決定先補強相關先修知識，待準備充分後再行挑戰，故申請停修。",
    status: "pending",
  },
  {
    id: 2,
    studnetName: "李O豪",
    studentId: "清大_s113065535",
    loginId: "s113065535@m113.nthu.edu.tw",
    submittedAt: "2026/05/11 08:00",
    endAt: "2026/05/13 23:59",
    reason:
      "本課程涉及大量的 Transformer 架構理論與 GPU 平行運算技巧，但本人在數學證明與 CUDA 程式撰寫上遭遇瓶頸，多次嘗試仍無法跟上課程進度，為避免影響學習成效，故申請停修。",
    status: "pending",
  },
  {
    id: 3,
    studnetName: "陳O淳",
    studentId: "南臺科大_4A9G0123",
    loginId: "4a9g0123@stust.edu.tw",
    submittedAt: "2026/04/20 00:00",
    endAt: "2026/04/29 23:59",
    reason: "老師我累累ㄉ...",
    status: "overdue",
  },
  {
    id: 4,
    studnetName: "方O弘",
    studentId: "中山_b123022030",
    loginId: "b123022030@student.nsysu.edu.tw",
    submittedAt: "2026/05/04 14:53",
    endAt: "2026/05/13 23:59",
    reason:
      "本課程之期末專題需頻繁操作 GPU 伺服器進行深度學習模型訓練，但因個人電腦設備限制，加上近期家中突發狀況，無法投入足夠時間完成專題，故申請停修。",
    status: "approved",
    reviewedAt: "2026/05/08 13:52",
    reviewerName: "林俊叡 (教師)",
  },
  {
    id: 5,
    studnetName: "王O寓",
    studentId: "中國醫_u114003804",
    loginId: "u114003804@cmu.edu.tw",
    submittedAt: "2026/04/22 09:56",
    endAt: "2026/05/25 23:59",
    reason:
      "本人目前正參與外部資安實驗室的專案開發，時間衝突導致無法兼顧本課程，且評估後認為該專案經驗對未來職涯發展更具價值，故申請停修本課程。",
    status: "declined",
    reviewedAt: "2026/05/08 13:52",
    reviewerName: "林俊叡 (教師)",
  },
  {
    id: 6,
    studnetName: "張O翔",
    studentId: "臺大_b11902135",
    loginId: "b11902135@ntu.edu.tw",
    submittedAt: "2026/05/06 10:23",
    endAt: "2026/05/13 23:59",
    reason:
      "因本學期同時修習多門進階課程，課業負擔過重，經評估後決定集中資源於其他必修科目，故申請停修本課程。",
    status: "approved",
    reviewedAt: "2026/05/10 09:15",
    reviewerName: "林俊叡 (教師)",
  },
  {
    id: 7,
    studnetName: "林O婷",
    studentId: "成大_F34097391",
    loginId: "f34097391@ncku.edu.tw",
    submittedAt: "2026/05/03 16:41",
    endAt: "2026/05/13 23:59",
    reason:
      "本課程在 GPU 資源分配上，常需等候數小時才能取得運算資源進行實驗，嚴重影響學習進度，且評估短期內難以改善，故申請停修。",
    status: "declined",
    reviewedAt: "2026/05/08 13:52",
    reviewerName: "林俊叡 (教師)",
  },
  {
    id: 8,
    studnetName: "吳O宏",
    studentId: "陽明交大_0516032",
    loginId: "0516032@nycu.edu.tw",
    submittedAt: "2026/05/12 09:00",
    endAt: "2026/05/13 23:59",
    reason:
      "近期因身體健康因素，需配合醫療排程，無法正常出席課程及完成作業，故申請停修。",
    status: "pending",
  },
  {
    id: 9,
    studnetName: "蔡O珊",
    studentId: "中央_109522047",
    loginId: "109522047@ncu.edu.tw",
    submittedAt: "2026/05/11 20:15",
    endAt: "2026/05/13 23:59",
    reason:
      "選課時對課程深度評估不足，修讀後發現先修知識不足以跟上課程節奏，為維持學習品質，故申請停修。",
    status: "pending",
  },
  {
    id: 10,
    studnetName: "黃O浩",
    studentId: "師大_41175004H",
    loginId: "41175004H@gm.ntnu.edu.tw",
    submittedAt: "2026/04/28 13:09",
    endAt: "2026/05/13 23:59",
    reason:
      "本人因每日通勤往返超過四小時，加上工讀兼職，無法妥善安排課後複習與實作時間，學習成效不佳，故申請停修。",
    status: "approved",
    reviewedAt: "2026/05/09 11:00",
    reviewerName: "林俊叡 (教師)",
  },
  {
    id: 11,
    studnetName: "劉O雯",
    studentId: "政大_109703021",
    loginId: "109703021@nccu.edu.tw",
    submittedAt: "2026/05/13 11:30",
    endAt: "2026/05/13 23:59",
    reason:
      "課程作業量遠超預期，目前已落後進度三週，自評無法在期末前完成所有要求，故申請停修。",
    status: "pending",
  },
  {
    id: 12,
    studnetName: "謝O哲",
    studentId: "中興_M11256021",
    loginId: "M11256021@nchu.edu.tw",
    submittedAt: "2026/05/07 08:30",
    endAt: "2026/05/13 23:59",
    reason:
      "本人研究所論文進入關鍵撰寫階段，指導教授要求專注研究，難以分心修習本課程，故申請停修。",
    status: "declined",
    reviewedAt: "2026/05/10 16:30",
    reviewerName: "林俊叡 (教師)",
  },
  {
    id: 13,
    studnetName: "許O欣",
    studentId: "逢甲_D0902453",
    loginId: "D0902453@fcu.edu.tw",
    submittedAt: "2026/04/18 22:00",
    endAt: "2026/04/27 23:59",
    reason: "課程進度與個人學習節奏不合，長期跟不上，故申請停修。",
    status: "overdue",
  },
  {
    id: 14,
    studnetName: "陳O瑋",
    studentId: "臺科大_B12100055",
    loginId: "B12100055@mail.ntust.edu.tw",
    submittedAt: "2026/05/13 15:47",
    endAt: "2026/05/13 23:59",
    reason:
      "本課程程式作業需大量時間 debug，本人程式設計基礎薄弱，投入大量時間後仍難以達到課程要求，故申請停修。",
    status: "pending",
  },
  {
    id: 15,
    studnetName: "鄭O萱",
    studentId: "清大_s113044218",
    loginId: "s113044218@m113.nthu.edu.tw",
    submittedAt: "2026/05/02 17:25",
    endAt: "2026/05/13 23:59",
    reason:
      "系上必修實驗課與本課程時段重疊，學期中才發現衝突，為能完成必修課程，故申請停修。",
    status: "approved",
    reviewedAt: "2026/05/08 10:20",
    reviewerName: "林俊叡 (教師)",
  },
];
