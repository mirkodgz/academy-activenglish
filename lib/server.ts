import { getCurrentUser } from "./auth-mock";

export async function getUserData() {
  const user = await getCurrentUser();
  return user;
}
