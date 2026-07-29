import { useUserStore } from "@/lib/user-store";
import { useEffect } from "react";

export default function useUser() {
  const { user, loaded, loadUser, updateUser, clearUser } = useUserStore();

  useEffect(() => {
    if (!loaded) loadUser();
  }, [loaded, loadUser]);

  return { user, updateUserData: updateUser, clearUserData: clearUser };
}
