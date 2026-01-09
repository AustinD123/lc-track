let chart = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    renderGraph();
    renderLeaderboard();
    updateDate();
});

// Update date display
function updateDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dateDisplay').textContent = today;
}

// Load data with cache-busting
async function loadData() {
    const GIST_URL = "https://gist.githubusercontent.com/USERNAME/GIST_ID/raw/daily_stats.json";
    const res = await fetch(`${GIST_URL}?ts=${Date.now()}`);
    window.dailyStats = await res.json();

    const usersRes = await fetch(`./data/users.json?ts=${Date.now()}`);
    window.users = await usersRes.json();
}


// Get sorted available dates
function getAvailableDates() {
    if (!window.dailyStats) return [];
    return Object.keys(window.dailyStats).sort();
}

// Render graph (ABSOLUTE TOTALS)
function renderGraph() {
    const canvas = document.getElementById('problemsChart');
    if (!canvas || !window.users || !window.dailyStats) return;

    const ctx = canvas.getContext('2d');
    const dates = getAvailableDates();
    if (!dates.length) return;

    const colors = ['#FF006E', '#00D9FF', '#FFBE0B', '#FF8C00'];

    const datasets = window.users.map((user, idx) => {
        const data = dates.map(d =>
            window.dailyStats[d]?.[user.leetcode_username] ?? null
        );

        const color = colors[idx % colors.length];
        return {
            label: user.display_name,
            data,
            borderColor: color,
            borderWidth: 5,
            fill: false,
            tension: 0.2,
            pointRadius: 6,
            pointBackgroundColor: color,
            pointBorderColor: '#000',
            pointBorderWidth: 3,
        };
    });

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: 'line',
        data: { labels: dates, datasets },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        font: { family: 'Comic Neue', weight: 'bold' }
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        font: { family: 'Permanent Marker' }
                    }
                },
                x: {
                    ticks: { display: false }
                }
            }
        }
    });
}

// Render leaderboard (LATEST TOTAL)
function renderLeaderboard() {
    const list = document.getElementById('leaderboardList');
    if (!list || !window.users || !window.dailyStats) return;
    list.innerHTML = '';

    const dates = getAvailableDates();
    if (!dates.length) return;

    const latestDate = dates[dates.length - 1];
    const todayStats = window.dailyStats[latestDate] || {};

    const rankings = window.users
        .map(u => ({
            display_name: u.display_name,
            total: todayStats[u.leetcode_username] ?? 0
        }))
        .sort((a, b) => b.total - a.total);

    rankings.forEach((u, idx) => {
        const item = document.createElement('div');
        item.className = 'rank-item';
        item.innerHTML = `
            <div class="rank-badge">#${idx + 1}</div>
            <div class="rank-info">
                <div class="rank-name">${u.display_name}</div>
            </div>
            <div class="rank-score">${u.total}</div>
        `;
        list.appendChild(item);
    });
}

// Auto-refresh every 5 minutes (frontend only)
setInterval(async () => {
    await loadData();
    renderGraph();
    renderLeaderboard();
}, 5 * 60 * 1000);
