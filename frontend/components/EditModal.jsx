import { useState } from 'react';
export const EditModal = ({ disk, onSave, onClose }) => {
  const [editedDisk, setEditedDisk] = useState(disk);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-white mb-4">Edit Disk: {disk.name}</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-slate-400 text-sm">Disk Name</label>
            <input value={editedDisk.name} onChange={(e) => setEditedDisk({...editedDisk, name: e.target.value})} className="w-full mt-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white" />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div><label className="text-slate-400 text-sm">Capacity</label><input value={editedDisk.capacity} onChange={(e) => setEditedDisk({...editedDisk, capacity: e.target.value})} className="w-full mt-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white" /></div>
            <div><label className="text-slate-400 text-sm">Used</label><input value={editedDisk.used} onChange={(e) => setEditedDisk({...editedDisk, used: e.target.value})} className="w-full mt-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white" /></div>
            <div><label className="text-slate-400 text-sm">Free</label><input value={editedDisk.free} onChange={(e) => setEditedDisk({...editedDisk, free: e.target.value})} className="w-full mt-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white" /></div>
          </div>
          
          <div><label className="text-slate-400 text-sm">Status</label><input value={editedDisk.status} onChange={(e) => setEditedDisk({...editedDisk, status: e.target.value})} className="w-full mt-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white" /></div>
          <div><label className="text-slate-400 text-sm">Notes</label><textarea value={editedDisk.notes} onChange={(e) => setEditedDisk({...editedDisk, notes: e.target.value})} className="w-full mt-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white h-20" /></div>
          <div><label className="text-slate-400 text-sm">Contents (one per line)</label><textarea value={editedDisk.contents.join("\n")} onChange={(e) => setEditedDisk({...editedDisk, contents: e.target.value.split("\n").filter(Boolean)})} className="w-full mt-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white h-32" /></div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button onClick={() => onSave(editedDisk)} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">Save</button>
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded">Cancel</button>
        </div>
      </div>
    </div>
  );
};