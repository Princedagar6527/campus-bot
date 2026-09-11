import React, { useState, useMemo } from "react";
import {
  Compass,
  Navigation,
  Layers,
  Info,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Footprints,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function InteractiveCanvasMap({ locations = [], onAskDirections }) {
  const [selectedFloor, setSelectedFloor] = useState("All");
  const [activeLoc, setActiveLoc] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [zoomLevel, setZoomLevel] = useState(1);

  // Main Entrance coordinates
  const gateCoords = { x: 250, y: 370 };

  // Filter locations based on floor and search query
  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      const matchesFloor =
        selectedFloor === "All" ||
        loc.floor?.toLowerCase().includes(selectedFloor.toLowerCase());

      const matchesSearch =
        searchQuery.trim() === "" ||
        loc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.roomNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.block?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFloor && matchesSearch;
    });
  }, [locations, selectedFloor, searchQuery]);

  // Compute realistic indoor step directions based on Block & Floor
  const navigationSteps = useMemo(() => {
    if (!activeLoc) return [];

    const steps = [
      "Start at Campus Main Entrance Gate.",
      "Follow the central paved boulevard towards the academic circle.",
    ];

    if (activeLoc.block?.includes("Block A")) {
      steps.push("Turn left into the Western Pathway towards Block A (Computer Science).");
      steps.push("Pass the ground foyer near Lab 1 & 2.");
    } else if (activeLoc.block?.includes("Admin")) {
      steps.push("Turn right into the Eastern Boulevard towards Administrative Block.");
      steps.push("Proceed past the central registrar enquiry desk.");
    } else {
      steps.push("Head straight north towards Block B (Engineering & Workshops).");
    }

    if (activeLoc.floor?.toLowerCase().includes("ground")) {
      steps.push(`Locate ${activeLoc.roomNo} along the ground floor main corridor.`);
    } else if (activeLoc.floor?.toLowerCase().includes("1st")) {
      steps.push("Take staircase / elevator A to the First Floor.");
      steps.push(`Arrive at ${activeLoc.roomNo} beside the department wing.`);
    } else if (activeLoc.floor?.toLowerCase().includes("2nd")) {
      steps.push("Take staircase / elevator A to the Second Floor.");
      steps.push(`Arrive at ${activeLoc.roomNo} on the upper research floor.`);
    } else {
      steps.push(`Proceed to floor: ${activeLoc.floor}, Room: ${activeLoc.roomNo}.`);
    }

    return steps;
  }, [activeLoc]);

  // Rough distance calculation based on SVG pixel delta
  const routeMetrics = useMemo(() => {
    if (!activeLoc) return null;
    const destX = activeLoc.coordinates?.x || 120;
    const destY = activeLoc.coordinates?.y || 100;
    const deltaX = Math.abs(destX - gateCoords.x);
    const deltaY = Math.abs(destY - gateCoords.y);
    const pixelDistance = deltaX + deltaY;

    // Convert SVG units to approximate real-world meters & walking minutes
    const meters = Math.round(pixelDistance * 0.9);
    const minutes = Math.max(1, Math.round(meters / 65));

    return { meters, minutes };
  }, [activeLoc]);

  return (
    <div className="p-3 sm:p-6 h-full flex flex-col bg-slate-950 text-slate-100 overflow-y-auto md:overflow-hidden font-sans">
      {/* Top Controls: Title, Search, and Floor Switcher */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 mb-4 shrink-0">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            Interactive 2D Spatial Wayfinder
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-400">
            Real-time vector pathfinding with dynamic node detection and route simulation
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Lab, Room or Block..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Floor Level Filter */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs shrink-0">
            <span className="text-[10px] sm:text-[11px] text-slate-400 px-1 font-mono flex items-center gap-1">
              <Layers className="w-3 h-3 text-blue-400" /> Floor:
            </span>
            {["All", "Ground", "1st", "2nd"].map((fl) => (
              <button
                key={fl}
                onClick={() => setSelectedFloor(fl)}
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-medium transition-all ${
                  selectedFloor === fl
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {fl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map (Left) + Detail Inspector (Right) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 overflow-visible md:overflow-hidden">
        {/* SVG Interactive Viewport */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl relative p-3 sm:p-5 flex flex-col items-center justify-center min-h-[340px] sm:min-h-[420px] overflow-hidden shadow-inner">
          {/* Zoom Buttons Toolbar */}
          <div className="absolute top-4 right-4 flex items-center gap-1 bg-slate-950/80 backdrop-blur-xs border border-slate-800 rounded-xl p-1 z-10">
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 1.6))}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.85))}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Scalable SVG Surface */}
          <div
            className="w-full h-full flex items-center justify-center transition-transform duration-300 ease-out"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <svg
              viewBox="0 0 500 400"
              className="w-full h-auto max-h-[440px] select-none"
            >
              {/* Ground Boundary */}
              <rect
                x="10"
                y="10"
                width="480"
                height="380"
                rx="16"
                fill="#090d16"
                stroke="#1e293b"
                strokeWidth="2"
              />

              {/* Grid guide markers */}
              <defs>
                <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse">
                  <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#131d2e" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect x="10" y="10" width="480" height="380" fill="url(#grid)" />

              {/* Landscape Gardens */}
              <rect x="65" y="215" width="105" height="85" rx="12" fill="#064e3b" opacity="0.35" />
              <text x="88" y="260" fill="#34d399" fontSize="10" fontWeight="600" opacity="0.85">
                Central Lawn
              </text>

              <rect x="330" y="215" width="105" height="85" rx="12" fill="#064e3b" opacity="0.35" />
              <text x="350" y="260" fill="#34d399" fontSize="10" fontWeight="600" opacity="0.85">
                Sports Arena
              </text>

              {/* Walking Corridors */}
              <path d="M 250 370 L 250 170" stroke="#1e293b" strokeWidth="26" strokeLinecap="round" />
              <path d="M 250 370 L 250 170" stroke="#475569" strokeWidth="2" strokeDasharray="6 6" />

              <path d="M 120 170 L 380 170" stroke="#1e293b" strokeWidth="22" strokeLinecap="round" />
              <path d="M 120 170 L 380 170" stroke="#475569" strokeWidth="2" strokeDasharray="6 6" />

              {/* Block A: Computer Science */}
              <g
                className="cursor-pointer transition-all hover:opacity-90"
                onClick={() =>
                  setActiveLoc(locations.find((l) => l.block?.includes("Block A")) || null)
                }
              >
                <rect x="40" y="40" width="160" height="110" rx="12" fill="#111c30" stroke="#3b82f6" strokeWidth="2" />
                <rect x="40" y="40" width="160" height="26" rx="12" fill="#1d4ed8" opacity="0.9" />
                <text x="52" y="58" fill="#ffffff" fontSize="11" fontWeight="bold">BLOCK A (CSE Dept)</text>
                <text x="52" y="85" fill="#94a3b8" fontSize="9">Ground: Lab 1 & 2</text>
                <text x="52" y="102" fill="#94a3b8" fontSize="9">1st Fl: HOD Office (101)</text>
                <text x="52" y="120" fill="#94a3b8" fontSize="9">2nd Fl: AI & Web Labs</text>
              </g>

              {/* Admin Block: Library & Accounts */}
              <g
                className="cursor-pointer transition-all hover:opacity-90"
                onClick={() =>
                  setActiveLoc(locations.find((l) => l.block?.includes("Admin")) || null)
                }
              >
                <rect x="300" y="40" width="160" height="110" rx="12" fill="#0e2320" stroke="#10b981" strokeWidth="2" />
                <rect x="300" y="40" width="160" height="26" rx="12" fill="#047857" opacity="0.9" />
                <text x="312" y="58" fill="#ffffff" fontSize="11" fontWeight="bold">ADMIN & LIBRARY</text>
                <text x="312" y="85" fill="#94a3b8" fontSize="9">Ground: Registrar & Accounts</text>
                <text x="312" y="102" fill="#94a3b8" fontSize="9">1st Fl: Dean & Exam Cell</text>
                <text x="312" y="120" fill="#94a3b8" fontSize="9">2nd Fl: Central Digital Library</text>
              </g>

              {/* Block B: Mechanical & Robotics */}
              <g
                className="cursor-pointer transition-all hover:opacity-90"
                onClick={() =>
                  setActiveLoc(locations.find((l) => l.block?.includes("Block B")) || null)
                }
              >
                <rect x="185" y="30" width="95" height="70" rx="10" fill="#251a08" stroke="#f59e0b" strokeWidth="1.5" />
                <text x="195" y="52" fill="#fcd34d" fontSize="9" fontWeight="bold">BLOCK B (ECE/ME)</text>
                <text x="192" y="72" fill="#94a3b8" fontSize="8">Robotics & IoT Labs</text>
              </g>

              {/* Main Entrance Gate */}
              <rect x="205" y="360" width="90" height="24" rx="6" fill="#2563eb" />
              <text x="220" y="376" fill="#ffffff" fontSize="10" fontWeight="bold">MAIN GATE</text>

              {/* Dynamic Path Wayfinding Polyline */}
              {activeLoc && (
                <path
                  d={`M ${gateCoords.x} ${gateCoords.y} L 250 170 L ${activeLoc.coordinates?.x || 120} 170 L ${activeLoc.coordinates?.x || 120} ${(activeLoc.coordinates?.y || 110) + 12}`}
                  stroke="#ec4899"
                  strokeWidth="3.5"
                  strokeDasharray="6 4"
                  fill="none"
                  className="animate-pulse"
                />
              )}

              {/* Location Node Pins */}
              {filteredLocations.map((loc) => {
                const isSelected = activeLoc?._id === loc._id;
                const posX = loc.coordinates?.x || 120;
                const posY = loc.coordinates?.y || 90;

                return (
                  <g
                    key={loc._id}
                    onClick={() => setActiveLoc(loc)}
                    className="cursor-pointer transition-transform duration-200 hover:scale-110"
                  >
                    {isSelected && (
                      <circle cx={posX} cy={posY} r="14" fill="#ec4899" opacity="0.35" className="animate-ping" />
                    )}
                    <circle
                      cx={posX}
                      cy={posY}
                      r={isSelected ? "8" : "6"}
                      fill={isSelected ? "#ec4899" : "#38bdf8"}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                    <rect
                      x={posX + 8}
                      y={posY - 10}
                      width={loc.roomNo.length * 7 + 12}
                      height="16"
                      rx="4"
                      fill="#0f172a"
                      stroke={isSelected ? "#ec4899" : "#334155"}
                      strokeWidth="1"
                    />
                    <text
                      x={posX + 13}
                      y={posY + 2}
                      fill={isSelected ? "#f472b6" : "#cbd5e1"}
                      fontSize="9"
                      fontWeight="bold"
                    >
                      {loc.roomNo}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Map Legend Footer */}
          <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-400 bg-slate-950/80 backdrop-blur-xs p-2 rounded-xl border border-slate-800">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span> Plotted Sensor Pin
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span> Active Target
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-1 border-t-2 border-dashed border-pink-500"></span> Route Polyline
            </span>
          </div>
        </div>

        {/* Right Side: Direction Inspector & Wayfinding Turn-by-Turn */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between overflow-hidden">
          {activeLoc ? (
            <div className="flex-1 flex flex-col justify-between overflow-y-auto pr-1">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase bg-blue-950 text-blue-400 px-2 py-0.5 rounded border border-blue-800">
                    {activeLoc.category}
                  </span>
                  <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5" /> Route Plotted
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-white mt-2.5 leading-snug">
                  {activeLoc.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {activeLoc.description}
                </p>

                {/* Real-time Distance & Walking Time Estimate */}
                {routeMetrics && (
                  <div className="mt-4 grid grid-cols-2 gap-2 font-mono text-xs">
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-2">
                      <Footprints className="w-4 h-4 text-pink-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-500 block">Est. Distance</span>
                        <span className="text-white font-bold">{routeMetrics.meters} meters</span>
                      </div>
                    </div>
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-500 block">Walk Time</span>
                        <span className="text-white font-bold">~{routeMetrics.minutes} min</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Turn-by-Turn Wayfinding Steps */}
                <div className="mt-4">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Turn-by-Turn Route
                  </h4>
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                    {navigationSteps.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-slate-950 rounded-lg border border-slate-800/80 text-[11px] text-slate-300 flex items-start gap-2"
                      >
                        <span className="text-blue-400 font-bold shrink-0">{idx + 1}.</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button: Send query to Chat Assistant */}
              <button
                onClick={() => onAskDirections(activeLoc)}
                className="mt-4 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <Compass className="w-4 h-4" /> Ask Directions in Chat Assistant
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-400" /> Directory Quick Select ({filteredLocations.length})
                </h4>
                <p className="text-[11px] text-slate-500 mb-3">
                  Click any location to inspect indoor routes, coordinates, and turn-by-turn guidance.
                </p>

                {/* Filtered Scrollable List */}
                <div className="space-y-1.5 max-h-[260px] sm:max-h-[320px] overflow-y-auto pr-1">
                  {filteredLocations.map((loc) => (
                    <div
                      key={loc._id}
                      onClick={() => setActiveLoc(loc)}
                      className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl cursor-pointer transition-all flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-200 block truncate max-w-[150px] sm:max-w-[170px]">
                          {loc.name}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {loc.block} &bull; {loc.floor}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/60">
                          {loc.roomNo}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                      </div>
                    </div>
                  ))}
                  {filteredLocations.length === 0 && (
                    <div className="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                      No matching locations found for "{searchQuery}".
                    </div>
                  )}
                </div>
              </div>

              <p className="text-[10px] text-slate-500 text-center font-mono mt-4">
                Tip: Use the zoom buttons or click blocks directly on the SVG map.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}