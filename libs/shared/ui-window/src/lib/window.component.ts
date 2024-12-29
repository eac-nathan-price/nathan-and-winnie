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

export type WindowType = boolean | 'pop' | 'tab' | undefined;

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
  init = input(undefined as WindowType);
  mirror = input(false);
  scale = input(2);
  windowTitle = input('');
  template = input.required<TemplateRef<unknown>>();
  
  
  private injector = inject(Injector);
  private vcr = inject(ViewContainerRef);

  private externalWindow: Window | null = null;
  private portalOutlet: DomPortalOutlet | null = null;

  public open(windowType?: WindowType) {
    if (this.externalWindow && !this.externalWindow.closed) return;

    const windowFeatures = windowType == 'pop' 
      ? `width=${1920 * this.scale()},height=${1080 * this.scale()},resizable=yes,scrollbars=yes,status=yes`
      : '';
    
    const externalWindow = window.open('', '', windowFeatures);
    if (!externalWindow) return;

    this.externalWindow = externalWindow;
    externalWindow.document.title = this.windowTitle();
    externalWindow.document.body.classList.add('external');
    externalWindow.addEventListener('unload', () => {
      this.externalWindow = null;
      this.portalOutlet = null;
    });

    // copy styles
    Array.from(document.querySelectorAll('link[rel="stylesheet"]')).forEach((link) => {
      const linkElement = link as HTMLLinkElement;
      const newLink = externalWindow.document.createElement('link');
      newLink.rel = 'stylesheet';
      newLink.href = linkElement.href;
      externalWindow.document.head.appendChild(newLink);
    });

    Array.from(document.styleSheets).forEach((styleSheet) => {
      try {
        if (styleSheet.cssRules) {
          const newStyleEl = externalWindow.document.createElement('style');
          Array.from(styleSheet.cssRules).forEach((cssRule) => {
            newStyleEl.appendChild(externalWindow.document.createTextNode(cssRule.cssText));
          });
          externalWindow.document.head.appendChild(newStyleEl);
        }
      } catch (e) {
        const error = e as Error;
        if (error.name !== 'SecurityError') {
          console.warn('Error accessing stylesheet:', error);
        }
      }
    });

    // create portal
    this.portalOutlet = new DomPortalOutlet(externalWindow.document.body, this.injector);
    const portal = new TemplatePortal(this.template(), this.vcr);
    this.portalOutlet.attach(portal);
  }

  ngAfterViewInit() {
    if (this.init() !== undefined) this.open(this.init());
  }

  ngOnDestroy() {
    if (this.portalOutlet) this.portalOutlet.dispose();
    if (this.externalWindow) this.externalWindow.close();
  }
}
