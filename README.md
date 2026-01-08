# ⚔️ LeetCode Daily Tracker

A daily-updating LeetCode progress tracker for a group of friends with a **Scott Pilgrim / retro arcade** aesthetic. Tracks problems solved per day, displays graphs, rankings, and streaks—all hosted FREE on GitHub Pages!

## 🎮 Features

✅ **Daily Auto-Updates** - GitHub Actions fetches data every day at 12:05 AM IST
✅ **No Backend Required** - 100% static (HTML + CSS + JS)
✅ **Beautiful Visualizations** - Line graphs showing daily progress
✅ **Leaderboard** - Real-time rankings with streak tracking
✅ **Streak Tracking** - 🔥 Current streaks and max streaks
✅ **Retro Arcade Vibe** - Pixel fonts, bright colors, animations
✅ **Free Hosting** - GitHub Pages

## 🎨 Tech Stack

- **Frontend**: HTML + CSS + Vanilla JavaScript
- **Charts**: Chart.js
- **Fonts**: Press Start 2P, Comic Neue, VT323
- **Data**: JSON files (users.json, daily_stats.json)
- **API**: LeetCode GraphQL API
- **Automation**: GitHub Actions
- **Hosting**: GitHub Pages

## 🚀 Setup Instructions

### 1. **Fork/Clone the Repository**

```bash
git clone https://github.com/yourusername/leetcode-daily-tracker.git
cd leetcode-daily-tracker
```

### 2. **Configure Users**

Edit `data/users.json` to add your friends:

```json
[
  {
    "leetcode_username": "austin",
    "display_name": "Austin",
    "color": "#FF006E"
  },
  {
    "leetcode_username": "rahul",
    "display_name": "Rahul",
    "color": "#00D9FF"
  }
]
```

**Note**: LeetCode username is case-sensitive and must match their public profile URL.

### 3. **Enable GitHub Pages**

1. Go to **Settings → Pages**
2. Set source to **main branch** (or your default branch)
3. Save and wait for deployment

### 4. **Set Up GitHub Actions**

The workflow is already configured in `.github/workflows/update.yml` to run daily.

**To manually trigger an update:**
1. Go to **Actions → Update LeetCode Stats Daily**
2. Click **Run workflow**

### 5. **Test Locally** (Optional)

```bash
# Python 3
python -m http.server 8000

# Or Node.js
npm install -g http-server
http-server
```

Then open `http://localhost:8000` in your browser.

## 📊 Data Structure

### `data/users.json`
```json
[
  {
    "leetcode_username": "string",
    "display_name": "string",
    "color": "#hexcolor"
  }
]
```

### `data/daily_stats.json`
```json
{
  "2026-01-07": {
    "austin": 3,
    "rahul": 1,
    "alex": 2
  },
  "2026-01-06": {
    "austin": 2,
    "rahul": 3,
    "alex": 1
  }
}
```

## 🔧 How It Works

1. **Daily Trigger**: GitHub Actions runs the workflow at 12:05 AM IST
2. **Fetch Data**: `scripts/update-stats.js` queries LeetCode GraphQL API for each user
3. **Update JSON**: Adds today's submission count to `daily_stats.json`
4. **Push Changes**: Commits and pushes to repo
5. **GitHub Pages**: Automatically serves updated data

## 🎨 Customization

### Colors
Change hex colors in `data/users.json`:
```json
"color": "#FF006E"
```

### Fonts
Edit `style.css` to change fonts:
```css
font-family: 'Press Start 2P', cursive;
```

### Cron Schedule
Edit `.github/workflows/update.yml` line 8:
```yaml
- cron: '35 18 * * *'  # 12:05 AM IST (18:35 UTC)
```

## 📱 Viewing the Tracker

Your tracker will be live at:
```
https://yourusername.github.io/leetcode-daily-tracker
```

## 🔗 Share Your Tracker

Copy the GitHub Pages link and share with friends!

## ❓ Troubleshooting

### Data not updating?
- Check **Actions** tab for workflow errors
- Verify LeetCode usernames are correct (case-sensitive)
- Check if users have public LeetCode profiles

### Styling looks broken?
- Clear browser cache (Ctrl+Shift+Delete)
- Make sure all CSS file paths are correct
- Verify CSS file is served (check Network tab)

### Graph not showing?
- Check browser console for JavaScript errors (F12)
- Verify `data/daily_stats.json` exists and has data
- Ensure Chart.js CDN is accessible

## 📝 Notes

- **Rate Limiting**: The script adds 1-second delays between API requests to avoid rate limits
- **Timezone**: All dates use your local timezone (configurable in JS)
- **First Run**: Initialize `data/daily_stats.json` with sample data before first deployment
- **Manual Updates**: Run `node scripts/update-stats.js` locally to test

## 🎯 Future Features

- [ ] Week/month view
- [ ] Problem difficulty tracking
- [ ] Badge system
- [ ] Animations on rank changes
- [ ] Export stats as image
- [ ] Dark mode toggle

## 📄 License

MIT - Feel free to use this for your own tracker!

## 🤝 Contributing

Pull requests welcome! Feel free to:
- Add new users
- Improve styling
- Add features
- Report bugs

---

**Made with ❤️ for LeetCode grinders** ⚔️
