import React from 'react';
import Link from "next/link";

function ModernHomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
     <header className="bg-white shadow-md sticky top-0 z-50">
  <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
    {/* Logo */}
    <div className="text-4xl font-extrabold text-indigo-700 tracking-wide hover:text-indigo-900 transition duration-300">
      Gluby
    </div>

    {/* Navigation Links */}
    <nav className="space-x-4">
      <Link
        href="/login"
        className="border border-indigo-600 text-indigo-600 font-medium px-5 py-2 rounded-full transition duration-200 hover:bg-indigo-50 hover:scale-105"
      >
        Login
      </Link>
      <Link
        href="/register"
        className="bg-indigo-600 text-white font-medium px-5 py-2 rounded-full hover:bg-indigo-700 transition duration-200 shadow-sm"
      >
        Register
      </Link>
    </nav>
  </div>
</header>


      {/* Hero Section */}
<main className="relative overflow-hidden bg-gradient-to-br from-white via-indigo-50 to-white">
  <div className="max-w-7xl mx-auto px-4 py-24 grid md:grid-cols-2 gap-10 items-center">
    {/* Left Content */}
  <div className="space-y-8">
 <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg px-6 py-10 text-center space-y-4 hover:shadow-2xl transition duration-300">
  <h1 className="text-xl sm:text-6xl lg:text-6xl font-extrabold leading-tight text-indigo-800">
    <span className="block text-7xl sm:text-7xl lg:text-8xl text-indigo-800">Gluby</span>
    <span className="block text-indigo-500 text-2xl sm:text-4xl mt-4 leading-snug">
      Where Recycling<br />Meets Opportunity
    </span>
  </h1>
</div>


  <p className="text-lg sm:text-xl text-gray-700 leading-relaxed max-w-xl">
    Gluby is a recycling e-auction platform designed to transform waste into value. By connecting sellers with buyers in a transparent and rewarding marketplace, Gluby empowers communities to recycle smarter and live more sustainably.
  </p>

      <div className="flex flex-wrap gap-4">
        <Link
          href="/register"
          className="bg-indigo-600 text-white px-8 py-3 rounded-full text-lg font-medium shadow hover:bg-indigo-700 transition hover:scale-105"
        >
          Start Recycling
        </Link>
        <a
          href="#how-gluby-works"
          className="border border-indigo-600 text-indigo-600 px-8 py-3 rounded-full text-lg font-medium hover:bg-indigo-50 transition hover:scale-105"
        >
          Learn More
        </a>
      </div>
    </div>

  {/* Right Content - Enhanced Illustration Card */}
<div className="flex justify-center items-center">
  <div className="relative w-full max-w-md">
    {/* Glowy Background Effects */}
    <div className="absolute -top-10 -left-10 w-80 h-80 bg-green-400 opacity-20 blur-3xl rounded-full z-0 animate-pulse" />
    <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-indigo-400 opacity-20 blur-3xl rounded-full z-0 animate-pulse" />

    {/* Glass Card */}
    <div className="relative z-10 p-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-indigo-100 space-y-6 hover:shadow-2xl transition">
      {[{
        icon: "♻️",
        bg: "bg-green-100 text-green-600",
        title: "Eco Auctions",
        desc: "Turn Waste Into Value"
      }, {
        icon: "🛒",
        bg: "bg-indigo-100 text-indigo-600",
        title: "Bidding Made Easy",
        desc: "Transparent & Fair"
      }, {
        icon: "🌍",
        bg: "bg-yellow-100 text-yellow-600",
        title: "Sustainable Impact",
        desc: "Join The Green Movement"
      }].map((item, idx) => (
        <div key={idx} className="flex items-center space-x-4 hover:bg-indigo-100 p-2 rounded-lg transition">
          <div className={`w-14 h-14 flex items-center justify-center rounded-full text-2xl shadow-inner ${item.bg}`}>
            {item.icon}
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-800">{item.title}</h4>
            <p className="text-sm text-gray-500">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>

  </div>
</main>


     {/* Features Section */}
<section id="how-gluby-works" className="bg-white py-20">
  <div className="max-w-7xl mx-auto px-6">
    <h2 className="text-4xl font-bold text-center text-indigo-600 mb-16">
      How Gluby Works
    </h2>

    <div className="grid md:grid-cols-3 gap-8">
      {[{
        header: "For Sellers",
        title: "Earn Rewards From Recyclables",
        description: "List & Sell: Submit items for admin approval and start auctioning.",
        features: [
          "Anonymous Bidding: Highest bid shown, identities hidden until auction ends.",
          "Seamless Communication: Chat privately with the winner post-auction.",
          "Earn & Redeem: Collect points for every sale, convert to cash via admin.",
          "Track Performance: View auctions, bids, and rewards in one place.",
        ],
      }, {
        header: "For Buyers",
        title: "Find Unique Recyclable Items",
        description: "Add balance & bid: Contact admin to fund your wallet, then start bidding.",
        features: [
          "Search & Discover: Filter auctions by category, popularity, or price.",
          "Watch & Win: Favorite auctions, track your bids in real time.",
          "Chat With Sellers: Discuss pickup after winning.",
          "Winner’s Certificate: Download official certificate after each auction.",
        ],
      }, {
        header: "Admin Dashboard",
        title: "Ensuring Transparency & Security",
        description: "Approve listings: Review seller items before they go live.",
        features: [
          "Transfer Rewards: Give points after successful auctions.",
          "Monitor Users: Oversee all buyers and sellers.",
          "Manage Wallets: Secure buyer balances.",
          "Ensure Fair Play: Maintain a safe, honest marketplace.",
        ],
      }].map((feature) => (
        <div
          key={feature.header}
          className="bg-indigo-50 rounded-2xl overflow-hidden shadow hover:shadow-xl transition-shadow hover:-translate-y-1 duration-300"
        >
          {/* Card Header */}
          <div className="bg-indigo-600 text-white px-6 py-4">
            <h3 className="text-3xl font-bold text-center">{feature.header}</h3>
          </div>

          {/* Card Body */}
          <div className="p-6 space-y-4">
            <h4 className="text-xl font-bold text-indigo-700 text-center">{feature.title}</h4>
            <p className="text-gray-700 text-center">{feature.description}</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 text-left">
              {feature.features.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

      {/* Other Sections Remain As-Is */}

      {/* Why Join Gluby Section */}
      <section className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-indigo-600 mb-10">Why Join Gluby?</h2>
          <div className="grid md:grid-cols-3 gap-10 text-left">
            <div className="hover:bg-indigo-50 p-4 rounded-xl transition">
              <h3 className="text-xl font-semibold mb-2">🌱 Sustainable Impact</h3>
              <ul className="space-y-1 text-gray-700">
                <li>• Reduce Waste: Divert Materials From Landfills.</li>
                <li>• Promote Circular Economy: Give Items A Second Life.</li>
              </ul>
            </div>
            <div className="hover:bg-indigo-50 p-4 rounded-xl transition">
              <h3 className="text-xl font-semibold mb-2">🏆 Personal Rewards</h3>
              <ul className="space-y-1 text-gray-700">
                <li>• Earn From Recycling: Turn Waste Into Value.</li>
                <li>• Buyer Recognition: Get Downloadable Certificates.</li>
              </ul>
            </div>
            <div className="hover:bg-indigo-50 p-4 rounded-xl transition">
              <h3 className="text-xl font-semibold mb-2">🤝 Community Connection</h3>
              <ul className="space-y-1 text-gray-700">
                <li>• Like-Minded Network: Meet Sustainability Champions.</li>
                <li>• Anonymous Bidding: Fair, Private Auctions.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
<section className="bg-indigo-50 py-16">
  <div className="max-w-6xl mx-auto px-4 text-center">
    <h2 className="text-4xl font-bold text-indigo-600 mb-12">Key Features</h2>
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 text-left">
      {[{
        icon: "🔐",
        title: "Simple & Secure Bidding",
        desc: "Anonymous Auctions With Real-Time Updates."
      }, {
        icon: "💰",
        title: "Reward System",
        desc: "Earn Points And Convert Them To Cash Easily."
      }, {
        icon: "🔍",
        title: "Advanced Search",
        desc: "Find Auctions By Category, Popularity, Or Price."
      }, {
        icon: "⭐",
        title: "Watchlist",
        desc: "Track Favorite Auctions In Just One Click."
      }, {
        icon: "📊",
        title: "Personalized Dashboards",
        desc: "Manage Your Auctions, Bids, And Profile Effortlessly."
      }, {
        icon: "📄",
        title: "Winner’s Certificate",
        desc: "Celebrate Each Successful Bid With A Downloadable Certificate."
      }].map((feature, i) => (
        <div key={i} className="bg-white border border-indigo-100 rounded-xl p-6 shadow-sm hover:shadow-md hover:scale-[1.02] transition-transform">
          <div className="text-4xl mb-4">{feature.icon}</div>
          <h3 className="text-xl font-semibold text-indigo-700 mb-2">{feature.title}</h3>
          <p className="text-gray-600">{feature.desc}</p>
        </div>
      ))}
    </div>
  </div>
</section>

      {/* Call To Action */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Be Part Of The Change
          </h2>
          <p className="text-xl mb-10">
            <span className='text-xl'>Gluby Makes Recycling Rewarding </span>
            <br></br>
            For You And The Planet. Join Us Today To List. Bid. Earn. And Build A Greener, More Sustainable Future.
          </p>
          <div className="space-x-4">
            <Link
              href="/register"
              className="bg-white text-indigo-600 px-8 py-3 rounded-full hover:bg-indigo-50 hover:scale-105 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ModernHomePage;