//import { request } from "./request";
import { type Withdrawal } from "../models";

import { INIT_COURSES, INIT_STUDENTS } from "./mockup";

type GetWithdrawalsParams = {
  page?: number;
  pageSize?: number;
};

type GetStudentParams = {
  id: number;
};

type GetCourseInfoParams = {
  courseId: string;
};

type CourseInfo = {
  courseName: string;
};

type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};

const defaultPageSize = 10;

const getWithdrawals = async (
  params: GetWithdrawalsParams = {},
): Promise<PaginatedResult<Withdrawal>> => {
  const { page = 1, pageSize = defaultPageSize } = params;
  //const response = await request.get<PaginatedResult<Withdrawal>>(
  //  "/api/withdrawal-list",
  //  { params: { page, pageSize } },
  //);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const start = (page - 1) * pageSize;
  const data = INIT_STUDENTS.slice(start, start + pageSize);
  return { data, total: INIT_STUDENTS.length, page, pageSize };
};

const getStudent = async (
  params: GetStudentParams,
): Promise<Withdrawal | undefined> => {
  const { id } = params;
  //const response = await request.get<Withdrawal>(`/api/withdrawal/${id}`);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // TODO: 未申請
  const toApply = {
    id: 1,
    name: "丁O寧",
    school: "國立臺灣科技大學",
    studentId: "臺科大_B11000000",
    loginId: "B11000000@mail.ntust.edu.tw",
    applyTime: "2026/05/11 08:00",
    deadline: "2026/05/11 08:00",
    reason:
      "本課程《大型語言模型與資訊安全系統》內容極具前瞻性，惟修讀後發現個人在 Transformer 架構與對抗性攻擊（Adversarial Attacks）的數學基礎尚不完備，導致在實作 LLM 弱點掃描與防禦機制時，進度明顯落後。為確保學習品質，本人決定先補強相關先修知識，待準備充分後再行挑戰，故申請停修。",
    status: "notSubmitted",
  };

  return id ? INIT_STUDENTS.find((s) => s.id === id) : toApply;
};

const getCourseInfo = async (
  params: GetCourseInfoParams,
): Promise<CourseInfo> => {
  const { courseId } = params;
  //const response = await request.get<CourseInfo>(
  //  `/api/courses/${courseId}`,
  //);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const course = INIT_COURSES.find((c) => c.courseId === courseId);
  return { courseName: course?.courseName ?? "" };
};

export { getWithdrawals, getStudent, getCourseInfo };
export type {
  GetWithdrawalsParams,
  GetStudentParams,
  PaginatedResult,
  GetCourseInfoParams,
  CourseInfo,
};
