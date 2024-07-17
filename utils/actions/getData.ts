"use server";

import { db } from "@/db";
import { templates } from "@/db/schema";

export const getTemplates = async () => {
  const response = await db.select().from(templates);
  return response;
};

export const getBackgrounds = async () => {
  const result = await db.query.backgrounds.findMany({
    with: {
      backgroundParts: true,
    },
  });
  return result;
};
