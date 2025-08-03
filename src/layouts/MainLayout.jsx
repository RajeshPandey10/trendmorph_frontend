import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/ui/Sidebar";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-wheat text-black flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-h-screen md:ml-0">
        <header className="shadow bg-wheat py-4 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20 md:hidden">
          <button
            className="text-2xl text-black bg-wheat border border-black/10 rounded-lg px-3 py-1"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            ☰
          </button>
          <h1 className="text-2xl font-bold tracking-tight">TrendMorphAI</h1>
        </header>
        <main className="flex-1 container mx-auto px-2 md:px-8 py-8 w-full">
          <Outlet />
        </main>
        <footer className="bg-wheat shadow py-4 text-center text-xs text-black/70 md:hidden">
          &copy; {new Date().getFullYear()} TrendMorphAI. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
