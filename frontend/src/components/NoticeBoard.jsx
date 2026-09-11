import React from "react";
import { Bell, Calendar, Tag } from "lucide-react";

export default function NoticeBoard({ notices }) {
  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex items-center gap-2.5 mb-1">
        <Bell className="w-5 h-5 text-blue-400" />
        <h2 className="text-base font-bold text-white">Active Campus Circulars</h2>
      </div>
      <p className="text-xs text-slate-400 mb-6">
        Real-time academic circulars retrieved directly from MongoDB and bound to the AI prompt context
      </p>

      {notices.length === 0 ? (
        <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
          No circulars currently found in the database.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notices.map((n) => (
            <div key={n._id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 flex items-center gap-1">
                  <Tag className="w-3 h-3" /> {n.category}
                </span>
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(n.date).toLocaleDateString()}
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-100 mt-2.5">{n.title}</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{n.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}