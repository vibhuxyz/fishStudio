import { redirect } from "next/navigation";

// Riders are now staff (role: RIDER) — managed from Staff Management.
const RidersRedirectPage = () => {
  redirect("/dashboard/staff-management");
};

export default RidersRedirectPage;
