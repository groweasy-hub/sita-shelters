import { RoleDetailScreen } from "@/features/administration";

export default async function AccessRoleDetailPage({ params }) {
  const { roleId } = await params;
  return <RoleDetailScreen role={roleId} />;
}
