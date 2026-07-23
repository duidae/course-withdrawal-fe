import { request } from "./request";
import { type Withdrawal } from "../models";

import { INIT_STUDENTS } from "./mockup";

type GetWithdrawalsParams = {
  page?: number;
  pageSize?: number;
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
  await new Promise((resolve) => setTimeout(resolve, 1500));
  const start = (page - 1) * pageSize;
  const data = INIT_STUDENTS.slice(start, start + pageSize);
  return { data, total: INIT_STUDENTS.length, page, pageSize };
};

export { getWithdrawals };
export type { GetWithdrawalsParams, PaginatedResult };
