# Assets

This directory contains static resources and assets for the application.

## Overview

Static assets like images, icons, fonts, and other media files that are used throughout the application. These files are processed by Vite's asset pipeline and can be imported directly into components.

## Usage

### Importing Assets

```tsx
// Import as URL string (recommended for most cases)
import logoUrl from './logo.svg';

// Import as React component (for SVGs only)
import { ReactComponent as Logo } from './logo.svg';

// Usage in component
export const MyComponent = () => (
	<div>
		<img src={logoUrl} alt='Logo' />
		<Logo className='svg-logo' />
	</div>
);
```

### Supported File Types

- **Images**: `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.avif`
- **Vectors**: `.svg` (can be imported as components or URLs)
- **Documents**: `.pdf`, `.json`, `.xml`
- **Other**: Any static file needed by the application

## Best Practices

### SVG Files

- **React Components**: Not all SVGs are compatible with React component imports
- **Conversion Tool**: Use [svg2jsx.com](https://svg2jsx.com/) to convert SVGs to React-compatible format
- **Optimization**: Consider optimizing SVGs with [SVGO](https://svgo.dev/) before adding them

### Image Optimization

- Use modern formats like WebP or AVIF when possible
- Provide appropriate sizes for different screen densities
- Consider using responsive images with `srcset` attribute

### Organization

- Group related assets in subdirectories (e.g., `icons/`, `images/`)
- Use descriptive file names
- Keep file sizes reasonable for web delivery

### Performance Tips

- Lazy load large images when possible
- Use appropriate image formats for the content type
- Consider using CSS sprites for small icons
- Leverage Vite's asset optimization features

## Asset Processing

Vite automatically processes assets in this directory:

- Files smaller than 4KB are inlined as base64 URLs
- Larger files get unique hash names for cache busting
- Import URLs are automatically resolved at build time

## Examples

### Dynamic Imports

```tsx
// Dynamic import for code splitting
const loadImage = async () => {
	const { default: imageUrl } = await import('./large-image.png');
	return imageUrl;
};
```

### CSS Background Images

```css
.hero-background {
	background-image: url('./hero-image.jpg');
}
```

### Public Assets

For assets that need to be referenced by URL without importing (like in `index.html`), place them in the `public/` directory instead.
