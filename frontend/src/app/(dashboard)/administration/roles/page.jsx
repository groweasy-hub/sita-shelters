import { redirect } from "next/navigation";

/** Roles & permissions moved to the dedicated Access & Permissions module. */
export default function AdministrationRolesPage() {
  redirect("/access/roles");
}
