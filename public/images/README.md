# Product Images

Place product images in this directory structure:

## Organization Options

### Option 1: By Category
```
public/images/products/
  produce/
    bananas.jpg
    apples.jpg
    ...
  dairy/
    whole-milk.jpg
    eggs.jpg
    ...
```

### Option 2: Flat Structure (Simple)
```
public/images/products/
  banana.jpg
  apple.jpg
  whole-milk.jpg
  ...
```

### Option 3: By Product ID (Dynamic)
Store images with product IDs when products are created:
```
public/images/products/
  [product-id].jpg
```

## Image Naming Convention

For best results, name images to match product names:
- Product: "Whole Milk" → `whole-milk.jpg` or `whole-milk.png`
- Product: "Chicken Breast" → `chicken-breast.jpg`

## Supported Formats
- JPG/JPEG
- PNG
- WebP
- AVIF

## Image Size Recommendations
- Product grid thumbnails: 400x400px
- Product detail pages: 800x800px or larger
- Keep file sizes under 200KB for fast loading

