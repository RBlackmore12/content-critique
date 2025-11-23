# Design Guidelines: AI Content Feedback Chatbot

## Design Approach
**System-Based: Material Design Principles**
This utility-focused application prioritizes clarity, efficiency, and readability. Material Design's emphasis on structured layouts and clear visual hierarchy aligns perfectly with the tool's purpose of providing focused content analysis.

## Typography System
- **Heading**: Font size text-3xl (30px), font-semibold
- **Input Labels**: text-sm (14px), font-medium
- **Body Text/Feedback**: text-base (16px), line-height-relaxed for optimal readability
- **Font Stack**: System fonts (ui-sans-serif) for fast loading and native feel

## Layout Structure
**Spacing Primitives**: Use tailwind units of 4, 6, and 8 consistently
- Container: max-w-3xl (optimal for reading and text input)
- Vertical rhythm: py-8 for main sections, gap-6 between elements
- Horizontal padding: px-6 for mobile, px-8 for desktop

## Component Specifications

### Main Container
- Centered layout with max-w-3xl
- Vertical padding: py-12 on desktop, py-8 on mobile
- Background: Subtle surface elevation with soft shadow

### Header Section
- Prominent heading with supporting subtext
- Include brief instruction text below heading ("Paste your messaging content below to receive AI-powered feedback based on the CONNECT Method")
- Spacing: mb-8 below header group

### Text Input Area
- Large textarea: min-height of h-64 (256px)
- Rounded corners: rounded-lg
- Border: 2px solid with focus state enhancement
- Padding: p-4 internal spacing
- Placeholder text: Helpful example like "Paste your email, social post, or marketing copy here..."
- Character count indicator in bottom-right corner of textarea

### Submit Button
- Full-width on mobile, auto-width (px-12) on desktop, centered
- Height: h-12 for comfortable tap target
- Rounded: rounded-lg
- Prominent placement with mt-6 spacing
- Text: "Get AI Feedback" or similar action-oriented label
- Loading state: Show spinner and "Analyzing..." text during API call

### Response Display Area
- Appears below submit button after feedback is generated
- Card-style container with rounded-lg and subtle shadow
- Padding: p-6
- Background differentiation from main container
- Section heading: "Feedback" in text-xl, font-semibold
- Feedback text: Formatted with proper paragraph spacing (space-y-4)
- Support for markdown rendering (bullet points, bold text, paragraphs)
- Empty state: Hidden until feedback is received

## Interaction States
- **Input Focus**: Enhanced border treatment, subtle shadow
- **Button States**: Clear hover, active, and disabled states
- **Loading**: Disable form during API processing, show visual feedback
- **Error Handling**: Display error messages in red text below submit button

## Accessibility
- Proper label associations for textarea
- Focus indicators on all interactive elements
- ARIA labels for loading and error states
- Keyboard navigation support

## Layout Behavior
- Single column, centered layout throughout
- No multi-column layouts needed for this focused interface
- Natural content flow: Header → Input → Button → Response
- Responsive stacking with consistent padding adjustments

This design creates a focused, distraction-free environment optimized for the content analysis workflow. The generous text area and clear feedback display ensure users can effectively review and iterate on their messaging.