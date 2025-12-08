# Rezar Aluminium Company Website

A clean, modern, responsive brochure + e-commerce style website for Rezar Aluminium Company, built with HTML5, CSS3, and vanilla JavaScript.

## Features

- **Responsive Design**: Mobile-first approach with breakpoints for desktop, laptop, tablet, and mobile
- **E-commerce Functionality**: Product catalog, shopping cart, checkout process
- **Product Management**: Filtering and sorting by category and price
- **Interactive Elements**: Draggable WhatsApp button, product galleries with lightbox, toast notifications
- **Accessibility**: WCAG AA compliant with keyboard navigation, semantic HTML, and alt text
- **SEO Optimized**: Meta tags, structured data, and performance optimizations
- **Static Site**: No server-side dependencies, easy to deploy

## Pages

- **Home** (`index.html`): Hero banner, featured products, services overview
- **Products** (`products.html`): Product listing with filtering and sorting
- **Product Details** (`product.html?id=<productId>`): Detailed product view with gallery
- **Cart** (`cart.html`): Shopping cart with quantity management
- **Checkout** (`checkout.html`): Customer information and order confirmation
- **About** (`about.html`): Company story, team, and values
- **Contact** (`contact.html`): Contact form and company information

## File Structure

```
rezar-aluminium/
├── index.html              # Home page
├── products.html           # Products listing
├── product.html            # Product details
├── cart.html               # Shopping cart
├── checkout.html           # Checkout process
├── about.html              # About us
├── contact.html            # Contact page
├── css/
│   └── main.css            # Main stylesheet
├── js/
│   └── main.js             # Main JavaScript
├── data/
│   └── products.json       # Product data
├── assets/
│   ├── logo.svg            # Company logo
│   ├── hero-bg.jpg         # Hero background image
│   ├── products/           # Product images
│   └── team/               # Team member photos
└── README.md               # This file
```

## Setup Instructions

1. **Clone or Download**: Get the project files to your local machine
2. **Open in Browser**: Open `index.html` in any modern web browser
3. **No Build Required**: This is a static site with no dependencies

## Adding Products

Products are stored in `data/products.json`. Each product object should follow this schema:

```json
{
  "id": "unique-id",
  "name": "Product Name",
  "category": "Category Name",
  "short_description": "Brief description",
  "price": 100.00,
  "currency": "GHS",
  "images": ["/assets/products/image1.jpg", "/assets/products/image2.jpg"],
  "specs": {
    "dimensions": "Width x Height",
    "material": "Material description",
    "finish": "Finish type",
    "glass": "Glass specifications"
  },
  "stock": 10,
  "slug": "url-friendly-name"
}
```

### Steps to Add a Product:

1. Add product images to `assets/products/`
2. Add product data to `data/products.json`
3. Ensure image paths match the `images` array
4. Test the product appears in the products page

## Customization

### Branding
- Replace `assets/logo.svg` with your company logo
- Update brand colors in `css/main.css` (CSS variables at the top)
- Change font family in CSS variables if needed

### Contact Information
Replace the following placeholders throughout the site:
- `REPLACE_WITH_E164_PHONE_NUMBER`: WhatsApp number in E.164 format (e.g., 233XXXXXXXXX)
- `REPLACE_WITH_ACTUAL_ADDRESS`: Company address
- `REPLACE_WITH_CONTACT_EMAIL`: Contact email
- `REPLACE_WITH_CONTACT_PHONE`: Contact phone number

### Content
- Update company information in `about.html`
- Modify services in the home page
- Add team members in `about.html`

### Forms
- Contact form uses Formspree (update the action URL)
- Checkout is client-side only (integrate with payment gateway for production)

## Deployment

This is a static site that can be deployed to any static hosting service:

### GitHub Pages
1. Push to a GitHub repository
2. Go to Settings > Pages
3. Select "Deploy from a branch" and choose `main`
4. Site will be available at `https://username.github.io/repository-name`

### Netlify
1. Drag and drop the project folder to [netlify.com](https://netlify.com)
2. Site deploys automatically
3. Custom domain available

### Vercel
1. Import the project from GitHub
2. Deploy automatically
3. Custom domain support

### Other Options
- Firebase Hosting
- AWS S3 + CloudFront
- Any web server

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- Optimized images (lazy loading recommended for production)
- Minified CSS and JS (use build tools for production)
- Service worker ready (optional caching implementation)

## Development Notes

- Code is modular with ES6 features
- Cart data persists in localStorage
- No external dependencies (vanilla JS)
- Mobile menu uses CSS transforms for smooth animations

## License

This project is provided as-is for Rezar Aluminium Company. Commercial use requires permission.

## Support

For technical support or customization requests, contact the development team.