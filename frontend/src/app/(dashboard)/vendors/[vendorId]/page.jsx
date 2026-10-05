import { VendorDetailScreen } from "@/features/vendors";

export default async function VendorDetailPage({ params }) {
  const { vendorId } = await params;
  return <VendorDetailScreen vendorId={vendorId} />;
}
