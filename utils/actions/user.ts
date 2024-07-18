"use server";

import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";

export const getUser = async () => {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log(user);

  return { user };
};

export const signOut = async () => {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    return redirect("/login?message=" + error.message);
  }
  return redirect("/");
};
