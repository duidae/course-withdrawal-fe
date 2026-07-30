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
  return INIT_STUDENTS.find((s) => s.id === id);
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
