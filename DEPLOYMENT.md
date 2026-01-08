# LeetCode Daily Tracker - Deployment Checklist

## Pre-Deployment

- [ ] Edit `data/users.json` with your friends' LeetCode usernames
- [ ] Verify all usernames are correct (LeetCode usernames are case-sensitive)
- [ ] Customize colors in `data/users.json` if desired
- [ ] Test locally by running `python -m http.server 8000`

## GitHub Setup

- [ ] Push code to GitHub repository
- [ ] Enable GitHub Pages in **Settings → Pages**
- [ ] Select **main branch** as source
- [ ] Wait for deployment (check deployments tab)

## First Run

- [ ] Go to **Actions** tab
- [ ] Select **Update LeetCode Stats Daily**
- [ ] Click **Run workflow**
- [ ] Wait for it to complete
- [ ] Check `data/daily_stats.json` for updates

## Verify Deployment

- [ ] Visit `https://yourusername.github.io/leetcode-daily-tracker`
- [ ] Verify page loads with correct styling
- [ ] Check if graphs display correctly
- [ ] Verify leaderboard shows all users
- [ ] Check if streak information is visible

## Ongoing Maintenance

- [ ] Workflow runs daily at 12:05 AM IST
- [ ] Check GitHub Actions for any failures
- [ ] Monitor if any users change their LeetCode usernames

## Customize (Optional)

- [ ] Change accent colors in `style.css`
- [ ] Modify cron schedule in `.github/workflows/update.yml`
- [ ] Add more users anytime by editing `data/users.json`

## Troubleshooting

If the workflow fails:
1. Check **Actions → Run details** for error messages
2. Verify usernames are public on LeetCode
3. Check network connectivity in logs
4. Try manual workflow trigger from Actions tab

---

Once deployed, share the GitHub Pages link with your friends!
