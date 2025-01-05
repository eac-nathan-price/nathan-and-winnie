import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { utils, writeFile } from 'xlsx';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { PdfViewerModule } from 'ng2-pdf-viewer';
//GlobalWorkerOptions.workerSrc = 'pdf.worker.js';
GlobalWorkerOptions.workerSrc = './node_modules/pdfjs-dist/legacy/build/pdf.worker.js';

class Highlight {
  public text = '';

  constructor(
    public page: string,
    public nodes: HTMLElement[],
    public note = ''
  ) {
    for (const node of nodes) this.text += node.innerText;
  }

  public toggleClass(name: string) {
    for (const node of this.nodes) node.classList.toggle(name);
    if (this.nodes.length > 0) this.nodes[0].scrollIntoView();
  }
}


@Component({
  selector: 'lib-pdfeedback',
  imports: [CommonModule, FormsModule, PdfViewerModule],
  templateUrl: './pdfeedback.component.html',
  styleUrl: './pdfeedback.component.scss',
})
export class PdfeedbackComponent implements AfterViewInit {
  @ViewChild('dropzone') dropzone!: ElementRef;

  src = '';
  highlights: Highlight[] = [];
  lastTarget: EventTarget | null = null;

  ngAfterViewInit() {
    const zone = this.dropzone.nativeElement as HTMLElement;

    window.addEventListener('dragenter', ((e: DragEvent) => {
      e.preventDefault();
      this.lastTarget = e.target;
      zone.style.visibility = '';
      zone.style.opacity = '1';
    }).bind(this));

    window.addEventListener('dragleave', ((e: DragEvent) => {
      e.preventDefault();
      if (e.target === this.lastTarget || e.target === document) {
        zone.style.visibility = 'hidden';
        zone.style.opacity = '0';
      }
    }).bind(this));

    window.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    window.addEventListener('drop', ((e: DragEvent) => {
      e.preventDefault();
      zone.style.visibility = 'hidden';
      zone.style.opacity = '0';
      this.readFile(e.dataTransfer?.files[0]);
    }).bind(this));
  }

  readFile(file?: File) {
    if (!file || typeof FileReader === 'undefined') return;
    const reader = new FileReader();
    reader.onload = ((e: ProgressEvent<FileReader>) => {
      this.src = e.target?.result as string;
    }).bind(this);
    reader.readAsArrayBuffer(file);
  }

  onFileSelected() {
    const file = document.querySelector('#file') as HTMLInputElement;
    this.readFile(file?.files?.[0]);
  }

  onHighlight() {
    const selection = document.getSelection();
    if (!selection) return;
    let cur = selection.anchorNode?.parentElement;
    const end = selection.focusNode?.parentElement;
    const page = cur?.closest('[data-page-number]')?.getAttribute('data-page-number');
    if (!cur ||!page) return;
    const nodes = [cur];
    while (cur != end) {
      cur = cur?.nextElementSibling as HTMLElement;
      nodes.push(cur);
    }
    this.highlights.push(new Highlight(page, nodes));
  }

  onDownload() {
    const data = this.highlights.map((x) => {
      return { page: x.page, text: x.text, note: x.note };
    });
    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'My Worksheet');
    writeFile(wb, 'test.xlsx');
  }

  onExtract() {
    getDocument(this.src).promise.then((pdf) => {
      for (let i = 0; i < pdf.numPages; i++)
        pdf.getPage(i + 1).then((page) => {
          page.getAnnotations().then((anots) => {
            anots.forEach((anot) => {
              if (anot.richText) console.log(i, anot.richText.str, anot);
            });
          });
        });
    });
  }
}
