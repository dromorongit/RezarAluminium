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
├── data/                   # Legacy (no longer used)
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

**IMPORTANT**: Products are now managed through the **Production API** and **Admin Dashboard**. The system no longer uses local `data/products.json`.

### Product Management System

- **Production API**: `https://rezaraluminium-production.up.railway.app/api/products`
- **Admin Dashboard**: Accessible at `/admin/dashboard` (requires login)
- **Database**: MongoDB (hosted on Railway)

### Steps to Add a Product:

1. **Access Admin Dashboard**: Log in at `/admin/login` (credentials: admin/admin123)
2. **Add Product**: Use the admin interface to upload product images and data
3. **Verify API**: Test product display using `test_product_display.html`
4. **Check Frontend**: Visit `products.html` to see the product appear

### API Endpoints

- `GET /api/products` - Get all products
- `GET /api/products/featured` - Get featured products only
- `POST /api/products/create` - Create new product (admin only)
- `PUT /api/products/update/:id` - Update product (admin only)
- `DELETE /api/products/delete/:id` - Delete product (admin only)

### Troubleshooting

If products don't appear:
1. Check browser console for API errors
2. Verify the production API is accessible
3. Ensure products are marked as active in admin
4. Use `test_product_display.html` for debugging

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