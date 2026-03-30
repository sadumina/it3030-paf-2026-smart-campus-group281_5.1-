import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Highlight from "../components/Highlight";
import Testimonials from "../components/Testimonials";
import Footer from "../components/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fdfcf8] text-slate-900">
      <Navbar />
      <main className="space-y-0">
        <Hero />
        <Features />
        <Highlight />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
