import { useState } from "react";

export const ScanModal = ({ onScanComplete, onClose }) => {
  const [path, setPath] = useState("");
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");

  const handleScan = async () => {
    setScanning(true);
    setError("");
    
    try {
      const response = await fetch('http://localhost:5001/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        onScanComplete(data);
        onClose();
      } else {
        setError(data.error || 'Scan failed');
      }
    } catch (err) {
      setError('Cannot connect to backend: ' + err.message);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-4">Scan Disk</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-slate-400 text-sm">Disk Path</label>
            <input
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="/Volumes/MyDisk or C:\ or /media/disk"
              className="w-full mt-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
            />
          </div>
          
          {error && (
            <div className="text-red-400 text-sm bg-red-900/20 rounded p-2">
              {error}
            </div>
          )}
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleScan}
            disabled={scanning || !path}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded"
          >
            {scanning ? 'Scanning...' : 'Scan'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};