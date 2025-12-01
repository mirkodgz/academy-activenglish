import { currentUser } from "@clerk/nextjs/server";

export async function getUserData() {
  const user = await currentUser();
  return user;
}
