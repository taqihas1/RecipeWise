#!/bin/bash
# Download all recipe images from Unsplash for local use
# Run: ./download-images.sh

OUTPUT_DIR="../assets/images"
mkdir -p "$OUTPUT_DIR"

echo "🍽️ Downloading Recipe Images..."
echo "=============================="

# Chicken recipes
curl -sL "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80" -o "$OUTPUT_DIR/r181-buffalo-chicken-bowl.jpg" &
curl -sL "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800&q=80" -o "$OUTPUT_DIR/r182-lemon-herb-chicken.jpg" &
curl -sL "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=800&q=80" -o "$OUTPUT_DIR/r183-chicken-fajita-bowl.jpg" &
curl -sL "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=80" -o "$OUTPUT_DIR/r184-chicken-tenders.jpg" &
curl -sL "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80" -o "$OUTPUT_DIR/r185-mediterranean-chicken.jpg" &

# Beef recipes
curl -sL "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=80" -o "$OUTPUT_DIR/r186-steak-eggs.jpg" &
curl -sL "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80" -o "$OUTPUT_DIR/r187-ground-beef-bowl.jpg" &
curl -sL "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80" -o "$OUTPUT_DIR/r188-beef-stirfry.jpg" &
curl -sL "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800&q=80" -o "$OUTPUT_DIR/r189-meatballs.jpg" &
curl -sL "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80" -o "$OUTPUT_DIR/r190-beef-soup.jpg" &
curl -sL "https://images.unsplash.com/photo-1628191010210-a59de33e5941?w=800&q=80" -o "$OUTPUT_DIR/r191-steak-lettuce-wraps.jpg" &
curl -sL "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&q=80" -o "$OUTPUT_DIR/r192-breakfast-burrito.jpg" &

# Fish & Seafood
curl -sL "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80" -o "$OUTPUT_DIR/r193-garlic-butter-salmon.jpg" &
curl -sL "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80" -o "$OUTPUT_DIR/r194-tuna-poke.jpg" &
curl -sL "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&q=80" -o "$OUTPUT_DIR/r195-shrimp-scampi.jpg" &
curl -sL "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80" -o "$OUTPUT_DIR/r196-cod-foil.jpg" &
curl -sL "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&q=80" -o "$OUTPUT_DIR/r197-shrimp-tacos.jpg" &
curl -sL "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80" -o "$OUTPUT_DIR/r198-salmon-patties.jpg" &
curl -sL "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80" -o "$OUTPUT_DIR/r199-miso-cod.jpg" &

# Tofu & Vegetarian
curl -sL "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80" -o "$OUTPUT_DIR/r201-tofu-buddha.jpg" &
curl -sL "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80" -o "$OUTPUT_DIR/r202-tofu-stirfry.jpg" &

# Eggs & Dairy
curl -sL "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80" -o "$OUTPUT_DIR/r203-yogurt-parfait.jpg" &
curl -sL "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&q=80" -o "$OUTPUT_DIR/r204-egg-scramble.jpg" &
curl -sL "https://images.unsplash.com/photo-1577805947697-89e18249d767?w=800&q=80" -o "$OUTPUT_DIR/r205-protein-shake.jpg" &
curl -sL "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80" -o "$OUTPUT_DIR/r206-cottage-cheese.jpg" &
curl -sL "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&q=80" -o "$OUTPUT_DIR/r213-egg-salad.jpg" &

# Turkey
curl -sL "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&q=80" -o "$OUTPUT_DIR/r207-turkey-wraps.jpg" &
curl -sL "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80" -o "$OUTPUT_DIR/r208-turkey-chili.jpg" &
curl -sL "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&q=80" -o "$OUTPUT_DIR/r209-egg-muffins.jpg" &

# Lamb
curl -sL "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=80" -o "$OUTPUT_DIR/r210-lamb-chops.jpg" &
curl -sL "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80" -o "$OUTPUT_DIR/r211-lamb-skewers.jpg" &

# Pancakes & Special
curl -sL "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80" -o "$OUTPUT_DIR/r212-protein-pancakes.jpg" &
curl -sL "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&q=80" -o "$OUTPUT_DIR/r214-seared-scallops.jpg" &
curl -sL "https://images.unsplash.com/photo-1504387828636-abeb50778c0c?w=800&q=80" -o "$OUTPUT_DIR/r215-overnight-oats.jpg" &

wait

echo ""
echo "✅ All downloads complete!"
echo "📁 Images saved to: $OUTPUT_DIR"
echo ""
ls -la "$OUTPUT_DIR"/*.jpg | wc -l
echo " images downloaded"
