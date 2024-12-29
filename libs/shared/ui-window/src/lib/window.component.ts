import {
  AfterViewInit,
  Component,
  inject,
  Injector,
  input,
  OnDestroy,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomPortalOutlet, TemplatePortal } from '@angular/cdk/portal';

@Component({
  selector: 'lib-window',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (mirror()) {
      <ng-container *ngTemplateOutlet="template()"></ng-container>
    }
  `,
})
export class WindowComponent implements AfterViewInit, OnDestroy {
  init = input(true);
  mirror = input(false);
  popup = input(true);
  scale = input(2);
  windowTitle = input('');
  template = input.required<TemplateRef<unknown>>();
  
  
  private injector = inject(Injector);
  private vcr = inject(ViewContainerRef);

  private externalWindow: Window | null = null;
  private portalOutlet: DomPortalOutlet | null = null;

  private openWindow() {
    const windowFeatures = this.popup() 
      ? `width=${1920 * this.scale()},height=${1080 * this.scale()},resizable=yes,scrollbars=yes,status=yes`
      : '';
    
    const externalWindow = window.open('', '', windowFeatures);
    if (!externalWindow) return;
    
    this.externalWindow = externalWindow;
    this.externalWindow.document.title = this.windowTitle();
    
    this.externalWindow.document.body.classList.add('external');
    
    this.externalWindow.addEventListener('unload', () => {
      this.externalWindow = null;
      this.portalOutlet = null;
    });

    this.copyStyles();
    this.createPortal(this.externalWindow.document.body, this.template());
  }

  private copyStyles() {
    if (!this.externalWindow) return;

    const window: Window = this.externalWindow;

    Array.from(document.querySelectorAll('link[rel="stylesheet"]')).forEach((link) => {
      const linkElement = link as HTMLLinkElement;
      const newLink = window.document.createElement('link');
      newLink.rel = 'stylesheet';
      newLink.href = linkElement.href;
      window.document.head.appendChild(newLink);
    });

    Array.from(document.styleSheets).forEach((styleSheet) => {
      try {
        if (styleSheet.cssRules) {
          const newStyleEl = window.document.createElement('style');
          Array.from(styleSheet.cssRules).forEach((cssRule) => {
            newStyleEl.appendChild(window.document.createTextNode(cssRule.cssText));
          });
          window.document.head.appendChild(newStyleEl);
        }
      } catch (e) {
        const error = e as Error;
        if (error.name !== 'SecurityError') {
          console.warn('Error accessing stylesheet:', error);
        }
      }
    });
  }

  private createPortal(element: HTMLElement, template: TemplateRef<unknown>) {
    this.portalOutlet = new DomPortalOutlet(element, this.injector);
    const portal = new TemplatePortal(template, this.vcr);
    this.portalOutlet.attach(portal);
  }

  public reopenWindow() {
    if (!this.externalWindow || this.externalWindow.closed) this.openWindow();
  }

  ngAfterViewInit() {
    if (this.init()) this.openWindow();
  }

  ngOnDestroy() {
    if (this.portalOutlet) this.portalOutlet.dispose();
    if (this.externalWindow) this.externalWindow.close();
  }
}
