import os
import json
import sys
from pathlib import Path

def get_size(path):
    total = 0
    try:
        if os.path.isfile(path):
            return os.path.getsize(path)
        for entry in os.scandir(path):
            if entry.is_file(follow_symlinks=False):
                total += entry.stat().st_size
            elif entry.is_dir(follow_symlinks=False):
                total += get_size(entry.path)
    except (PermissionError, OSError):
        pass
    return total

def format_size(bytes):
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if bytes < 1024.0:
            return f"{bytes:.2f} {unit}"
        bytes /= 1024.0
    return f"{bytes:.2f} PB"

def scan_disk(disk_path):
    if not os.path.exists(disk_path):
        return {"error": "Path does not exist"}
    
    total_size = os.statvfs(disk_path)
    capacity = total_size.f_blocks * total_size.f_frsize
    free = total_size.f_bavail * total_size.f_frsize
    used = capacity - free
    
    items = []
    try:
        for item in os.scandir(disk_path):
            size = get_size(item.path)
            items.append({
                'name': f"{item.name} ({format_size(size)})",
                'size': size,
                'is_dir': item.is_dir()
            })
    except PermissionError:
        pass
    
    items = sorted(items, key=lambda x: x['size'], reverse=True)
    
    return {
        'name': os.path.basename(disk_path) or disk_path,
        'capacity': format_size(capacity),
        'used': format_size(used),
        'free': format_size(free),
        'contents': [item['name'] for item in items],
        'status': 'SCANNED',
        'notes': f'Scanned from {disk_path}'
    }

if __name__ == '__main__':
    if len(sys.argv) > 1:
        disk_path = sys.argv[1]
    else:
        disk_path = input("Enter disk path: ")
    
    result = scan_disk(disk_path)
    print(json.dumps(result, indent=2))