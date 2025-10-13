# Stealth Mode White Screen Fix

## Issue
After updating to the new stealth mode features, clicking the eye icon may cause a white screen.

## Cause
The stealth mode setting changed from a simple boolean to a complex object with multiple features. Old localStorage data conflicts with the new structure.

## Solution

### Option 1: Clear Browser Storage (Recommended)
1. Open browser DevTools (F12 or right-click → Inspect)
2. Go to Application tab (Chrome) or Storage tab (Firefox)
3. Find "Local Storage" in the left sidebar
4. Click on your app's domain (e.g., `http://localhost:5173`)
5. Find the key `balance-settings`
6. Right-click and delete it
7. Refresh the page

### Option 2: Fix in Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Paste this code and press Enter:
```javascript
localStorage.removeItem('balance-settings');
location.reload();
```

### Option 3: Manual Migration
1. Open browser DevTools (F12)
2. Go to Console tab
3. Paste this code and press Enter:
```javascript
const settings = JSON.parse(localStorage.getItem('balance-settings'));
if (settings && typeof settings.state.stealthMode === 'boolean') {
  settings.state.stealthMode = {
    enabled: settings.state.stealthMode,
    scaling: { enabled: false, percentage: 50 },
    hiddenCategories: { enabled: false, categoryIds: [] },
    noiseInjection: { enabled: false, frequency: 2, amountRange: { min: 5, max: 50 } }
  };
  settings.version = 2;
  localStorage.setItem('balance-settings', JSON.stringify(settings));
  location.reload();
}
```

## Automatic Migration
The app now includes automatic migration logic that should handle this on next update. The migration:
- Detects old boolean `stealthMode` values
- Converts them to the new object structure
- Preserves the enabled/disabled state
- Uses sensible defaults for new features

## Prevention
This issue has been fixed in the latest version. The store now includes:
- Version tracking (v2)
- Automatic migration on load
- Safety checks in all stealth mode functions
- Fallback to defaults for malformed data

## Still Having Issues?
If the white screen persists after trying the above:
1. Clear all browser data for the site
2. Refresh the page
3. You may need to log in again
4. All your Firebase data (transactions, categories, budgets) is safe - only local settings are affected

## Technical Details
The new stealth mode structure:
```typescript
stealthMode: {
  enabled: boolean,
  scaling: {
    enabled: boolean,
    percentage: number  // 10-100
  },
  hiddenCategories: {
    enabled: boolean,
    categoryIds: string[]
  },
  noiseInjection: {
    enabled: boolean,
    frequency: number,
    amountRange: { min: number, max: number }
  }
}
```

Old structure (deprecated):
```typescript
stealthMode: boolean
```
