import { getUser } from "@/utils/actions/user";
import LoginComponent from "./LoginComponent";
import { redirect } from "next/navigation";

export default async function Page() {
  const { user } = await getUser();
  if (user) {
    redirect("/");
  }
  return <LoginComponent />;
}
