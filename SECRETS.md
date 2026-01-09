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

## Required Secret: `GIST_TOKEN`

This project’s GitHub Actions workflow updates a GitHub Gist with daily stats. That requires a Personal Access Token (classic) with the `gist` scope.

### Create the token
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name it (e.g., `lc-gist-updater`), select the `gist` scope, then generate and copy the token.

### Add the repo secret
1. In your repository: Settings → Secrets and variables → Actions
2. New repository secret
3. Name: `GIST_TOKEN`
4. Value: paste the token

The workflow references this as:

```yaml
env:
  GIST_TOKEN: ${{ secrets.GIST_TOKEN }}
```

### Local development
You can also place the token in a local `.env` file for testing (already gitignored):

```
GIST_TOKEN=ghp_your_token_here
```

### Notes
- Scope needed: only `gist`
- The token can be from any GitHub account that has access to the target Gist
- Rotate the token if it’s leaked; avoid committing `.env` (already ignored in `.gitignore`)

## Optional Secrets for Future Features

If you add features later, consider secrets for:
- Database URLs (MongoDB, Firebase)
- API keys (notifications, analytics)
- Email credentials
- Discord webhook URLs
