import { UserAccessDetailScreen } from "@/features/administration";

export default async function AccessUserDetailPage({ params }) {
  const { userId } = await params;
  return <UserAccessDetailScreen userId={userId} />;
}
