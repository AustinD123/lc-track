let chart = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    await renderGraph();
    await renderLeaderboard();
    updateDate();
});

// Update date display
function updateDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dateDisplay').textContent = today;
}

// Load all data (with cache-busting)
async function loadData() {
    try {
        const ts = Date.now();
        const usersRes = await fetch(`./data/users.json?ts=${ts}`, { cache: 'no-store' });
        const dailyStatsRes = await fetch(`./data/daily_stats.json?ts=${ts}`, { cache: 'no-store' });

        if (!usersRes.ok || !dailyStatsRes.ok) {
            console.error('Failed to load data files');
            return;
        }

        window.users = await usersRes.json();
        window.dailyStats = await dailyStatsRes.json();
        console.log('Data loaded:', window.users, window.dailyStats);
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Get only the dates we actually have stats for (no future projection)
function getAvailableDates() {
    if (!window.dailyStats) return [];
    const today = new Date().toISOString().split('T')[0];
    return Object.keys(window.dailyStats)
        .filter(d => d <= today)
        .sort();
}

// Render the cumulative problems graph
async function renderGraph() {
    const ctx = document.getElementById('problemsChart')?.getContext('2d');
    if (!ctx || !window.users || !window.dailyStats) {
        console.error('Missing chart context or data');
        return;
    }

    const dates = getAvailableDates();
    if (!dates.length) {
        console.warn('No daily stats available to plot');
        return;
    }
    const comicColors = ['#FF006E', '#00D9FF', '#FFBE0B', '#FF8C00'];

    const datasets = window.users.map((user, idx) => {
        // Start from current total
        const currentTotal = user.totalSolved || 0;
        let cumulative = currentTotal;
        
        const data = dates.map(d => {
            const daily = window.dailyStats[d]?.[user.leetcode_username] || 0;
            cumulative += daily;
            return cumulative;
        });
        
        const color = comicColors[idx % comicColors.length];
        return {
            label: user.display_name,
            data,
            borderColor: color,
            backgroundColor: 'transparent',
            borderWidth: 5,
            fill: false,
            tension: 0.2,
            pointRadius: 6,
            pointStyle: 'circle',
            pointBackgroundColor: color,
            pointBorderColor: '#000',
            pointBorderWidth: 3,
            pointHoverRadius: 8,
            pointHoverBackgroundColor: color,
        };
    });

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: 'line',
        data: { labels: dates, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { 
                    display: true,
                    position: 'top',
                    labels: {
                        font: { size: 14, weight: 'bold', family: 'Comic Neue' },
                        padding: 15,
                        boxWidth: 40,
                        boxHeight: 4
                    }
                },
                tooltip: {
                    backgroundColor: '#000',
                    titleFont: { size: 14, weight: 'bold', family: 'Permanent Marker' },
                    bodyFont: { size: 13, family: 'Permanent Marker' },
                    padding: 12,
                    displayColors: true,
                    borderColor: '#000',
                    borderWidth: 3,
                    callbacks: {
                        title: (items) => `Date: ${items[0].label}`,
                        label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y} problems`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: { 
                        font: { size: 13, weight: 'bold', family: 'Permanent Marker' },
                        color: '#000'
                    },
                    grid: { color: '#ddd', lineWidth: 2 },
                    border: { color: '#000', width: 3 }
                },
                x: {
                    display: true,
                    ticks: { 
                        display: false
                    },
                    grid: { display: false },
                    border: { color: '#000', width: 3 }
                }
            }
        }
    });
}

// Render leaderboard (today + total)
async function renderLeaderboard() {
    const list = document.getElementById('leaderboardList');
    if (!list || !window.users || !window.dailyStats) return;
    list.innerHTML = '';

    const today = new Date().toISOString().split('T')[0];
    const todayStats = window.dailyStats[today] || {};

    const rankings = window.users
        .map(u => ({ 
            ...u, 
            todaySolved: todayStats[u.leetcode_username] || 0,
            totalSolved: u.totalSolved || 0
        }))
        .sort((a, b) => b.totalSolved - a.totalSolved);

    rankings.forEach((u, idx) => {
        const item = document.createElement('div');
        item.className = 'rank-item';
        item.innerHTML = `
            <div class="rank-badge">#${idx + 1}</div>
            <div class="rank-info">
                <div class="rank-name">${u.display_name}</div>
                <div style="font-size: 0.9em; margin-top: 4px;">Today: +${u.todaySolved}</div>
            </div>
            <div class="rank-score">${u.totalSolved}</div>
        `;
        list.appendChild(item);
    });
}

// Auto-refresh data every 5 minutes
setInterval(async () => {
    await loadData();
    await renderGraph();
    await renderLeaderboard();
}, 5 * 60 * 1000);

// Handle window resize for responsive chart
window.addEventListener('resize', () => {
    if (chart) setTimeout(() => chart.resize(), 0);
});
