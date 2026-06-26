# Frontend Refactor Plan

## 1. Current State Analysis
The frontend is built with Next.js, Tailwind CSS, and uses a combination of server and client components. The styling is currently a mix of utility classes and some custom theme variables (using OKLCH color space).

### UX/Behavior to Preserve
- **Navigation**: Persistent navbar with links to Blog, About, Contact, and User Profile/Auth.
- **Home Page**: Hero section with a gradient background, followed by a grid of latest posts.
- **Post Card**: Displays thumbnail, title, date, content snippet, and a "Read more" link.
- **Post Detail Page**: Displays full post content (sanitized), author info, image, and an interaction section (Like and Comments).
- **Authentication**: Sign-in and Sign-up flows with form validation and Google OAuth integration.
- **Post Management**: 
    - User post listing.
    - Create post form (title, content, thumbnail upload).
    - Update post functionality.
    - Delete post functionality.
- **Interactions**:
    - Like/Unlike posts.
    - Add/Paginate comments on posts.
- **Responsiveness**: Basic responsive layouts (grid-cols-1 to md:grid-cols-3, flex-col to md:flex-row).

## 2. Refactor Goals (CSS & Styling Focus)
The goal is to modernize the look and feel without changing any underlying logic or UX behavior.

### A. Consistency & Design System
- **Color Palette**: Standardize the use of `slate`, `indigo`, and `sky` colors. Currently, there's a mix of `gray-600`, `slate-700`, `indigo-600`, etc.
- **Spacing**: Implement a consistent spacing scale (padding/margin) across all containers to avoid "magic numbers" (e.g., `m-8`, `mt-5`, `mb-9` in `posts.tsx`).
- **Typography**: Refine font sizes and weights for better visual hierarchy (H1, H2, H3).
- **Shadows & Borders**: Standardize `shadow-md` and `rounded-lg` usage across cards and panels.

### B. Component-Specific Refinements
- **Hero Section**: 
    - Improve the SVG wave transition.
    - Enhance the gradient transition to feel more modern.
- **Post Cards**: 
    - Improve the image aspect ratio and fitting (e.g., `aspect-video` instead of fixed `h-60`).
    - Better hover effects on cards (e.g., slight lift/scale).
- **Navbar**: 
    - Refine the hover states of navigation links.
    - Improve the layout of the User Profile section.
- **Forms (Auth & Create Post)**: 
    - Standardize the "Card" look for all forms (center alignment, consistent padding, and border-radius).
    - Improve input field focus states.

### C. Layout & Responsiveness
- **Containerization**: Ensure all pages use a consistent `container` wrapper with centered alignment and consistent horizontal padding.
- **Spacing**: Add consistent vertical spacing between sections (e.g., using a gap system in layouts).

## 3. Implementation Strategy
1. **Theme Audit**: Review `globals.css` and ensure the OKLCH variables are used consistently across the application.
2. **Utility Cleanup**: Replace hardcoded colors with theme-based colors (e.g., replace `text-gray-600` with `text-muted-foreground` where applicable).
3. **Component Polish**: Iterate through `components/ui` and `components/` to apply the refined design system.
4. **Layout Alignment**: Ensure `app/layout.tsx` and page-level containers are perfectly aligned.

## 4. Constraints
- **NO logic changes**: Do not modify any `actions`, `lib` functions, or data fetching logic.
- **NO UX changes**: Do not remove or add new features; only change how they look.
- **Maintain Accessibility**: Keep existing ARIA labels and semantic HTML.
