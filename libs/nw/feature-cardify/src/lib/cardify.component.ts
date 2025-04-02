import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
  computed,
  effect,
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
import { ToolbarService } from '@nathan-and-winnie/feature-toolbar';

export interface TextBox {
  id: string;
  x: number; // percentage from left
  y: number; // percentage from top
  width: number; // percentage of card width
  height: number; // percentage of card height
  text: string; // column name from spreadsheet
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  textAlign: 'left' | 'center' | 'right';
}

export interface CardTemplate {
  width: number; // inches
  height: number; // inches
  textBoxes: TextBox[];
}

@Component({
  selector: 'lib-cardify',
  standalone: true,
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
  ],
  templateUrl: './cardify.component.html',
  styleUrl: './cardify.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardifyComponent implements OnInit {
  toolbar = inject(ToolbarService);

  // Card template state
  template = signal<CardTemplate>({
    width: 2.5,
    height: 3.5,
    textBoxes: [],
  });

  // Form control properties
  width = 2.5;
  height = 3.5;
  previewScale = 2; // pixels per inch for preview

  // Methods to update template dimensions
  updateWidth(width: number) {
    this.width = width;
    this.template.update(template => ({ ...template, width }));
  }

  updateHeight(height: number) {
    this.height = height;
    this.template.update(template => ({ ...template, height }));
  }

  // Methods to update text box properties
  updateTextBoxText(textBoxId: string, text: string) {
    this.template.update(template => ({
      ...template,
      textBoxes: template.textBoxes.map(tb => 
        tb.id === textBoxId ? { ...tb, text } : tb
      ),
    }));
  }

  updateTextBoxFontSize(textBoxId: string, fontSize: number) {
    this.template.update(template => ({
      ...template,
      textBoxes: template.textBoxes.map(tb => 
        tb.id === textBoxId ? { ...tb, fontSize } : tb
      ),
    }));
  }

  updateTextBoxFontWeight(textBoxId: string, fontWeight: 'normal' | 'bold') {
    this.template.update(template => ({
      ...template,
      textBoxes: template.textBoxes.map(tb => 
        tb.id === textBoxId ? { ...tb, fontWeight } : tb
      ),
    }));
  }

  updateTextBoxTextAlign(textBoxId: string, textAlign: 'left' | 'center' | 'right') {
    this.template.update(template => ({
      ...template,
      textBoxes: template.textBoxes.map(tb => 
        tb.id === textBoxId ? { ...tb, textAlign } : tb
      ),
    }));
  }

  updateTextBoxPosition(textBoxId: string, x: number, y: number, width: number, height: number) {
    this.template.update(template => ({
      ...template,
      textBoxes: template.textBoxes.map(tb => 
        tb.id === textBoxId ? { ...tb, x, y, width, height } : tb
      ),
    }));
  }

  updateTextBoxX(textBoxId: string, x: number) {
    this.template.update(template => ({
      ...template,
      textBoxes: template.textBoxes.map(tb => 
        tb.id === textBoxId ? { ...tb, x } : tb
      ),
    }));
  }

  updateTextBoxY(textBoxId: string, y: number) {
    this.template.update(template => ({
      ...template,
      textBoxes: template.textBoxes.map(tb => 
        tb.id === textBoxId ? { ...tb, y } : tb
      ),
    }));
  }

  updateTextBoxWidth(textBoxId: string, width: number) {
    this.template.update(template => ({
      ...template,
      textBoxes: template.textBoxes.map(tb => 
        tb.id === textBoxId ? { ...tb, width } : tb
      ),
    }));
  }

  updateTextBoxHeight(textBoxId: string, height: number) {
    this.template.update(template => ({
      ...template,
      textBoxes: template.textBoxes.map(tb => 
        tb.id === textBoxId ? { ...tb, height } : tb
      ),
    }));
  }

  // UI state
  selectedTextBox = signal<TextBox | null>(null);
  isDragging = signal(false);
  dragStart = signal<{ x: number; y: number } | null>(null);

  // Computed values
  previewWidth = computed(() => this.template().width * this.previewScale);
  previewHeight = computed(() => this.template().height * this.previewScale);

  ngOnInit() {
    this.toolbar.patch(1, {
      icon: 'cards',
      label: 'Cardify',
      title: 'Cardify',
      route: '/cardify',
    });

    // Add some sample text boxes for demonstration
    this.addSampleTextBoxes();
  }

  private addSampleTextBoxes() {
    const sampleTextBoxes: TextBox[] = [
      {
        id: 'title',
        x: 10,
        y: 5,
        width: 80,
        height: 15,
        text: 'title',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
      },
      {
        id: 'description',
        x: 10,
        y: 25,
        width: 80,
        height: 40,
        text: 'description',
        fontSize: 12,
        fontWeight: 'normal',
        textAlign: 'left',
      },
      {
        id: 'cost',
        x: 75,
        y: 70,
        width: 20,
        height: 15,
        text: 'cost',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'right',
      },
    ];

    this.template.update(template => ({
      ...template,
      textBoxes: sampleTextBoxes,
    }));
  }

  // Text box management
  addTextBox() {
    const newTextBox: TextBox = {
      id: `textbox-${Date.now()}`,
      x: 10,
      y: 10,
      width: 80,
      height: 20,
      text: 'column_name',
      fontSize: 14,
      fontWeight: 'normal',
      textAlign: 'left',
    };

    this.template.update(template => ({
      ...template,
      textBoxes: [...template.textBoxes, newTextBox],
    }));

    this.selectedTextBox.set(newTextBox);
  }

  removeTextBox(textBox: TextBox) {
    this.template.update(template => ({
      ...template,
      textBoxes: template.textBoxes.filter(tb => tb.id !== textBox.id),
    }));

    if (this.selectedTextBox()?.id === textBox.id) {
      this.selectedTextBox.set(null);
    }
  }

  updateTextBox(updatedTextBox: TextBox) {
    this.template.update(template => ({
      ...template,
      textBoxes: template.textBoxes.map(tb => 
        tb.id === updatedTextBox.id ? updatedTextBox : tb
      ),
    }));

    if (this.selectedTextBox()?.id === updatedTextBox.id) {
      this.selectedTextBox.set(updatedTextBox);
    }
  }

  // Drag and drop functionality
  onMouseDown(event: MouseEvent, textBox: TextBox) {
    event.preventDefault();
    event.stopPropagation();
    
    this.selectedTextBox.set(textBox);
    this.isDragging.set(true);
    
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    this.dragStart.set({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isDragging() || !this.dragStart() || !this.selectedTextBox()) {
      return;
    }

    const previewElement = event.currentTarget as HTMLElement;
    const rect = previewElement.getBoundingClientRect();
    
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    // Clamp values to keep text box within card bounds
    const clampedX = Math.max(0, Math.min(100 - this.selectedTextBox()!.width, x));
    const clampedY = Math.max(0, Math.min(100 - this.selectedTextBox()!.height, y));
    
    this.updateTextBox({
      ...this.selectedTextBox()!,
      x: clampedX,
      y: clampedY,
    });
  }

  onMouseUp() {
    this.isDragging.set(false);
    this.dragStart.set(null);
  }

  // Utility methods
  getTextBoxStyle(textBox: TextBox) {
    return {
      left: `${textBox.x}%`,
      top: `${textBox.y}%`,
      width: `${textBox.width}%`,
      height: `${textBox.height}%`,
      fontSize: `${textBox.fontSize}px`,
      fontWeight: textBox.fontWeight,
      textAlign: textBox.textAlign,
    };
  }

  isSelected(textBox: TextBox): boolean {
    return this.selectedTextBox()?.id === textBox.id;
  }

  // Export functionality (placeholder for now)
  exportTemplate() {
    const templateData = this.template();
    const blob = new Blob([JSON.stringify(templateData, null, 2)], {
      type: 'application/json',
    });
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
        const templateData = JSON.parse(e.target?.result as string);
        this.template.set(templateData);
      } catch (error) {
        console.error('Error importing template:', error);
      }
    };
    reader.readAsText(file);
  }
}
