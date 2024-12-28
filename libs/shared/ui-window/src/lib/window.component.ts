import { Component, viewChild, OnDestroy, inject, Injector, AfterViewInit, TemplateRef, ViewContainerRef, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomPortalOutlet, TemplatePortal } from '@angular/cdk/portal';

@Component({
  selector: 'lib-window',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-template #templatePortal>
      <ng-content></ng-content>
    </ng-template>
  `,
})
export class WindowComponent implements AfterViewInit, OnDestroy {
  windowTitle = input('');

  private injector = inject(Injector);

  templateRef = viewChild.required<TemplateRef<unknown>>('templatePortal');
  private externalWindow: Window | null = null;
  private portalOutlet: DomPortalOutlet | null = null;

  private openWindow() {
    const externalWindow = window.open('', '', 'width=1920,height=1080,resizable=yes,scrollbars=yes,status=yes');
    if (!externalWindow) return;
    
    this.externalWindow = externalWindow;
    this.externalWindow.document.title = this.windowTitle();
    
    this.externalWindow.addEventListener('unload', () => {
      this.externalWindow = null;
      this.portalOutlet = null;
    });

    this.copyStyles();
    this.createPortal();
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

  private createPortal() {
    if (!this.externalWindow) return;

    this.portalOutlet = new DomPortalOutlet(
      this.externalWindow.document.body,
      this.injector
    );

    const portal = new TemplatePortal(this.templateRef(), this.injector.get(ViewContainerRef));
    this.portalOutlet.attach(portal);
  }

  public reopenWindow() {
    if (!this.externalWindow || this.externalWindow.closed) {
      this.openWindow();
    }
  }

  ngAfterViewInit() {
    this.openWindow();
  }

  ngOnDestroy() {
    if (this.portalOutlet) {
      this.portalOutlet.dispose();
    }
    if (this.externalWindow) {
      this.externalWindow.close();
    }
  }
}
