import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AuctionCard } from "@/components/auctions/AuctionCard";
import { getUserAuctions } from "../actions/auctions";

export default async function MyAuctions() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="text-center p-6">
        <p>Please sign in to view your auctions</p>
      </div>
    );
  }

  const auctions = await getUserAuctions();

  console.log("auctions: ", auctions);

  if (!auctions) {
    return (
      <div className="text-center p-6">
        <p>Error loading auctions</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Auctions</h1>
        <Link href="/auctions/create">
          <Button>Create New Auction</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {auctions.map((auction) => (
          <AuctionCard key={auction.id} auction={auction} />
        ))}

        {auctions.length === 0 && (
          <div className="col-span-full text-center p-6 bg-gray-50 rounded-lg">
            <p>{"You haven't created any auctions yet."}</p>
            <Link href="/dashboard">
              <Button className="mt-4">Visit Auctions</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
