# Cardify Usage Guide

Cardify is a powerful tool for creating printable playing cards from spreadsheet data. This guide will walk you through the complete process from template creation to printing.

## Quick Start

1. **Open Cardify**: Navigate to the Cardify feature in your application
2. **Create Template**: Design your card layout in the Template Editor tab
3. **Import Data**: Upload your CSV file in the Data Import tab
4. **Preview**: Review your cards with real data in the Preview tab
5. **Print**: Generate optimized print layouts in the Print tab

## Step-by-Step Instructions

### 1. Template Editor

#### Setting Card Dimensions
- Use the width and height controls to set your card size in inches
- Standard playing card size is 2.5" × 3.5"
- Custom sizes are supported from 0.5" to 10" in both dimensions

#### Adding Text Boxes
1. Click "Add Text Box" to create a new text element
2. The text box will appear in the preview area
3. Click on the text box to select it and edit its properties

#### Configuring Text Box Properties
Each text box has the following configurable properties:

- **Column Name**: The spreadsheet column that will populate this text box
- **Font Size**: Text size in pixels (8-72px)
- **Font Weight**: Normal or bold text
- **Text Alignment**: Left, center, or right alignment
- **Position**: X and Y coordinates as percentages of card size
- **Size**: Width and height as percentages of card size

#### Positioning Text Boxes
- **Drag & Drop**: Click and drag text boxes in the preview area
- **Precise Control**: Use the X, Y, width, and height controls for exact positioning
- **Visual Feedback**: Selected text boxes are highlighted in blue

#### Preview Controls
- Use the scale slider to zoom in/out on your design
- Scale range: 0.25x to 2x
- Real-time preview updates as you make changes

### 2. Data Import

#### CSV File Format
Your CSV file should have:
- **Header Row**: Column names in the first row
- **Data Rows**: One row per card
- **Comma Separated**: Values separated by commas
- **Quotes**: Text values can be quoted to handle commas within text

#### Example CSV Structure
```csv
title,description,cost,type,rarity
Fireball,A powerful spell that deals 6 damage,3,Spell,Common
Lightning Bolt,Deal 3 damage to any target,1,Spell,Common
```

#### Importing Data
1. Click "Choose CSV File" in the Data Import tab
2. Select your CSV file
3. The system will automatically parse and load your data
4. You'll see confirmation of rows loaded and column names

### 3. Preview

#### Navigating Cards
- Use the left/right arrow buttons to navigate through your cards
- The current row number is displayed
- Each card shows the actual data from your spreadsheet

#### Column Mapping
- Text boxes display data from their assigned column
- If a column name doesn't match, the text box shows "No Data"
- Update column names in the Template Editor to fix mapping issues

### 4. Print

#### Print Information
The Print tab shows:
- **Cards per page**: Automatically calculated based on card size
- **Total pages**: Number of pages needed for all cards
- **Total cards**: Number of cards in your dataset

#### Print Layout
- Cards are automatically arranged to maximize page usage
- Standard 8.5" × 11" page with 0.5" margins
- Cards are positioned to avoid being cut off

#### Printing Process
1. Click "Print Cards" to generate the print preview
2. The browser's print dialog will open
3. Review the layout in the print preview
4. Adjust print settings as needed (paper size, margins, etc.)
5. Print your cards

## Advanced Features

### Template Management

#### Exporting Templates
1. Click "Export Template" to save your design
2. Template is saved as a JSON file
3. Contains all card dimensions and text box configurations

#### Importing Templates
1. Click "Import Template" to load a saved design
2. Select a previously exported JSON file
3. All text boxes and properties will be restored

### Responsive Design
- Works on desktop, tablet, and mobile devices
- Layout automatically adjusts for different screen sizes
- Touch-friendly controls on mobile devices

### Accessibility
- Keyboard navigation support
- Screen reader compatibility
- High contrast visual indicators
- Focus management for all interactive elements

## Tips and Best Practices

### Template Design
- **Start Simple**: Begin with basic text boxes and refine later
- **Use Percentages**: Position and size text boxes using percentages for consistency
- **Test with Data**: Always preview with real data before finalizing
- **Consider Print**: Remember that printed cards may look different than screen preview

### Data Preparation
- **Clean Data**: Remove extra spaces and special characters
- **Consistent Format**: Use consistent formatting across all rows
- **Test Import**: Verify your CSV file loads correctly before creating templates
- **Backup Data**: Keep a backup of your original spreadsheet

### Print Optimization
- **Card Size**: Smaller cards fit more per page
- **Margins**: Leave adequate space for cutting
- **Paper Quality**: Use card stock for professional results
- **Test Print**: Print a single page first to verify layout

## Troubleshooting

### Common Issues

#### Text Boxes Not Showing Data
- Check that column names match exactly (case-sensitive)
- Verify your CSV file has the expected column headers
- Ensure the CSV file loaded successfully

#### Print Layout Problems
- Check that card dimensions are appropriate for your paper size
- Verify print settings in your browser
- Try adjusting margins or paper size

#### Template Import Errors
- Ensure you're importing a valid JSON file
- Check that the file was exported from Cardify
- Verify the file isn't corrupted

#### Performance Issues
- Large datasets may load slowly
- Consider breaking very large files into smaller chunks
- Close other browser tabs to free up memory

### Getting Help
- Check the browser console for error messages
- Verify your CSV file format matches the expected structure
- Test with the provided sample data first
- Ensure all required browser features are enabled

## Sample Data

A sample CSV file is included with the feature (`sample-data.csv`) that you can use to test the functionality. It contains example card data in the format:

```csv
title,description,cost,type,rarity
Fireball,A powerful spell that deals 6 damage to target creature,3,Spell,Common
Lightning Bolt,Deal 3 damage to any target,1,Spell,Common
```

This sample data demonstrates:
- Multiple columns with different data types
- Text with commas (properly quoted)
- Various card properties
- Consistent formatting

Use this sample data to practice creating templates and understanding the workflow before using your own data. 