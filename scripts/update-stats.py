#!/usr/bin/env python3
import json
import requests
from datetime import datetime
import os
import time

STATS_API = "https://leetcode-stats-api.herokuapp.com"
GIST_ID = "https://gist.githubusercontent.com/AustinD123/2b5e58d33e6106d47671a043262cbaa9/raw/daily_stats.json"
GIST_TOKEN = os.environ["GIST_TOKEN"]

HEADERS = {
    "Authorization": f"Bearer {GIST_TOKEN}",
    "Accept": "application/vnd.github+json"
}

def fetch_total(username):
    r = requests.get(f"{STATS_API}/{username}", timeout=10)
    d = r.json()
    return d.get("totalSolved") if d.get("status") == "success" else None

def load_gist():
    r = requests.get(
        f"https://api.github.com/gists/{GIST_ID}",
        headers=HEADERS
    )
    files = r.json()["files"]
    return json.loads(files["daily_stats.json"]["content"])

def save_gist(data):
    payload = {
        "files": {
            "daily_stats.json": {
                "content": json.dumps(data, indent=2)
            }
        }
    }
    requests.patch(
        f"https://api.github.com/gists/{GIST_ID}",
        headers=HEADERS,
        json=payload
    )

def main():
    with open("data/users.json") as f:
        users = json.load(f)

    stats = load_gist()
    today = datetime.utcnow().strftime("%Y-%m-%d")

    if today in stats:
        print("Already updated today")
        return

    stats[today] = {}

    for u in users:
        total = fetch_total(u["leetcode_username"])
        if total is not None:
            stats[today][u["leetcode_username"]] = total
            print(f"{u['display_name']}: {total}")
        time.sleep(1)

    save_gist(stats)
    print("✅ Gist updated")

if __name__ == "__main__":
    main()
