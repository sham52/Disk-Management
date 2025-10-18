import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  HardDrive,
  Database,
  AlertCircle,
  CheckCircle,
  Filter,
} from "lucide-react";
import { disks } from "../data/information";
import { DiskCard } from "./DiskCard";
import { EditModal } from "./EditModal";
import { ScanModal } from "./ScanModal";

const DiskManagementInterface = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [expandedDisk, setExpandedDisk] = useState(null);
  const [editingDisk, setEditingDisk] = useState(null);
  const [diskData, setDiskData] = useState(disks);
  const [showScanModal, setShowScanModal] = useState(false);
  useEffect(() => {
    const fetchDisks = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/disks");
        const scannedDisks = await response.json();

        const newDisks = scannedDisks
          .filter((sd) => !disks.some((d) => d.notes?.includes(sd.path)))
          .map((disk) => ({
            name: disk.name,
            capacity: disk.capacity,
            capacityBytes: disk.capacityBytes,
            used: disk.used,
            free: disk.free,
            contents: [],
            status: "DETECTED",
            notes: `Auto-detected: ${disk.mountpoint}`,
            type: disk.type || "UNKNOWN",
          }));

        if (newDisks.length > 0) {
          setDiskData([...disks, ...newDisks]);
        }
      } catch (err) {
        console.error("Auto-scan failed:", err);
      }
    };

    fetchDisks();
  }, []);

  const handleScanComplete = (scannedDisk) => {
    const newDisk = {
      ...scannedDisk,
      name: `SCAN${Date.now()}`,
    };
    setDiskData([...diskData, newDisk]);
  };

  const handleEdit = (diskName) => {
    setEditingDisk(diskData.find((d) => d.name === diskName));
  };

  const handleSave = (updatedDisk) => {
    setDiskData(
      diskData.map((d) => (d.name === updatedDisk.name ? updatedDisk : d))
    );
    setEditingDisk(null);
  };

  const handleDelete = (diskName) => {
    if (confirm(`Delete ${diskName}?`)) {
      setDiskData(diskData.filter((d) => d.name !== diskName));
    }
  };

  const handleAdd = () => {
    const newDisk = {
      name: `NEW${Date.now()}`,
      capacity: "1TB",
      used: "-",
      free: "-",
      contents: [],
      status: "NEW",
      notes: "",
    };
    setDiskData([...diskData, newDisk]);
    setEditingDisk(newDisk);
  };
  // Parse capacity string to GB for calculations
  const parseCapacity = (cap) => {
    if (!cap || cap === "-") return 0;
    if (cap.includes("TB")) return parseFloat(cap) * 1024;
    if (cap.includes("GB")) return parseFloat(cap);
    return 0;
  };

  const filteredDisks = useMemo(() => {
    let result = diskData.filter((disk) => {
      const matchesSearch =
        disk.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        disk.contents.some((c) =>
          c.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        disk.notes.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterType === "all" ||
        (filterType === "full" &&
          parseCapacity(disk.free) < parseCapacity(disk.capacity) * 0.2) ||
        (filterType === "empty" && disk.used === "-") ||
        (filterType === "issues" &&
          (disk.status.includes("Bozuldu") ||
            disk.notes.toLowerCase().includes("silinebilir")));

      return matchesSearch && matchesFilter;
    });

    if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "capacity") {
      result.sort(
        (a, b) => parseCapacity(b.capacity) - parseCapacity(a.capacity)
      );
    } else if (sortBy === "free") {
      result.sort((a, b) => parseCapacity(b.free) - parseCapacity(a.free));
    }

    return result;
  }, [searchTerm, filterType, sortBy, diskData]);

  const getUsagePercentage = (disk) => {
    const total = parseCapacity(disk.capacity);
    const used = parseCapacity(disk.used);
    if (total === 0) return 0;
    return (used / total) * 100;
  };

  const getStatusColor = (disk) => {
    if (disk.status.includes("Bozuldu")) return "bg-red-500";
    const pct = getUsagePercentage(disk);
    if (pct > 90) return "bg-red-500";
    if (pct > 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const totalCapacity = disks.reduce(
    (sum, d) => sum + parseCapacity(d.capacity),
    0
  );
  const totalUsed = disks.reduce((sum, d) => sum + parseCapacity(d.used), 0);
  const totalFree = totalCapacity - totalUsed;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Database className="w-10 h-10 text-blue-400" />
            PLK Disk Management
          </h1>
          <p className="text-slate-400">
            Storage inventory and monitoring system
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Capacity</p>
                <p className="text-3xl font-bold text-white">
                  {(totalCapacity / 1024).toFixed(1)} TB
                </p>
              </div>
              <HardDrive className="w-12 h-12 text-blue-400" />
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Used</p>
                <p className="text-3xl font-bold text-yellow-400">
                  {(totalUsed / 1024).toFixed(1)} TB
                </p>
              </div>
              <Database className="w-12 h-12 text-yellow-400" />
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Free</p>
                <p className="text-3xl font-bold text-green-400">
                  {(totalFree / 1024).toFixed(1)} TB
                </p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search disks, contents, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Disks</option>
              <option value="full">Nearly Full (&lt;20%)</option>
              <option value="empty">Empty Disks</option>
              <option value="issues">With Issues</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Sort by Name</option>
              <option value="capacity">Sort by Capacity</option>
              <option value="free">Sort by Free Space</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mb-4">
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
          >
            <span>+</span> Add New Disk
          </button>
          <button
            onClick={() => setShowScanModal(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
          >
            <span>🔍</span> Scan Disk
          </button>
        </div>

        {/* Disk Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredDisks.map((disk) => (
            <DiskCard
              key={disk.name}
              disk={disk}
              expandedDisk={expandedDisk}
              onToggle={() =>
                setExpandedDisk(expandedDisk === disk.name ? null : disk.name)
              }
              onEdit={() => handleEdit(disk.name)}
              onDelete={() => handleDelete(disk.name)}
              getStatusColor={getStatusColor}
              getUsagePercentage={getUsagePercentage}
            />
          ))}
        </div>

        {filteredDisks.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">
              No disks found matching your criteria
            </p>
          </div>
        )}
      </div>

      {editingDisk && (
        <EditModal
          disk={editingDisk}
          onSave={handleSave}
          onClose={() => setEditingDisk(null)}
        />
      )}
      {showScanModal && (
        <ScanModal
          onScanComplete={handleScanComplete}
          onClose={() => setShowScanModal(false)}
        />
      )}
    </div>
  );
};

export default DiskManagementInterface;
