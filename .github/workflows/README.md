# Version Check GitHub Action

This GitHub Action automatically checks that the version in `package.json` is increased when creating pull requests to the `main` branch.

## How it works

1. **Triggers**: Runs on pull requests to `main` branch that modify `package.json`
2. **Version Comparison**: Compares the version in the PR branch vs the main branch
3. **Semantic Versioning**: Uses proper semantic version comparison (major.minor.patch)
4. **Status Check**: Fails the PR check if version is not increased

## Version Requirements

The action requires that the new version be greater than the current version on main:

- ✅ `0.1.0` → `0.1.1` (patch increase)
- ✅ `0.1.0` → `0.2.0` (minor increase) 
- ✅ `0.1.0` → `1.0.0` (major increase)
- ❌ `0.1.0` → `0.1.0` (no change)
- ❌ `0.1.1` → `0.1.0` (version decrease)

## Error Messages

When the version check fails, you'll see a detailed error message explaining:
- Current version on main branch
- Version in your PR
- Semantic versioning guidelines

## How to Fix

Update the `version` field in `package.json` according to semantic versioning:

```json
{
  "version": "0.1.1"  // Increase this value
}
```

Follow [semantic versioning](https://semver.org/) guidelines:
- **Major**: Breaking changes (1.0.0 → 2.0.0)
- **Minor**: New features (1.0.0 → 1.1.0) 
- **Patch**: Bug fixes (1.0.0 → 1.0.1)