import { Hero } from "../components/Hero";
import { Catalog } from "./Catalog";
import { ValuePropositions } from "../components/ValuePropositions";

export function Home() {
  return (
    <div className="w-full max-w-[100vw] overflow-x-hidden m-0 p-0 box-border bg-slate-950">
      <Hero />
      
      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-[100vw] overflow-x-hidden m-0 p-0 box-border">
        <Catalog />
        <ValuePropositions />
      </main>
    </div>
  );
}
