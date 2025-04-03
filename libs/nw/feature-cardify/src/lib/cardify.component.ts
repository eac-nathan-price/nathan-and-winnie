import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
  computed,
  effect,
  viewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatSliderModule } from '@angular/material/slider';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ToolbarService } from '@nathan-and-winnie/feature-toolbar';

export interface TextBox {
  id: string;
  x: number; // percentage
  y: number; // percentage
  width: number; // percentage
  height: number; // percentage
  columnName: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  textAlign: 'left' | 'center' | 'right';
}

export interface CardTemplate {
  width: number; // inches
  height: number; // inches
  textBoxes: TextBox[];
}

export interface SpreadsheetRow {
  [key: string]: string;
}

@Component({
  selector: 'lib-cardify',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatSliderModule,
    MatDividerModule,
    MatChipsModule,
    MatSelectModule,
    MatOptionModule,
    MatTabGroup,
    MatTab,
    MatCheckboxModule,
  ],
  templateUrl: './cardify.component.html',
  styleUrl: './cardify.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardifyComponent implements OnInit {
  toolbar = inject(ToolbarService);
  previewContainer = viewChild<ElementRef>('previewContainer');

  // Template state
  template = signal<CardTemplate>({
    width: 2.5,
    height: 3.5,
    textBoxes: []
  });

  // UI state
  selectedTextBoxId = signal<string | null>(null);
  previewScale = signal(1);
  showPrintPreview = signal(false);
  currentRowIndex = signal(0);

  // Data state
  spreadsheetData = signal<SpreadsheetRow[]>([]);
  columnNames = signal<string[]>([]);

  // Computed values
  selectedTextBox = computed(() => {
    const id = this.selectedTextBoxId();
    if (!id) return null;
    return this.template().textBoxes.find(tb => tb.id === id) || null;
  });

  currentRow = computed(() => {
    const data = this.spreadsheetData();
    const index = this.currentRowIndex();
    return data[index] || {};
  });

  cardsPerPage = computed(() => {
    const template = this.template();
    const pageWidth = 8.5; // inches
    const pageHeight = 11; // inches
    const margin = 0.5; // inches
    
    const availableWidth = pageWidth - (2 * margin);
    const availableHeight = pageHeight - (2 * margin);
    
    const cardsPerRow = Math.floor(availableWidth / template.width);
    const cardsPerCol = Math.floor(availableHeight / template.height);
    
    return cardsPerRow * cardsPerCol;
  });

  totalPages = computed(() => {
    const dataLength = this.spreadsheetData().length;
    const cardsPerPage = this.cardsPerPage();
    return Math.ceil(dataLength / cardsPerPage);
  });

  ngOnInit() {
    this.toolbar.patch(1, {
      icon: 'cards',
      label: 'Cardify',
      title: 'Cardify',
      route: '/cardify',
    });
  }

  // Template management
  addTextBox() {
    const newTextBox: TextBox = {
      id: `textbox-${Date.now()}`,
      x: 10,
      y: 10,
      width: 80,
      height: 20,
      columnName: '',
      fontSize: 16,
      fontWeight: 'normal',
      textAlign: 'left'
    };

    this.template.update(template => ({
      ...template,
      textBoxes: [...template.textBoxes, newTextBox]
    }));

    this.selectedTextBoxId.set(newTextBox.id);
  }

  removeTextBox(id: string) {
    this.template.update(template => ({
      ...template,
      textBoxes: template.textBoxes.filter(tb => tb.id !== id)
    }));

    if (this.selectedTextBoxId() === id) {
      this.selectedTextBoxId.set(null);
    }
  }

  updateTextBox(id: string, updates: Partial<TextBox>) {
    this.template.update(template => ({
      ...template,
      textBoxes: template.textBoxes.map(tb => 
        tb.id === id ? { ...tb, ...updates } : tb
      )
    }));
  }

  // File handling
  onFileUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      this.parseCSV(csv);
    };
    reader.readAsText(file);
  }

  parseCSV(csv: string) {
    const lines = csv.split('\n');
    if (lines.length < 2) return;

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    this.columnNames.set(headers);

    const data: SpreadsheetRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const row: SpreadsheetRow = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }

    this.spreadsheetData.set(data);
    this.currentRowIndex.set(0);
  }

  // Preview navigation
  nextRow() {
    const dataLength = this.spreadsheetData().length;
    if (dataLength === 0) return;
    
    this.currentRowIndex.update(index => 
      index < dataLength - 1 ? index + 1 : 0
    );
  }

  previousRow() {
    const dataLength = this.spreadsheetData().length;
    if (dataLength === 0) return;
    
    this.currentRowIndex.update(index => 
      index > 0 ? index - 1 : dataLength - 1
    );
  }

  // Print functionality
  printCards() {
    this.showPrintPreview.set(true);
    setTimeout(() => {
      window.print();
      this.showPrintPreview.set(false);
    }, 100);
  }

  // Template import/export
  exportTemplate() {
    const template = this.template();
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'card-template.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  importTemplate(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const template = JSON.parse(e.target?.result as string) as CardTemplate;
        this.template.set(template);
      } catch (error) {
        console.error('Failed to parse template file:', error);
      }
    };
    reader.readAsText(file);
  }

  // Drag and drop functionality
  onTextBoxDragStart(event: DragEvent, textBox: TextBox) {
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', textBox.id);
    }
  }

  onPreviewDrop(event: DragEvent) {
    event.preventDefault();
    const textBoxId = event.dataTransfer?.getData('text/plain');
    if (!textBoxId) return;

    const container = this.previewContainer()?.nativeElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    this.updateTextBox(textBoxId, { x, y });
  }

  onPreviewDragOver(event: DragEvent) {
    event.preventDefault();
  }

  // Helper method for print preview
  getCardsForPage(pageIndex: number): number[] {
    const cardsPerPage = this.cardsPerPage();
    const startIndex = pageIndex * cardsPerPage;
    const endIndex = Math.min(startIndex + cardsPerPage, this.spreadsheetData().length);
    return Array.from({ length: endIndex - startIndex }, (_, i) => startIndex + i);
  }

  // Helper method for template
  protected readonly Array = Array;

  // Helper method for print preview
  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i);
  }
}
