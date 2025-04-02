# Cardify - Interactive Card Template Editor

A powerful tool for creating printable card templates with drag-and-drop text boxes and real-time preview.

## Features

### Card Template Editor
- **Interactive Design**: Create card templates with customizable dimensions (width/height in inches)
- **Drag & Drop Text Boxes**: Add text boxes and drag them around the card preview
- **Real-time Preview**: See exactly how your cards will look when printed
- **Text Box Properties**: Configure font size, weight, alignment, and positioning
- **Column Mapping**: Each text box maps to a spreadsheet column name for data integration

### Text Box Management
- **Visual Editor**: Click and drag text boxes to position them precisely
- **Property Controls**: Adjust font size (8-72px), weight (normal/bold), and alignment (left/center/right)
- **Position Controls**: Fine-tune X, Y, width, and height using percentage values
- **Selection System**: Click on text boxes to select and edit their properties

### Import/Export
- **Template Export**: Save your card templates as JSON files
- **Template Import**: Load previously created templates
- **Portable Design**: Share templates between different projects

## Usage

### Creating a Card Template

1. **Set Card Dimensions**: Use the width and height controls to set your card size in inches
2. **Add Text Boxes**: Click "Add Text Box" to create new text elements
3. **Position Text Boxes**: 
   - Drag text boxes in the preview area to position them
   - Use the X, Y, width, and height controls for precise positioning
4. **Configure Text Properties**:
   - Set the column name (e.g., "title", "description", "cost")
   - Choose font size, weight, and alignment
5. **Preview**: Adjust the preview scale to see your design at different sizes

### Text Box Properties

Each text box has the following configurable properties:

- **Column Name**: The spreadsheet column that will populate this text box
- **Font Size**: Text size in pixels (8-72px)
- **Font Weight**: Normal or bold text
- **Text Alignment**: Left, center, or right alignment
- **Position**: X and Y coordinates as percentages of card size
- **Size**: Width and height as percentages of card size

### Exporting Templates

1. Click "Export Template" to download your template as a JSON file
2. The file contains all card dimensions and text box configurations
3. Share this file to use the same template in other projects

### Importing Templates

1. Click "Import Template" to select a previously exported JSON file
2. The template will load with all text boxes and properties intact
3. Continue editing or use as a starting point for new designs

## Technical Details

### Template Structure

```typescript
interface CardTemplate {
  width: number;        // Card width in inches
  height: number;       // Card height in inches
  textBoxes: TextBox[]; // Array of text box configurations
}

interface TextBox {
  id: string;           // Unique identifier
  x: number;           // X position as percentage
  y: number;           // Y position as percentage
  width: number;       // Width as percentage
  height: number;      // Height as percentage
  text: string;        // Column name from spreadsheet
  fontSize: number;    // Font size in pixels
  fontWeight: 'normal' | 'bold';
  textAlign: 'left' | 'center' | 'right';
}
```

### Responsive Design

The editor is fully responsive and works on:
- Desktop computers with full feature set
- Tablets with touch-friendly controls
- Mobile devices with optimized layout

### Accessibility

- Keyboard navigation support
- Screen reader compatibility
- High contrast visual indicators
- Focus management for all interactive elements

## Future Enhancements

- **Print Layout**: Generate optimized print layouts with multiple cards per page
- **Data Integration**: Direct spreadsheet import and preview with real data
- **Image Support**: Add image placeholders and background images
- **Advanced Typography**: More font options, line spacing, and text effects
- **Template Library**: Pre-built templates for common card types
- **Collaboration**: Share and collaborate on templates in real-time
