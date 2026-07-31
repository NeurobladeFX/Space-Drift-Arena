# Tree Image Size Recommendations

## Recommended Dimensions

For the **jungle tree image** (`tree_jungle_01.png`), here are the recommended sizes:

### Option 1: Standard Resolution (Recommended)
- **Size:** 256 x 512 pixels
- **Format:** PNG with transparent background
- **Why:** Good balance between quality and file size. Trees will scale nicely from 1.2x to 2.7x based on the current scale settings.

### Option 2: High Resolution (Best Quality)
- **Size:** 512 x 1024 pixels  
- **Format:** PNG with transparent background
- **Why:** Better for zoomed views and maintains crisp details when scaled up. May increase file size.

### Option 3: Compact (Performance)
- **Size:** 128 x 256 pixels
- **Format:** PNG with transparent background
- **Why:** Smaller file size, faster loading. May look pixelated when scaled to maximum (2.7x).

## Current Scaling Behavior

In the game code, trees are scaled with this formula:
```javascript
scale: 1.2 + Math.random() * 1.5  // Results in 1.2x to 2.7x scale
```

So if you use a **256x512** tree image:
- Smallest tree: 307 x 614 pixels (1.2x scale)
- Largest tree: 691 x 1382 pixels (2.7x scale)

## Design Guidance

- **Aspect Ratio:** Vertical/portrait orientation works best (width:height ratio of 1:2 or similar)
- **Trunk Position:** Place the trunk at the bottom of the image
- **Canopy:** Should be in the upper 2/3 of the image
- **Transparency:** Use a transparent background (white background will be visible in-game unless removed)
- **Style:** Match the 2D side-scroller style you specified in the prompts

## My Recommendation

**Use 256 x 512 pixels** for the tree image. This provides excellent quality at scale while keeping file sizes reasonable for web gameplay.
