# Font Setup Instructions

Your website is configured to use these custom fonts from your invitation design:

1. **Elgraine** - For titles and headings
2. **La Bella Aurore** - For calligraphy/script text
3. **Artica** - For body text

## Adding Your Font Files

1. **Create the fonts directory** (already created):
   ```
   public/fonts/
   ```

2. **Add your font files** to `public/fonts/` with these exact names:

   **Elgraine:**
   - `Elgraine-Regular.woff2`
   - `Elgraine-Bold.woff2` (optional, if you have a bold weight)

   **La Bella Aurore:**
   - `LaBellaAurore-Regular.woff2`

   **Artica:**
   - `Artica-Regular.woff2`
   - `Artica-Medium.woff2` (optional)
   - `Artica-Bold.woff2` (optional)

## Converting Font Files

If you have `.ttf`, `.otf`, or other font formats, convert them to `.woff2`:

### Using Online Tools:
- https://cloudconvert.com/ttf-to-woff2
- https://convertio.co/ttf-woff2/

### Using Command Line (if you have `woff2` tools):
```bash
# Install woff2 tools (macOS)
brew install woff2

# Convert fonts
woff2_compress YourFont.ttf
```

## Font File Naming

Make sure your font files are named exactly as shown above. The code looks for:
- `Elgraine-Regular.woff2` and `Elgraine-Bold.woff2`
- `LaBellaAurore-Regular.woff2`
- `Artica-Regular.woff2`, `Artica-Medium.woff2`, `Artica-Bold.woff2`

## Using the Fonts in Your Code

The fonts are automatically applied:

- **Headings (h1, h2, etc.)**: Use `font-title` class or default (Elgraine)
- **Script/Calligraphy text**: Use `font-script` class (La Bella Aurore)
- **Body text**: Use `font-body` class or default (Artica)

Example:
```tsx
<h1 className="font-title">Kevin & Tiffany</h1>
<p className="font-script">invite you to celebrate</p>
<p className="font-body">Regular body text</p>
```

## Fallback Fonts

If font files aren't found, the site will use:
- Elgraine → Georgia, serif
- La Bella Aurore → Brush Script MT, cursive
- Artica → system-ui, sans-serif

## Testing

After adding your font files:
1. Restart your dev server: `npm run dev`
2. Check the browser console for any font loading errors
3. The fonts should load automatically

