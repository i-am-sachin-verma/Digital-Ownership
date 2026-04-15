import React from "react";

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 border-b border-gray-800">
        <h1 className="text-xl font-bold tracking-wide">Web3X</h1>

        <div className="flex gap-6 items-center">
          <a href="#" className="text-gray-300 hover:text-white">Docs</a>
          <a href="#" className="text-gray-300 hover:text-white">About</a>
          <button className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition">
            Connect Wallet
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24">
        <h2 className="text-5xl md:text-6xl font-bold leading-tight">
          Own Your Digital Identity
        </h2>
        <p className="mt-6 text-gray-400 max-w-2xl">
          A decentralized platform to create, manage, and verify ownership on the blockchain.
          No central authority. Pure trust.
        </p>

        <div className="mt-8 flex gap-4">
          <button className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200">
            Get Started
          </button>
          <button className="border border-gray-600 px-6 py-3 rounded-lg hover:border-white">
            Learn More
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="px-8 py-20 grid md:grid-cols-3 gap-10">
        <FeatureCard
          title="Decentralized Identity"
          desc="Create identity tokens secured on blockchain without relying on authorities."
        />
        <FeatureCard
          title="Community Trust"
          desc="Validation through endorsements builds a trust-driven ecosystem."
        />
        <FeatureCard
          title="Full Ownership"
          desc="You control your data, assets, and digital presence completely."
        />
      </section>

      {/* CTA */}
      <section className="text-center py-20 border-t border-gray-800">
        <h3 className="text-3xl font-semibold">
          Start Building on Web3 Today
        </h3>
        <button className="mt-6 bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-200">
          Launch App
        </button>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-500 text-sm border-t border-gray-800">
        © 2026 Web3X. All rights reserved.
      </footer>
    </div>
  );
};

const FeatureCard = ({ title, desc }: { title: string; desc: string }) => (
  <div className="border border-gray-800 rounded-2xl p-6 hover:border-gray-600 transition">
    <h4 className="text-xl font-semibold mb-3">{title}</h4>
    <p className="text-gray-400">{desc}</p>
  </div>
);

export default LandingPage;