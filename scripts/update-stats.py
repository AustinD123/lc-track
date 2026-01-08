#!/usr/bin/env python3
import json
import requests
from datetime import datetime, timedelta
import time
import os

DATA_DIR = os.path.join(os.path.dirname(__file__), '../data')
USERS_FILE = os.path.join(DATA_DIR, 'users.json')
DAILY_STATS_FILE = os.path.join(DATA_DIR, 'daily_stats.json')

LEETCODE_API = "https://leetcode.com/graphql/"
STATS_API = "https://leetcode-stats-api.herokuapp.com"

def fetch_total_solved(username):
    """Fetch total problems solved using the public stats API"""
    try:
        response = requests.get(
            f"{STATS_API}/{username}",
            timeout=10
        )
        
        data = response.json()
        
        if data.get("status") != "success":
            print(f"❌ Error: {data.get('message')}")
            return None
        
        return data.get("totalSolved", 0)
    
    except Exception as e:
        print(f"❌ Request error: {str(e)}")
        return None

def fetch_leetcode_calendar(username):
    """Fetch submission calendar from LeetCode GraphQL"""
    query = """
    query userStats {
        matchedUser(username: "%s") {
            userCalendar {
                submissionCalendar
            }
        }
    }
    """ % username

    try:
        response = requests.post(
            LEETCODE_API,
            json={"query": query},
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Content-Type": "application/json"
            },
            timeout=10
        )
        
        data = response.json()
        
        if "errors" in data:
            print(f"❌ Error fetching calendar: {data['errors'][0].get('message', 'Unknown error')}")
            return None
        
        calendar_str = data.get("data", {}).get("matchedUser", {}).get("userCalendar", {}).get("submissionCalendar")
        
        if not calendar_str:
            return None
        
        try:
            return json.loads(calendar_str)
        except:
            return None
    
    except Exception as e:
        print(f"❌ Request error: {str(e)}")
        return None

def get_today_submissions(calendar_stats):
    """Extract today's submission count from calendar with timezone handling"""
    if not calendar_stats:
        return 0
    
    # Try multiple timestamps for today (UTC and local)
    today = datetime.now().date()
    
    # UTC timestamp
    today_timestamp_utc = int(datetime.combine(today, datetime.min.time()).timestamp())
    
    # Check both string and int keys
    for ts in [str(today_timestamp_utc), today_timestamp_utc, str(today_timestamp_utc - 86400)]:
        if ts in calendar_stats:
            return calendar_stats[ts]
    
    # If not found, check yesterday too (might be same day in different timezone)
    yesterday = today - timedelta(days=1)
    yesterday_timestamp = int(datetime.combine(yesterday, datetime.min.time()).timestamp())
    
    for ts in [str(yesterday_timestamp), yesterday_timestamp]:
        if ts in calendar_stats:
            return calendar_stats[ts]
    
    return 0

def update_daily_stats():
    """Fetch and update stats from LeetCode API"""
    try:
        # Load users
        if not os.path.exists(USERS_FILE):
            print(f"❌ {USERS_FILE} not found!")
            return False
        
        with open(USERS_FILE, 'r') as f:
            users = json.load(f)
        
        # Load existing daily stats
        daily_stats = {}
        if os.path.exists(DAILY_STATS_FILE):
            with open(DAILY_STATS_FILE, 'r') as f:
                daily_stats = json.load(f)
        
        # Get today's date
        today_str = datetime.now().strftime('%Y-%m-%d')
        
        if today_str not in daily_stats:
            daily_stats[today_str] = {}
        
        print(f"\n📡 Fetching LeetCode stats for {len(users)} users...")
        
        for user in users:
            username = user['leetcode_username']
            display_name = user['display_name']
            
            print(f"⏳ Fetching stats for {display_name} (@{username})...")
            
            # Get total problems solved from stats API
            total_solved = fetch_total_solved(username)
            
            if total_solved is not None:
                user['totalSolved'] = total_solved
                
                # Get calendar for today's count
                calendar = fetch_leetcode_calendar(username)
                today_count = get_today_submissions(calendar)
                
                daily_stats[today_str][username] = today_count
                
                print(f"✅ {display_name}: +{today_count} today, {total_solved} total")
            else:
                print(f"✗ {display_name}: Failed to fetch")
            
            time.sleep(1)  # Rate limiting
        
        # Save updated files
        with open(DAILY_STATS_FILE, 'w') as f:
            json.dump(daily_stats, f, indent=2)
        
        with open(USERS_FILE, 'w') as f:
            json.dump(users, f, indent=2)
        
        print("\n✨ Daily stats and user totals updated successfully!")
        return True
    
    except Exception as e:
        print(f"❌ Error updating stats: {str(e)}")
        return False

# Run the update
if __name__ == "__main__":
    update_daily_stats()

if __name__ == "__main__":
    update_daily_stats()
