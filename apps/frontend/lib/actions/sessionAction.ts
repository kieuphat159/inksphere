"use server";

import { getSession } from "../session";

export async function getClientSession() {
  return await getSession();
}
