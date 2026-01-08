#!/usr/bin/env node

const fs = require('fs');
const https = require('https');
const path = require('path');

// Configuration
const DATA_DIR = path.join(__dirname, '../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const DAILY_STATS_FILE = path.join(DATA_DIR, 'daily_stats.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Fetch daily submission count from LeetCode GraphQL API
 */
async function fetchLeetCodeStats(username) {
    return new Promise((resolve, reject) => {
        const query = `
            query userProfileCalendar {
                matchedUser(username: "${username}") {
                    userCalendar {
                        submissionCalendar
                    }
                }
            }
        `;

        const payload = JSON.stringify({ query });

        const options = {
            hostname: 'leetcode.com',
            port: 443,
            path: '/graphql/',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload),
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    
                    if (response.errors) {
                        console.error(`Error fetching ${username}:`, response.errors[0]?.message);
                        resolve(null);
                        return;
                    }

                    const calendar = response.data?.matchedUser?.userCalendar?.submissionCalendar;
                    if (calendar) {
                        const stats = JSON.parse(calendar);
                        resolve(stats);
                    } else {
                        console.warn(`No calendar data for ${username}`);
                        resolve(null);
                    }
                } catch (error) {
                    console.error(`Parse error for ${username}:`, error.message);
                    resolve(null);
                }
            });
        });

        req.on('error', (error) => {
            console.error(`Request error for ${username}:`, error);
            reject(error);
        });

        req.write(payload);
        req.end();
    });
}

/**
 * Parse submission calendar and extract today's count
 * Calendar format: { timestamp: count, timestamp: count, ... }
 */
function getTodaySubmissions(calendarStats) {
    if (!calendarStats) return 0;

    const today = new Date();
    const todayTimestamp = Math.floor(today.getTime() / 1000);
    
    // Find today's submissions
    // LeetCode stores by day, so we need to check the timestamp
    let todayCount = 0;
    
    for (const [timestamp, count] of Object.entries(calendarStats)) {
        const date = new Date(parseInt(timestamp) * 1000);
        const statsDate = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        );
        const checkDate = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        );
        
        if (statsDate.getTime() === checkDate.getTime()) {
            todayCount = count;
            break;
        }
    }
    
    return todayCount;
}

/**
 * Update daily stats with fetched data
 */
async function updateDailyStats() {
    try {
        // Load users configuration
        if (!fs.existsSync(USERS_FILE)) {
            console.error('users.json not found!');
            process.exit(1);
        }

        const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));

        // Load existing daily stats
        let dailyStats = {};
        if (fs.existsSync(DAILY_STATS_FILE)) {
            dailyStats = JSON.parse(fs.readFileSync(DAILY_STATS_FILE, 'utf-8'));
        }

        // Get today's date in YYYY-MM-DD format
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        // Initialize today's stats if not exists
        if (!dailyStats[todayStr]) {
            dailyStats[todayStr] = {};
        }

        // Fetch stats for each user
        console.log(`Fetching LeetCode stats for ${users.length} users...`);
        
        for (const user of users) {
            console.log(`Fetching stats for ${user.display_name} (@${user.leetcode_username})...`);
            
            const stats = await fetchLeetCodeStats(user.leetcode_username);
            const todayCount = getTodaySubmissions(stats);
            
            dailyStats[todayStr][user.leetcode_username] = todayCount;
            
            console.log(`✓ ${user.display_name}: ${todayCount} problems solved`);
            
            // Add delay between requests to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Save updated stats
        fs.writeFileSync(DAILY_STATS_FILE, JSON.stringify(dailyStats, null, 2));
        console.log('\n✅ Daily stats updated successfully!');
        
        return true;
    } catch (error) {
        console.error('❌ Error updating stats:', error);
        process.exit(1);
    }
}

// Run the update
updateDailyStats();
