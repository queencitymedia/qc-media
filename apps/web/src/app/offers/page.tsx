import OffersDashboard from "@/components/offers/OffersDashboard";
import LogoutButton from "@/components/LogoutButton";

export const runtime = "nodejs";

export default async function Page() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Offers</h1>
        <LogoutButton />
      </div>
      <OffersDashboard />
    </div>
  );
}