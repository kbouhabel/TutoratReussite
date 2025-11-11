# TutoratRéussite - Design Guidelines

## Design Approach
**Reference-Based Approach**: Drawing inspiration from modern educational platforms like Khan Academy and Duolingo, combined with booking platforms like Calendly. Focus on clarity, warmth, and trust-building for parents and students.

## Core Visual Identity

### Color Palette
- **Primary**: Soft blue (#4A90E2 or similar light blue tones)
- **Secondary**: Warm orange accents for CTAs and highlights
- **Background**: Clean white (#FFFFFF)
- **Success/Savings**: Green for discount badges and promotional text
- **Text**: Dark gray for body, darker blue for headings

### Typography
- **Primary Font**: Inter or Poppins (Google Fonts)
- **Headings**: Bold weights (600-700), larger sizes for impact
- **Body**: Regular weight (400), comfortable reading size
- **Hierarchy**: Clear distinction between page titles, section headings, and body text

### Layout System
- **Spacing**: Use Tailwind units of 4, 6, 8, 12, 16 for consistent rhythm (p-4, m-8, gap-6, etc.)
- **Container**: max-w-7xl for main content, max-w-4xl for forms
- **Grid**: 2-column layouts for pricing tables on desktop, single column on mobile

## Page-Specific Designs

### 1. Homepage
**Hero Section**: 
- Full-width section with warm, professional background (soft blue gradient or subtle pattern)
- Centered content with compelling French tagline emphasizing success and support
- Large, prominent "Réserver un cours" button (orange, rounded)
- Supporting text highlighting key benefits (qualified teachers, flexible scheduling, proven results)

**Service Presentation**:
- 3-column grid showcasing core benefits with icons (Heroicons)
- Cards with subtle shadows, rounded corners
- Icons for: personalized learning, flexible schedules, affordable pricing

**Social Proof Section**:
- Parent testimonials in card format
- Trust indicators: years of experience, number of students helped

### 2. Booking Page (Réservation)
**Form Layout**:
- Clean, stepped form design with clear sections
- White card container with generous padding (p-8)
- Organized sections: Personal Info → Academic Level → Session Details → Location → Price Summary

**Dynamic Pricing Display**:
- Live price calculation shown in prominent box
- Clear breakdown: "Prix de base: X$ | Durée: X$ | Total: X$"
- Green checkmark when selection complete

**Calendar Integration**:
- Interactive calendar component showing available slots
- Booked slots automatically hidden
- Clear visual distinction for selected time

**Form Fields**:
- Floating labels or clear top labels
- Full-width inputs with subtle borders
- Conditional address fields (show only when "à domicile" selected)
- Dropdown menus for grade level and duration with clear options

### 3. Packages Page (Forfaits)
**Pricing Tables**:
- 2x2 grid for Primary/Secondary and Teacher's Place/At Home
- Each table shows 1 session/week and 2 sessions/week options
- Strikethrough original prices with prominent discounted price
- Bright badges: "Économie de X$" in green with subtle background

**Promotional Banners**:
- Highlighted boxes for special offers:
  - "-15% pour deux enfants" in orange banner
  - "30$ de rabais - Forfait trimestriel" in blue banner

**Call-to-Action**: 
- "Choisir ce forfait" buttons linking to booking page with pre-filled options

### 4. Contact Page
**Layout**:
- 2-column on desktop: Contact info left, map/additional info right
- Single column on mobile
- Clear hierarchy: Address, Phone, Email with icons
- Optional contact form for general inquiries

## Component Library

### Buttons
- **Primary CTA**: Orange background, white text, rounded-lg, py-3 px-6, medium shadow
- **Secondary**: Blue outline, blue text, same sizing
- **Hover states**: Slight darkening, subtle scale transform

### Cards
- White background, rounded-lg, subtle shadow (shadow-md)
- Padding: p-6 to p-8 depending on content
- Hover: slight shadow increase for interactive cards

### Form Elements
- Inputs: border-gray-300, rounded-md, focus:ring-blue, py-2 px-4
- Dropdowns: Custom styling matching input aesthetic
- Radio/Checkbox: Larger hit areas, blue accent color

### Badges
- Pill-shaped, small padding (px-3 py-1)
- Green for savings, orange for featured items
- Text: font-medium, text-sm

### Pricing Display
- Large, bold numbers for prices
- Strikethrough: text-gray-400, line-through
- New price: text-2xl or text-3xl, font-bold, color blue or orange

## Images
**Hero Section**: Use a warm, professional image showing tutoring in action - student and teacher working together, bright natural lighting, Quebec/Canadian context. Image should convey trust, success, and personalized attention.

**No other images required** - focus on clean UI, icons, and typography for remaining sections.

## Responsive Behavior
- Mobile: All multi-column layouts stack to single column
- Pricing tables: Horizontal scroll on mobile OR stack vertically
- Form: Full-width on mobile with maintained spacing
- Navigation: Hamburger menu on mobile, horizontal on desktop

## Navigation
- Sticky header with logo "TutoratRéussite" on left
- Links: Accueil | Réservation | Forfaits | Contact
- Mobile: Collapsible menu with smooth transition