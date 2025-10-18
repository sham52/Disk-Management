import { AlertCircle } from "lucide-react";

export const DiskCard = ({
  disk,
  expandedDisk,
  onToggle,
  onEdit,
  onDelete,
  getStatusColor,
  getUsagePercentage,
}) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div
          className="flex items-center gap-3 cursor-pointer flex-1"
          onClick={onToggle}
        >
          <div className={`w-3 h-3 rounded-full ${getStatusColor(disk)}`}></div>
          <h3 className="text-xl font-bold text-white hover:text-blue-400">
            {disk.name}
          </h3>
          {disk.type && (
            <span
              className={`text-xs px-2 py-0.5 rounded ${
                disk.type === "SSD"
                  ? "bg-blue-500/20 text-blue-400"
                  : disk.type === "HDD"
                  ? "bg-gray-500/20 text-gray-400"
                  : "bg-slate-500/20 text-slate-400"
              }`}
            >
              {disk.type}
            </span>
          )}
          <span className="text-slate-400 text-sm">{disk.capacity}</span>
          <span className="text-slate-500 text-xs">
            {expandedDisk === disk.name ? "▼" : "▶"}
          </span>
        </div>
        <div className="flex gap-2 items-center">
          {disk.status.includes("Bozuldu") && (
            <AlertCircle className="w-5 h-5 text-red-400" />
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {disk.used !== "-" && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-slate-400 mb-1">
            <span>Used: {disk.used}</span>
            <span>Free: {disk.free}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getStatusColor(disk)}`}
              style={{ width: `${getUsagePercentage(disk)}%` }}
            ></div>
          </div>
          <div className="text-xs text-slate-500 mt-1 text-right">
            {getUsagePercentage(disk).toFixed(1)}% used
          </div>
        </div>
      )}

      {expandedDisk === disk.name && disk.contents.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-slate-400 mb-2 font-semibold">Contents:</p>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {disk.contents.map((content, idx) => (
              <div
                key={idx}
                className="text-xs text-slate-300 bg-slate-700/50 rounded px-2 py-1"
              >
                {content}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="text-xs text-slate-400">
          <span className="font-semibold">Status: </span>
          <span
            className={
              disk.status.includes("Bozuldu")
                ? "text-red-400"
                : "text-green-400"
            }
          >
            {disk.status}
          </span>
        </div>
        {disk.notes && (
          <div className="text-xs text-yellow-400 bg-yellow-900/20 rounded p-2">
            📝 {disk.notes}
          </div>
        )}
      </div>
    </div>
  );
};
