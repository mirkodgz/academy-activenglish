import { getCurrentUser } from "./auth";

export async function getUserData() {
  const user = await getCurrentUser();
  return user;
}
