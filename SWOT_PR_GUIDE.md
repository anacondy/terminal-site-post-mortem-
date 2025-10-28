# Understanding Your SWOT PR Issue

## What Happened?

You created Pull Request #2 in your fork repository `anacondy/swot` with the intention of adding **SS Jain Subodh PG College** to the JetBrains SWOT database. However, the PR was created and merged in the **wrong direction**.

### The Issue

- **What you intended**: Create a PR from `anacondy/swot` → `JetBrains/swot` (fork to upstream)
- **What actually happened**: Created a PR from `JetBrains/swot` → `anacondy/swot` (upstream to fork)

When the PR was merged on March 30, 2025, it merged **into your fork only**, not into the official JetBrains/swot repository where the college database actually lives.

## Why Your College Isn't in the Database

The JetBrains SWOT repository (`JetBrains/swot`) is the authoritative source that companies like JetBrains use to verify educational emails. Since your PR was merged into your personal fork (`anacondy/swot`) instead of the upstream repository, your college information was never added to the official database.

**Your fork** = Your personal copy of the repository  
**Upstream (JetBrains/swot)** = The official repository everyone uses

## How to Fix This

Follow these steps to properly submit your college to the official JetBrains SWOT database:

### Step 1: Check if Your College is Already in the Upstream

Before submitting, verify your college isn't already in the official database:

1. Go to https://github.com/JetBrains/swot
2. Navigate to the appropriate directory structure (usually organized by country/domain)
3. Search for your college domain: `subodhpgcollege.com`

### Step 2: Sync Your Fork (If Needed)

Make sure your fork is up-to-date with the upstream repository:

1. Go to your fork: https://github.com/anacondy/swot
2. Click the "Sync fork" button if it appears
3. If there are commits behind, click "Update branch"

### Step 3: Make the Changes in Your Fork

1. In your fork repository, navigate to the correct directory for Indian colleges
   - Path is usually: `lib/domains/in/` 
2. Find or create the appropriate file for your college's domain
   - For `subodhpgcollege.com`, create/edit: `lib/domains/in/subodhpgcollege.com.txt`
3. Add the college information in the required format:
   ```
   SS Jain Subodh PG College
   ```

### Step 4: Create a Pull Request to the Upstream

**Important**: This time, create the PR in the correct direction!

1. Go to the official JetBrains repository: https://github.com/JetBrains/swot
2. Click on "Pull requests" tab
3. Click "New pull request"
4. Click "compare across forks"
5. Set the branches correctly:
   - **base repository**: `JetBrains/swot` (upstream)
   - **base branch**: `master`
   - **head repository**: `anacondy/swot` (your fork)
   - **compare branch**: your branch with changes
6. Create the pull request with a clear title and description
7. Wait for maintainers to review and merge

### Step 5: Be Patient

- The JetBrains SWOT repository receives many PRs
- Maintainers may take time to review
- They may ask for changes or verification
- Be responsive to feedback

## Common GitHub Fork/PR Mistakes

### Mistake 1: Creating PR in Your Own Repository
- ❌ Creating PR from `JetBrains/swot` to `anacondy/swot`
- ✅ Creating PR from `anacondy/swot` to `JetBrains/swot`

### Mistake 2: Not Syncing Fork Before Changes
- Always sync your fork with upstream before making new changes
- Prevents merge conflicts and outdated code

### Mistake 3: Wrong Base Branch
- Most projects use `main` or `master` as the default branch
- Check which branch the project uses before creating PR

## Verifying Your College is Added

After your PR is merged into `JetBrains/swot`:

1. Wait 24-48 hours for caches to update
2. Try registering your college email with JetBrains Student Program
3. Check the GitHub repository to confirm your file exists in `JetBrains/swot`

## Getting Help

If you need assistance:

1. **Read the SWOT README**: https://github.com/JetBrains/swot#readme
2. **Check existing PRs**: See how others submitted their colleges
3. **Ask in discussions**: Use GitHub Discussions if available
4. **Be specific**: Provide your college domain and country when asking for help

## Summary

Your PR #2 is in your fork, not in the official JetBrains repository. To get your college added to the official database:

1. Create the college entry in your fork (`anacondy/swot`)
2. Submit a NEW pull request FROM your fork TO `JetBrains/swot`
3. Wait for review and approval
4. Your college will then be in the official database

Remember: Changes in your fork don't affect the upstream repository until a PR is created and merged **into the upstream**!

---

**Need More Help?**

- JetBrains SWOT Repository: https://github.com/JetBrains/swot
- GitHub Fork Documentation: https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks
- Creating a PR: https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request-from-a-fork
