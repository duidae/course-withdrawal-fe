import { request } from "./request";
import { type Withdrawal } from "../models";

import { INIT_STUDENTS } from "./mockup";

const getWithdrawals = async (): Promise<Withdrawal[]> => {
  //const response = await request.get<Withdrawal[]>("/api/withdrawal-list");
  await new Promise((resolve) => setTimeout(resolve, 1500));
  const response = { data: INIT_STUDENTS };
  return response.data;
};

export { getWithdrawals };
