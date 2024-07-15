"use server";

import { db } from "@/db";
import { templates } from "@/db/schema";

export const getTemplates = async () => {
  const response = await db.select().from(templates);
  return response;
};
