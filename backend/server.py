from flask import Flask, jsonify, request
from flask_cors import CORS
import subprocess
import json
import platform
import psutil
import sys
import os
import subprocess
import re


app = Flask(__name__)
CORS(app)

def is_ssd(device):
    """Detect if disk is SSD or HDD"""
    system = platform.system()
    
    try:
        if system == 'Darwin':  # macOS
            result = subprocess.run(
                ['diskutil', 'info', device],
                capture_output=True,
                text=True,
                timeout=5
            )
            return 'Solid State: Yes' in result.stdout or 'SSD' in result.stdout
        
        elif system == 'Windows':
            # Extract drive letter
            drive = device.rstrip('\\')
            result = subprocess.run(
                ['powershell', f'Get-PhysicalDisk | Get-Disk | Where-Object {{$_.DeviceID -eq (Get-Partition -DriveLetter {drive[0]}).DiskNumber}} | Select-Object MediaType'],
                capture_output=True,
                text=True,
                timeout=5
            )
            return 'SSD' in result.stdout
        
        elif system == 'Linux':
            device_name = device.split('/')[-1].rstrip('0123456789')
            with open(f'/sys/block/{device_name}/queue/rotational', 'r') as f:
                return f.read().strip() == '0'
    except:
        pass
    
    return None  # Unknown

def format_size(bytes):
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if bytes < 1024.0:
            return f"{bytes:.2f} {unit}"
        bytes /= 1024.0
    return f"{bytes:.2f} PB"

def get_disk_name(partition):
    """Get appropriate disk name for both Windows and macOS/Linux"""
    system = platform.system()
    
    if system == 'Windows':
        # Windows: Use drive letter (C:, D:, etc.)
        return partition.device.rstrip('\\')
    else:
        # macOS/Linux: Extract last part of device path
        device_name = partition.device.split('/')[-1]
        if not device_name:
            device_name = partition.mountpoint.split('/')[-1]
        return device_name or partition.mountpoint

@app.route('/api/disks', methods=['GET'])
def list_disks():
    disks = []
    system = platform.system()
    
    for partition in psutil.disk_partitions():
        try:
            if system != 'Windows' and partition.fstype in ['devfs', 'autofs', 'tmpfs']:
                continue
            
            usage = psutil.disk_usage(partition.mountpoint)
            disk_type = is_ssd(partition.device)
            
            disks.append({
                'name': get_disk_name(partition),
                'path': partition.mountpoint,
                'capacity': format_size(usage.total),
                'capacityBytes': usage.total,
                'used': format_size(usage.used),
                'free': format_size(usage.free),
                'fstype': partition.fstype,
                'mountpoint': partition.mountpoint,
                'device': partition.device,
                'type': 'SSD' if disk_type else 'HDD' if disk_type is False else 'UNKNOWN'
            })
        except (PermissionError, OSError) as e:
            print(f"Error accessing {partition.mountpoint}: {e}")
            pass
    
    # Sort: SSD first, then by capacity descending
    disks.sort(key=lambda x: (x['type'] != 'SSD', -x['capacityBytes']))
    
    return jsonify(disks)

@app.route('/api/scan', methods=['POST'])
def scan_disk():
    data = request.json
    disk_path = data.get('path')
    
    if not disk_path:
        return jsonify({'error': 'No path provided'}), 400
    
    try:
        # Determine correct Python command
        python_cmd = sys.executable  # Use the same Python running this server
        
        # Get the directory where server.py is located
        script_dir = os.path.dirname(os.path.abspath(__file__))
        scan_script = os.path.join(script_dir, 'scan_disk.py')
        
        result = subprocess.run(
            [python_cmd, scan_script, disk_path],
            capture_output=True,
            text=True,
            timeout=60
        )
        
        if result.returncode == 0:
            return jsonify(json.loads(result.stdout))
        else:
            return jsonify({'error': result.stderr}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print(f"Starting Flask server on http://localhost:5001")
    print(f"Platform: {platform.system()}")
    print(f"Python: {sys.executable}")
    app.run(debug=True, port=5001, host='0.0.0.0')