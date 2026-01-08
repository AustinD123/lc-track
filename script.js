let chart = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    setDateDisplay();
    await loadData();
    await renderGraph();
    await renderLeaderboard();
});

// Set current date display
function setDateDisplay() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date().toLocaleDateString('en-US', options);
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
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Render the daily problems graph
async function renderGraph() {
    const ctx = document.getElementById('problemsChart')?.getContext('2d');
    if (!ctx || !window.users || !window.dailyStats) return;

    const dates = getLast30Days();
    const styles = [
        { dash: [], point: 'circle' },
        { dash: [6, 4], point: 'rect' },
        { dash: [2, 2], point: 'triangle' },
        { dash: [10, 5], point: 'star' },
        { dash: [1, 4], point: 'cross' }
    ];

    const datasets = window.users.map((user, idx) => {
        const data = dates.map(d => (window.dailyStats[d]?.[user.leetcode_username] || 0));
        const style = styles[idx % styles.length];
        return {
            label: user.display_name,
            data,
            borderColor: '#000',
            backgroundColor: '#000',
            borderWidth: 2,
            fill: false,
            tension: 0,
            pointRadius: 4,
            pointStyle: style.point,
            borderDash: style.dash,
            pointBackgroundColor: '#000',
            pointBorderColor: '#fff',
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: '#000',
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
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.85)',
                    titleFont: { size: 12, weight: 'bold' },
                    bodyFont: { size: 12 },
                    padding: 10,
                    displayColors: false,
                    callbacks: {
                        label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y}`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1, font: { size: 12, weight: 'bold' } },
                    grid: { color: 'rgba(0,0,0,0.1)', lineWidth: 2 }
                },
                x: {
                    ticks: { font: { size: 10 } },
                    grid: { display: false }
                }
            }
        }
    });
}

// Get last 30 days in YYYY-MM-DD format
function getLast30Days() {
    const dates = [];
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
}

// Render leaderboard (today only)
async function renderLeaderboard() {
    const list = document.getElementById('leaderboardList');
    if (!list || !window.users || !window.dailyStats) return;
    list.innerHTML = '';

    const today = new Date().toISOString().split('T')[0];
    const todayStats = window.dailyStats[today] || {};

    const rankings = window.users
        .map(u => ({ ...u, solved: todayStats[u.leetcode_username] || 0 }))
        .sort((a, b) => b.solved - a.solved);

    rankings.forEach((u, idx) => {
        const item = document.createElement('div');
        item.className = 'rank-item';
        item.innerHTML = `
            <div class="rank-badge">#${idx + 1}</div>
            <div class="rank-info">
                <div class="rank-name">${u.display_name}</div>
            </div>
            <div class="rank-score">${u.solved}</div>
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
