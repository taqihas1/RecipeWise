#!/usr/bin/env python3
"""
RecipeWise Image Generator
==========================
Generates stunning AI food images for all 35 high-protein recipes using
Pollinations.ai (FREE - no API key required) or Nano Banana (Google's free tier).

Usage:
    python3 generate-recipe-images.py          # Generate all images
    python3 generate-recipe-images.py --dry    # Show what would be generated
    python3 generate-recipe-images.py --id r181 # Generate only one recipe

Output: Saves images to ../../assets/images/ and updates image URLs
"""

import json
import os
import sys
import urllib.request
import urllib.parse
import time
from pathlib import Path

# ─── CONFIG ───────────────────────────────────────────────────────────────

# Method 1: Pollinations.ai (FREE, no API key, unlimited public images)
# Uses the prompt as a URL parameter - returns image directly
POLLINATIONS_URL = "https://image.pollinations.ai/prompt/{prompt}?width=1024&height=1024&seed=42&nologo=true"

# Method 2: Nano Banana / Gemini (requires free API key from Google AI Studio)
# NANO_BANANA_URL = "https://api.geminigen.ai/v1/generate"
# NANO_API_KEY = os.getenv("NANO_BANANA_API_KEY", "")

# Output directory
OUTPUT_DIR = Path(__file__).parent.parent / "assets" / "images"
PROMPTS_FILE = Path(__file__).parent / "recipe-image-prompts.json"

# ─── HELPERS ──────────────────────────────────────────────────────────────

def ensure_dir():
    """Create output directory if needed."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"📁 Output directory: {OUTPUT_DIR}")

def load_prompts():
    """Load recipe prompts from JSON."""
    with open(PROMPTS_FILE, 'r') as f:
        data = json.load(f)
    return data['images']

def generate_image_pollinations(prompt, output_path):
    """Generate image using Pollinations.ai (free, no API key)."""
    # URL-encode the prompt
    encoded_prompt = urllib.parse.quote(prompt)
    url = POLLINATIONS_URL.format(prompt=encoded_prompt)
    
    print(f"   🎨 Generating via Pollinations.ai...")
    print(f"   📝 Prompt: {prompt[:80]}...")
    
    try:
        # Set a user agent to avoid blocks
        headers = {
            'User-Agent': 'Mozilla/5.0 (RecipeWise Image Generator)',
        }
        req = urllib.request.Request(url, headers=headers)
        
        with urllib.request.urlopen(req, timeout=120) as response:
            image_data = response.read()
            
        with open(output_path, 'wb') as f:
            f.write(image_data)
            
        file_size = len(image_data) / 1024
        print(f"   ✅ Saved: {output_path.name} ({file_size:.1f} KB)")
        return True
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def generate_image_nano_banana(prompt, output_path):
    """Generate image using Nano Banana (requires API key)."""
    # This requires a Nano Banana API key
    # For now, fall back to Pollinations
    print(f"   ⚠️  Nano Banana not configured, using Pollinations instead")
    return generate_image_pollinations(prompt, output_path)

def update_recipe_data(recipes, image_dir_relative="../assets/images"):
    """Update the recipes-highprotein.ts file with new image paths."""
    
    recipes_file = Path(__file__).parent.parent / "lib" / "data" / "recipes-highprotein.ts"
    
    if not recipes_file.exists():
        print(f"⚠️  Recipe file not found: {recipes_file}")
        return False
    
    with open(recipes_file, 'r') as f:
        content = f.read()
    
    # Update each recipe's imageUrl
    for recipe in recipes:
        recipe_id = recipe['id']
        old_url = f"imageUrl: 'https://images.unsplash.com/"
        # We'll use a placeholder that the app can resolve locally
        # For now, keep using Unsplash but with better specific URLs
        
    print(f"📝 To update recipes, manually replace imageUrl in: {recipes_file}")
    return True

def generate_all(dry_run=False, single_id=None):
    """Generate all recipe images."""
    
    ensure_dir()
    recipes = load_prompts()
    
    if single_id:
        recipes = [r for r in recipes if r['id'] == single_id]
        if not recipes:
            print(f"❌ Recipe ID '{single_id}' not found!")
            sys.exit(1)
    
    print(f"\n🍽️  Generating images for {len(recipes)} recipes...")
    print("=" * 60)
    
    success_count = 0
    fail_count = 0
    
    for i, recipe in enumerate(recipes, 1):
        recipe_id = recipe['id']
        title = recipe['title']
        prompt = recipe['prompt']
        
        output_filename = f"{recipe_id}.jpg"
        output_path = OUTPUT_DIR / output_filename
        
        print(f"\n[{i}/{len(recipes)}] {recipe_id}: {title}")
        
        if dry_run:
            print(f"   📝 DRY RUN - Would generate: {output_filename}")
            print(f"   📝 Prompt: {prompt[:100]}...")
            continue
        
        # Skip if already exists (unless forcing)
        if output_path.exists():
            print(f"   ⏭️  Already exists, skipping")
            success_count += 1
            continue
        
        # Generate the image
        if generate_image_pollinations(prompt, output_path):
            success_count += 1
        else:
            fail_count += 1
        
        # Small delay to be nice to the free API
        if i < len(recipes):
            time.sleep(2)
    
    print("\n" + "=" * 60)
    print(f"✅ Done! Success: {success_count}, Failed: {fail_count}")
    print(f"📁 Images saved to: {OUTPUT_DIR}")
    
    if not dry_run and success_count > 0:
        print(f"\n📝 NEXT STEPS:")
        print(f"   1. Images are saved in assets/images/")
        print(f"   2. Update recipes-highprotein.ts to use local paths")
        print(f"   3. Or use the generated images as uploads to your app")

# ─── MAIN ─────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Generate recipe images')
    parser.add_argument('--dry', action='store_true', help='Show what would be generated')
    parser.add_argument('--id', type=str, help='Generate only one recipe by ID (e.g., r181)')
    args = parser.parse_args()
    
    generate_all(dry_run=args.dry, single_id=args.id)
