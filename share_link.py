#!/usr/bin/env python3
"""Starts the local homepage server and prints a temporary link that is accessible from outside.
Automatically downloads cloudflared into this folder (.cloudflared/) if needed.

Usage:
    python3 share_link.py
    (Press Ctrl+C to stop. The link disappears if you close this terminal or put the laptop to sleep.)
"""
import platform
import re
import socket
import subprocess
import sys
import tarfile
import urllib.request
from pathlib import Path

PORT = 8000
ROOT = Path(__file__).resolve().parent
CLOUDFLARED_DIR = ROOT / ".cloudflared"
CLOUDFLARED_BIN = CLOUDFLARED_DIR / "cloudflared"
URL_PATTERN = re.compile(r"https://[a-zA-Z0-9-]+\.trycloudflare\.com")


def ensure_cloudflared() -> Path:
    if CLOUDFLARED_BIN.exists():
        return CLOUDFLARED_BIN

    CLOUDFLARED_DIR.mkdir(exist_ok=True)
    arch = "arm64" if platform.machine() == "arm64" else "amd64"
    url = f"https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-{arch}.tgz"
    print(f"Downloading cloudflared for the first time... ({url})")

    archive_path = CLOUDFLARED_DIR / "cloudflared.tgz"
    urllib.request.urlretrieve(url, archive_path)
    with tarfile.open(archive_path) as tar:
        tar.extractall(CLOUDFLARED_DIR)
    archive_path.unlink()
    CLOUDFLARED_BIN.chmod(0o755)
    return CLOUDFLARED_BIN


def local_server_running() -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(("127.0.0.1", PORT)) == 0


def start_local_server():
    if local_server_running():
        print(f"A local server is already running on port {PORT}.")
        return None
    print(f"Starting the local server on port {PORT}...")
    return subprocess.Popen(
        [sys.executable, "-m", "http.server", str(PORT)],
        cwd=ROOT,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def start_tunnel_and_print_link(cloudflared_bin: Path):
    print("Creating a temporary link...")
    proc = subprocess.Popen(
        [str(cloudflared_bin), "tunnel", "--url", f"http://localhost:{PORT}"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )
    found = False
    for line in proc.stdout:
        if not found:
            match = URL_PATTERN.search(line)
            if match:
                found = True
                print("\n" + "=" * 60)
                print(f"Temporary link: {match.group(0)}")
                print("=" * 60)
                print("Press Ctrl+C to stop. The link disappears if you close this terminal or put the laptop to sleep.\n")
    return proc


def main():
    cloudflared_bin = ensure_cloudflared()
    server_proc = start_local_server()
    tunnel_proc = start_tunnel_and_print_link(cloudflared_bin)
    try:
        tunnel_proc.wait()
    except KeyboardInterrupt:
        tunnel_proc.terminate()
    finally:
        if server_proc is not None:
            server_proc.terminate()


if __name__ == "__main__":
    main()
