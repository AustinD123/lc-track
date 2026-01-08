let chart = null;
let streakData = {};

// Configuration
const CONFIG = {
    dataPath: './data/'
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    setDateDisplay();
    await loadData();
    initializeTabs();
    await renderGraph();
    await renderLeaderboard();
    await renderStreaks();
});

// Set current date display
function setDateDisplay() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date().toLocaleDateString('en-US', options);
    document.getElementById('dateDisplay').textContent = `📅 ${today}`;
}

// Load all data
async function loadData() {
    try {
        const usersRes = await fetch('./data/users.json');
        const dailyStatsRes = await fetch('./data/daily_stats.json');
        
        if (!usersRes.ok || !dailyStatsRes.ok) {
            console.error('Failed to load data files');
            return;
        }
        
        window.users = await usersRes.json();
        window.dailyStats = await dailyStatsRes.json();
        
        // Update last update time
        updateLastUpdateTime();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Update last update timestamp
function updateLastUpdateTime() {
    const lastUpdate = localStorage.getItem('lastUpdate') || new Date().toLocaleString();
    document.getElementById('lastUpdate').textContent = lastUpdate;
}

// Initialize tab switching
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');

            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            document.getElementById(tabName).classList.add('active');

            // Trigger animations
            if (tabName === 'graph') {
                setTimeout(() => {
                    if (chart) chart.resize();
                }, 400);
            }
        });
    });
}

// Render the daily problems graph
async function renderGraph() {
    const ctx = document.getElementById('problemsChart')?.getContext('2d');
    if (!ctx) return;

    // Prepare data for the last 30 days
    const dates = getLast30Days();
    const datasets = [];
    const colors = {};

    // Build datasets for each user
    window.users.forEach(user => {
        const data = dates.map(date => {
            return window.dailyStats[date]?.[user.leetcode_username] || 0;
        });

        colors[user.display_name] = user.color;
        datasets.push({
            label: user.display_name,
            data: data,
            borderColor: user.color,
            backgroundColor: user.color + '33',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointBackgroundColor: user.color,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointHoverRadius: 7,
            pointHoverBackgroundColor: user.color,
        });
    });

    // Destroy existing chart
    if (chart) {
        chart.destroy();
    }

    // Create new chart
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 12 },
                    padding: 15,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.y + ' problems';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        font: { size: 12, weight: 'bold' }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                        lineWidth: 2
                    }
                },
                x: {
                    ticks: {
                        font: { size: 10 }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });

    // Render legend
    renderLegend(colors);
}

// Get last 30 days in YYYY-MM-DD format
function getLast30Days() {
    const dates = [];
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
}

// Render legend
function renderLegend(colors) {
    const legendContainer = document.getElementById('legend');
    legendContainer.innerHTML = '';

    Object.entries(colors).forEach(([name, color]) => {
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `
            <div class="legend-color" style="background-color: ${color};"></div>
            <span>${name}</span>
        `;
        legendContainer.appendChild(item);
    });
}

// Render leaderboard
async function renderLeaderboard() {
    const leaderboardList = document.getElementById('leaderboardList');
    leaderboardList.innerHTML = '';

    const today = new Date().toISOString().split('T')[0];
    const todayStats = window.dailyStats[today] || {};

    // Create ranking array
    const rankings = window.users.map(user => ({
        ...user,
        solved: todayStats[user.leetcode_username] || 0,
        streak: calculateStreak(user.leetcode_username),
        maxStreak: calculateMaxStreak(user.leetcode_username)
    })).sort((a, b) => b.solved - a.solved);

    // Render ranking items with animations
    rankings.forEach((user, index) => {
        const rank = index + 1;
        const badges = ['🥇', '🥈', '🥉'];
        const badge = badges[index] || `#${rank}`;

        const item = document.createElement('div');
        item.className = 'rank-item';
        item.style.animationDelay = `${index * 0.1}s`;
        item.innerHTML = `
            <div class="rank-badge">${badge}</div>
            <div class="rank-info">
                <div class="rank-name">${user.display_name}</div>
                <div class="rank-stats">Streak: ${user.streak} 🔥 | Max: ${user.maxStreak}</div>
            </div>
            <div class="rank-score">${user.solved}</div>
        `;

        // Check for level-up and apply animation
        const previousRank = getPreviousRank(user.leetcode_username);
        if (previousRank && previousRank > rank) {
            item.classList.add('level-up');
        }

        leaderboardList.appendChild(item);
    });
}

// Render streaks
async function renderStreaks() {
    const streaksList = document.getElementById('streaksList');
    streaksList.innerHTML = '';

    window.users.forEach(user => {
        const currentStreak = calculateStreak(user.leetcode_username);
        const maxStreak = calculateMaxStreak(user.leetcode_username);
        const isBroken = currentStreak === 0;

        const card = document.createElement('div');
        card.className = `streak-card ${isBroken ? 'broken' : ''}`;
        card.innerHTML = `
            <div class="streak-icon">${isBroken ? '💀' : '🔥'}</div>
            <div class="streak-name">${user.display_name}</div>
            <div class="streak-count">${currentStreak}</div>
            <div class="streak-label">${isBroken ? 'STREAK BROKEN' : 'DAYS IN A ROW'}</div>
            <div class="max-streak">🏆 Max Streak: ${maxStreak}</div>
        `;

        streaksList.appendChild(card);
    });
}

// Calculate current streak
function calculateStreak(username) {
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const solved = window.dailyStats[dateStr]?.[username] || 0;
        if (solved > 0) {
            streak++;
        } else if (i > 0) {
            break;
        }
    }

    return streak;
}

// Calculate maximum streak ever
function calculateMaxStreak(username) {
    let maxStreak = 0;
    let currentStreak = 0;
    const dates = Object.keys(window.dailyStats).sort().reverse();

    dates.forEach(date => {
        const solved = window.dailyStats[date]?.[username] || 0;
        if (solved > 0) {
            currentStreak++;
            maxStreak = Math.max(maxStreak, currentStreak);
        } else {
            currentStreak = 0;
        }
    });

    return maxStreak;
}

// Get previous rank (for animation purposes)
function getPreviousRank(username) {
    const savedRanks = JSON.parse(localStorage.getItem('previousRanks') || '{}');
    return savedRanks[username] || null;
}

// Save current ranks for next comparison
function savePreviousRanks() {
    const today = new Date().toISOString().split('T')[0];
    const todayStats = window.dailyStats[today] || {};

    const rankings = window.users
        .map((user, index) => ({
            username: user.leetcode_username,
            rank: index + 1,
            solved: todayStats[user.leetcode_username] || 0
        }))
        .sort((a, b) => b.solved - a.solved);

    const rankMap = {};
    rankings.forEach(r => {
        rankMap[r.username] = r.rank;
    });

    localStorage.setItem('previousRanks', JSON.stringify(rankMap));
}

// Auto-refresh data every 5 minutes
setInterval(async () => {
    await loadData();
    await renderGraph();
    await renderLeaderboard();
    await renderStreaks();
    applyScreenShake();
}, 5 * 60 * 1000);

// Apply screen shake effect
function applyScreenShake() {
    const container = document.querySelector('.container');
    container.classList.add('shake');
    setTimeout(() => {
        container.classList.remove('shake');
    }, 400);
}

// Handle window resize for responsive chart
window.addEventListener('resize', () => {
    if (chart && document.getElementById('graph').classList.contains('active')) {
        setTimeout(() => chart.resize(), 0);
    }
});
