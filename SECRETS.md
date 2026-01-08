# GitHub Actions Secrets Configuration

## Why Secrets?

While the basic tracker works with public data, if you want to add features like:
- Private user data
- Database storage
- Email notifications
- Analytics

You may need to store sensitive information securely.

## Setting Up Secrets in GitHub

1. Go to your repository
2. **Settings → Secrets and variables → Actions**
3. Click **New repository secret**
4. Add secrets as needed:

```
LEETCODE_API_KEY = (if LeetCode adds API auth)
GITHUB_TOKEN = (already provided by GitHub Actions)
```

## Example: Using Secrets in Workflow

```yaml
- name: Fetch LeetCode data
  run: node scripts/update-stats.js
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Current Implementation

The default setup does **NOT** require any secrets because:
- ✅ Uses public LeetCode GraphQL API
- ✅ No authentication needed
- ✅ No external services required
- ✅ Data stored in public JSON files

## If You Want to Add More Features

Consider adding secrets for:
- Database URLs (MongoDB, Firebase)
- API keys (for notifications, analytics)
- Email credentials
- Discord webhook URLs

---

For now, just deploy as-is—it works without any secrets!
