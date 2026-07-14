import { Hero } from "../components/Hero";
import { Catalog } from "../components/Catalog";
import { ValuePropositions } from "../components/ValuePropositions";

export function Home() {
  return (
    <div className="w-full max-w-[100vw] overflow-x-hidden m-0 p-0 box-border bg-alabaster">
      <Hero />
      
      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-[100vw] overflow-x-hidden m-0 p-0 box-border">
        <hr className="border-t border-gray-200 w-full" />
        <Catalog />
        <ValuePropositions />
      </main>
    </div>
  );
}
