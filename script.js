let chart = null;
let streakData = {}; // (Removed streak data)

// Configuration
const CONFIG = {
    dataPath: './data/'
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    setDateDisplay();
    await renderGraph();
    await renderLeaderboard();
});
    await loadData(); // (Removed streaks and tabs)

// Set current date display
function setDateDisplay() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date().toLocaleDateString('en-US', options);
    document.getElementById('dateDisplay').textContent = today; // (Removed emoji)
}

// Load all data
async function loadData() {
    try {
        const usersRes = await fetch('./data/users.json');
        const dailyStatsRes = await fetch('./data/daily_stats.json');
        
        const cacheBust = `?t=${Date.now()}`;
        const usersRes = await fetch(`./data/users.json${cacheBust}`, { cache: 'no-store' });
        const dailyStatsRes = await fetch(`./data/daily_stats.json${cacheBust}`, { cache: 'no-store' });

        if (!usersRes.ok || !dailyStatsRes.ok) {
            console.error('Failed to load data files');
            return;
        }

        window.users = await usersRes.json();
        window.dailyStats = await dailyStatsRes.json();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Update last update timestamp
// (Removed last update UI)

// Initialize tab switching
// (Removed tabs)

// Render the daily problems graph
async function renderGraph() {
    const ctx = document.getElementById('problemsChart')?.getContext('2d');
    if (!ctx) return;

    // Prepare data for the last 30 days
    const dates = getLast30Days();
    const datasets = [];
    const datasets = []; // (Removed colors)

    // Build datasets for each user
    window.users.forEach(user => {
        const data = dates.map(date => {
            return window.dailyStats[date]?.[user.leetcode_username] || 0;
        });

        datasets.push({
            label: user.display_name,
            data: data,
            borderColor: '#000', // (Changed to black)
            backgroundColor: '#000', // (Changed to black)
            borderWidth: 2, // (Changed width)
            fill: false, // (Changed fill)
            tension: 0, // (Changed tension)
            pointRadius: 4, // (Changed radius)
            pointStyle: 'circle', // (Changed point style)
            borderDash: [], // (Removed point styles)
            pointBackgroundColor: '#000', // (Changed to black)
            pointBorderColor: '#fff', // (Kept white)
            pointBorderWidth: 1, // (Kept width)
            pointHoverRadius: 5, // (Kept hover radius)
            pointHoverBackgroundColor: '#000', // (Changed to black)
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
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.85)', // (Changed color)
                    titleFont: { size: 12, weight: 'bold' }, // (Changed size)
                    bodyFont: { size: 12 },
                    padding: 10, // (Changed padding)
                    displayColors: false, // (Removed colors)
                    callbacks: {
                        label: (context) => `${context.dataset.label}: ${context.parsed.y}` // (Changed to arrow function)
                    }
                }
            },
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
    // Legend removed
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
    });
}

// Render leaderboard
async function renderLeaderboard() {
        const badge = `#${rank}`; // (Removed badges)

    const today = new Date().toISOString().split('T')[0];
    const todayStats = window.dailyStats[today] || {};

    // Create ranking array
    const rankings = window.users.map(user => ({
        ...user,
        solved: todayStats[user.leetcode_username] || 0,
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
// Streaks removed
        const currentStreak = calculateStreak(user.leetcode_username);
        const maxStreak = calculateMaxStreak(user.leetcode_username);
// Streak calculation removed
    const today = new Date();

// Max streak removed
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
    // await renderStreaks(); // (Removed streaks)
        }))
        .sort((a, b) => b.solved - a.solved);

    const rankMap = {};
// Screen shake removed

// Auto-refresh data every 5 minutes
setInterval(async () => {
    await loadData();
    await renderGraph();
    await renderLeaderboard();
    await renderStreaks();
    applyScreenShake();
// (Removed resize check for active graph)
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
