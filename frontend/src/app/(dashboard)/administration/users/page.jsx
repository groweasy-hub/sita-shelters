import { redirect } from "next/navigation";

/** Users management moved to the dedicated Access & Permissions module. */
export default function AdministrationUsersPage() {
  redirect("/access/users");
}
