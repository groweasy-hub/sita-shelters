import { IndentDetailScreen } from "@/features/indents";

export default async function IndentDetailPage({ params }) {
  const { indentId } = await params;
  return <IndentDetailScreen indentId={indentId} />;
}
