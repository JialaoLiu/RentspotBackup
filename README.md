# Group Repository for COMP SCI 2207/7207 Web & Database Computing Web Application Project (2023 Semester 1)

Your group's shared repository for the WDC 2023 Web App Project.

Auto commit/push/sync to Github is disabled by default in this repository.
- Enable the GitDoc extension to use this fucntionality (either in your VSCode settings, or in the Dev Container settings)

See [HERE](https://myuni.adelaide.edu.au/courses/85266/pages/2023-web-application-group-project-specification) for the project specification.

We recommend using the 'Shared Repository Model (Branch & Pull)' to collaborate on your work in this single repostory.
- You can read more about collaborating on GitHub repositories [HERE](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests)
- When working on the same file at the same time, the 'Live Share' feature in VSCode can also help.

# RentSpot AU - Git Branch Usage Guide

To ensure clean collaboration, **each team member must work on their own branch**.
**Never commit directly to the `main` branch.** All changes must go through pull requests (PRs).

## Assigned Development Branches

| Member     | Branch Name     |
|------------|-----------------|
| Jialao     | `dev/jialao`    |
| Nhat Tan   | `dev/nhattan`   |
| Deze       | `dev/deze`      |

## Step 1: Create Your Branch (One-time setup)

Start from the latest `main` branch:

```bash
git checkout main
git pull origin main

git checkout -b dev/yourname
git push -u origin dev/yourname
```

Replace `yourname` with your actual name or alias.

## Step 2: Keep Your Branch Updated with `main`

Before you start working, always sync with the latest `main` to avoid conflicts:

```bash
git checkout main
git pull origin main

git checkout dev/yourname
git rebase main        # or: git merge main
```

If conflicts occur, fix them, then:

```bash
git add .
git rebase --continue
```

Then push your updated branch:

```bash
git push -f     # Use force push only after rebase
```

## Step 3: Commit and Push Your Changes

```bash
git add .
git commit -m "feat: add login page"
git push
```

## Step 4: Submit a Pull Request (PR)

After finishing your task:

1. Go to the GitHub repository
2. Click "Compare & pull request"
3. Fill in PR title and description (e.g., what changed, what was tested)
4. Submit PR → team lead will review and merge

## Step 5: How to Sync main into Your Branch When Behind

If your branch shows something like "33 commits behind main":

1. Go to the repository on GitHub
2. Switch to your branch (e.g., dev/jialao)
3. Click "Compare & pull request" (if available) to merge main into your branch

Or use terminal commands:
```bash
git checkout dev/yourname
git pull origin main
git push origin dev/yourname
```

## Notes

- Never commit or push directly to `main`
- Always work in your own branch (e.g., `dev/yournanme`)
- Sync with `main` regularly using rebase or merge
- All changes must go through a PR

If your branch shows **"nothing to compare"** when opening a PR, it means your branch was not created from the latest `main`. Please recreate your branch correctly or contact Jialao for help.

## Development Environment Setup

### Required Software
- Node.js (v16+)
- Visual Studio Code
- Git

### Project Setup

1. Install dependencies
```bash
npm install
```

2. Start the local development server
```bash
npm run dev
```
The project will automatically run at:
http://localhost:5173/

If you want to allow other devices on your local network to access it, you can run:
```bash
npm run dev -- --host
```

## Code Standards

### JavaScript Code Style Guide (.js files)

To ensure code consistency (and avoid errors during school computer demonstrations), please follow these JavaScript coding standards:

#### Basic Rules

- **Semicolons**
  Always add a semicolon (;) at the end of each statement to avoid potential issues caused by Automatic Semicolon Insertion (ASI).

---

Maintained: **Jialao**
