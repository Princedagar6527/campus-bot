import React, { useState } from "react";
import { Plus, Trash2, Database, Bell, MapPin, Loader2 } from "lucide-react";

export default function AdminPanel({ locations = [], notices = [], onRefresh }) {
  const [adminTab, setAdminTab] = useState("notices");
  const [loadingAction, setLoadingAction] = useState(false);

  // Dynamic API Base URL (Sanitized without trailing slash)
  const rawBase =
    import.meta.env.VITE_API_URL || "https://campus-bot-backend.onrender.com";
  const API_BASE = rawBase.endsWith("/") ? rawBase.slice(0, -1) : rawBase;

  const [newLoc, setNewLoc] = useState({
    name: "",
    block: "Block A",
    floor: "Ground Floor",
    roomNo: "",
    category: "Lab",
    description: "",
    x: 100,
    y: 100,
  });

  const [newNotice, setNewNotice] = useState({
    title: "",
    category: "General",
    description: "",
  });

  // 1. Create Location Handler
  const handleCreateLocation = async (e) => {
    e.preventDefault();
    setLoadingAction(true);
    try {
      const res = await fetch(`${API_BASE}/api/locations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLoc),
      });

      if (res.ok) {
        setNewLoc({
          name: "",
          block: "Block A",
          floor: "Ground Floor",
          roomNo: "",
          category: "Lab",
          description: "",
          x: 100,
          y: 100,
        });
        if (onRefresh) onRefresh();
        alert("Location added successfully!");
      } else {
        const data = await res.json().catch(() => ({}));
        alert(`Location creation failed (${res.status}): ${data.error || res.statusText}`);
      }
    } catch (err) {
      console.error("Error creating location:", err);
      alert(`Backend connection failed to ${API_BASE}. Render server waking up or check internet.`);
    } finally {
      setLoadingAction(false);
    }
  };

  // 2. Delete Location Handler
  const handleDeleteLoc = async (id) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this location?")) return;

    setLoadingAction(true);
    try {
      const res = await fetch(`${API_BASE}/api/locations/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        if (onRefresh) onRefresh();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(`Deletion failed (${res.status}): ${data.error || res.statusText}`);
      }
    } catch (err) {
      console.error("Delete network error:", err);
      alert(`Backend connection failed to ${API_BASE}.`);
    } finally {
      setLoadingAction(false);
    }
  };

  // 3. Create Notice Handler
  const handleCreateNotice = async (e) => {
    e.preventDefault();
    setLoadingAction(true);
    try {
      const res = await fetch(`${API_BASE}/api/notices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNotice),
      });

      if (res.ok) {
        setNewNotice({
          title: "",
          category: "General",
          description: "",
        });
        if (onRefresh) onRefresh();
        alert("Notice published successfully!");
      } else {
        const data = await res.json().catch(() => ({}));
        alert(`Notice publication failed (${res.status}): ${data.error || res.statusText}`);
      }
    } catch (err) {
      console.error("Error publishing notice:", err);
      alert(`Backend connection failed to ${API_BASE}. Wait 30s if backend is waking up.`);
    } finally {
      setLoadingAction(false);
    }
  };

  // 4. Delete Notice Handler
  const handleDeleteNotice = async (id) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this notice?")) return;

    setLoadingAction(true);
    try {
      const res = await fetch(`${API_BASE}/api/notices/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        if (onRefresh) onRefresh();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(`Deletion failed (${res.status}): ${data.error || res.statusText}`);
      }
    } catch (err) {
      console.error("Delete network error:", err);
      alert(`Backend connection failed to ${API_BASE}.`);
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 h-full overflow-y-auto space-y-4 sm:space-y-6">
      {/* Header & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" /> Database Admin Console
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
            Target Endpoint: <span className="font-mono text-emerald-400">{API_BASE}</span>
          </p>
        </div>

        <div className="flex gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
          <button
            onClick={() => setAdminTab("notices")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              adminTab === "notices"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Bell className="w-3.5 h-3.5" /> Notices ({notices.length})
          </button>
          <button
            onClick={() => setAdminTab("locations")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              adminTab === "locations"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" /> Locations ({locations.length})
          </button>
        </div>
      </div>

      {/* 1. NOTICES MANAGEMENT TAB */}
      {adminTab === "notices" && (
        <div className="space-y-4 sm:space-y-6">
          <form
            onSubmit={handleCreateNotice}
            className="p-4 sm:p-5 bg-slate-900 border border-slate-800 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs"
          >
            <input
              type="text"
              placeholder="Notice Title (e.g. End Semester Practical Schedule)"
              value={newNotice.title}
              onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
              required
              className="sm:col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
            />
            <select
              value={newNotice.category}
              onChange={(e) => setNewNotice({ ...newNotice, category: e.target.value })}
              className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="General">General</option>
              <option value="Exam">Exam / Academic</option>
              <option value="Placement">Placement / Drive</option>
              <option value="Holiday">Holiday / Event</option>
              <option value="Fee">Accounts / Fee</option>
            </select>
            <textarea
              placeholder="Notice description and instructions..."
              value={newNotice.description}
              onChange={(e) => setNewNotice({ ...newNotice, description: e.target.value })}
              required
              rows={3}
              className="sm:col-span-3 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500 resize-none"
            />
            <button
              type="submit"
              disabled={loadingAction}
              className="sm:col-span-3 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
            >
              {loadingAction ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Publishing...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Publish Notice to Database
                </>
              )}
            </button>
          </form>

          {/* Active Notices Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden text-xs">
            <div className="px-4 py-3 border-b border-slate-800 font-bold text-slate-300">
              Active Circulars ({notices.length})
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[500px]">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Category</th>
                    <th className="p-3">Title</th>
                    <th className="p-3">Date</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {notices.length > 0 ? (
                    notices.map((n) => (
                      <tr key={n._id} className="hover:bg-slate-800/40">
                        <td className="p-3">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
                            {n.category}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-slate-200">{n.title}</td>
                        <td className="p-3 text-slate-500 whitespace-nowrap">
                          {new Date(n.date).toLocaleDateString()}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteNotice(n._id)}
                            disabled={loadingAction}
                            className="text-rose-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                            title="Delete Notice"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-slate-500">
                        No active notices stored in MongoDB.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. LOCATIONS MANAGEMENT TAB */}
      {adminTab === "locations" && (
        <div className="space-y-4 sm:space-y-6">
          <form
            onSubmit={handleCreateLocation}
            className="p-4 sm:p-5 bg-slate-900 border border-slate-800 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs"
          >
            <input
              type="text"
              placeholder="Entity Name (e.g. Distributed Systems Lab)"
              value={newLoc.name}
              onChange={(e) => setNewLoc({ ...newLoc, name: e.target.value })}
              required
              className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Room Identifier (e.g. Room 302)"
              value={newLoc.roomNo}
              onChange={(e) => setNewLoc({ ...newLoc, roomNo: e.target.value })}
              required
              className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
            />
            <select
              value={newLoc.block}
              onChange={(e) => setNewLoc({ ...newLoc, block: e.target.value })}
              className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
            >
              <option>Block A</option>
              <option>Block B</option>
              <option>Block C</option>
              <option>Admin Block</option>
            </select>
            <input
              type="text"
              placeholder="Floor Level (e.g. 2nd Floor)"
              value={newLoc.floor}
              onChange={(e) => setNewLoc({ ...newLoc, floor: e.target.value })}
              className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Operational details and hardware specifications..."
              value={newLoc.description}
              onChange={(e) => setNewLoc({ ...newLoc, description: e.target.value })}
              className="sm:col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={loadingAction}
              className="sm:col-span-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
            >
              {loadingAction ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Insert Facility Record
                </>
              )}
            </button>
          </form>

          {/* Locations Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden text-xs">
            <div className="px-4 py-3 border-b border-slate-800 font-bold text-slate-300">
              Registered Locations ({locations.length})
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[500px]">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Entity</th>
                    <th className="p-3">Block / Floor</th>
                    <th className="p-3">Room</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {locations.length > 0 ? (
                    locations.map((l) => (
                      <tr key={l._id} className="hover:bg-slate-800/40">
                        <td className="p-3 font-semibold text-slate-200">{l.name}</td>
                        <td className="p-3 text-slate-400">
                          {l.block} &bull; {l.floor}
                        </td>
                        <td className="p-3 text-emerald-400 font-mono">{l.roomNo}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteLoc(l._id)}
                            disabled={loadingAction}
                            className="text-rose-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                            title="Delete Location"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-slate-500">
                        No facility locations registered in MongoDB.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}