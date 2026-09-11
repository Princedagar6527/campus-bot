import React, { useState, useEffect } from "react";
import { Compass, MessageSquare, Map as MapIcon, Bell, Database, Menu, X } from "lucide-react";

import ChatSection from "./components/ChatSection";
import InteractiveCanvasMap from "./components/InteractiveCanvasMap";
import NoticeBoard from "./components/NoticeBoard";
import AdminPanel from "./components/AdminPanel";

export default function App() {
  const [activeTab, setActiveTab] = useState("chat");
  const [locations, setLocations] = useState([]);
  const [notices, setNotices] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchDbRecords = async () => {
    try {
      const locRes = await fetch("http://localhost:5000/api/locations");
      const locData = await locRes.json();
      setLocations(Array.isArray(locData) ? locData : []);

      const notRes = await fetch("http://localhost:5000/api/notices");
      const notData = await notRes.json();
      setNotices(Array.isArray(notData) ? notData : []);
    } catch (e) {
      console.error("Database fetch failure:", e);
    }
  };

  useEffect(() => {
    fetchDbRecords();
  }, []);

  const handleSeed = async () => {
    try {
      await fetch("http://localhost:5000/api/seed", { method: "POST" });
      fetchDbRecords();
    } catch (e) {
      console.error("Database seeding failure:", e);
    }
  };

  const navItems = [
    { id: "chat", label: "AI Navigator Assistant", icon: MessageSquare },
    { id: "map", label: "2D Interactive Ground Map", icon: MapIcon },
    { id: "notices", label: "Live Notice Board", icon: Bell },
    { id: "admin", label: "Database Admin Console", icon: Database, highlight: true },
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Mobile Top App Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 z-30 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-blue-600 rounded-lg shadow-sm">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xs text-white tracking-wide">CAMPUS CORE</h1>
            <p className="text-[9px] text-blue-400 font-mono">B.Tech Capstone Project</p>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation Sidebar (Desktop: Persistent | Mobile: Drawer Overlay) */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 transform transition-transform duration-300 ease-in-out md:translate-x-0 shrink-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="hidden md:flex items-center gap-3 px-2 py-3 border-b border-slate-800 mb-6">
            <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/30">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm leading-tight text-white tracking-wide">CAMPUS CORE</h1>
              <p className="text-[10px] text-blue-400 font-mono">B.Tech Capstone Project</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 mt-8 md:mt-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? item.highlight
                        ? "bg-emerald-600 text-white shadow-md"
                        : "bg-blue-600 text-white shadow-md"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  <Icon className="w-4 h-4" /> {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* System Diagnostics Metrics */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1 font-mono">
          <div className="flex justify-between text-emerald-400">
            <span>RAG Engine:</span> <span className="font-bold">Active</span>
          </div>
          <div className="flex justify-between">
            <span>Mapped Nodes:</span> <span className="text-white">{locations.length} Points</span>
          </div>
          <div className="flex justify-between">
            <span>Active Circulars:</span> <span className="text-white">{notices.length} Notices</span>
          </div>
          <div className="flex justify-between">
            <span>Core LLM:</span> <span className="text-white">Gemini 3.6 Flash</span>
          </div>
        </div>
      </aside>

      {/* Backdrop for Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-xs"
        />
      )}

      {/* Main View Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-950 relative">
        {activeTab === "chat" && <ChatSection onSeedDatabase={handleSeed} />}
        {activeTab === "map" && (
          <InteractiveCanvasMap
            locations={locations}
            onAskDirections={() => {
              setActiveTab("chat");
            }}
          />
        )}
        {activeTab === "notices" && <NoticeBoard notices={notices} />}
        {activeTab === "admin" && (
          <AdminPanel
            locations={locations}
            notices={notices}
            onRefresh={fetchDbRecords}
          />
        )}
      </main>
    </div>
  );
}