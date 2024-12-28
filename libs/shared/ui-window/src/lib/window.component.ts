import { Component, viewChild, OnDestroy, inject, Injector, AfterViewInit, Signal, TemplateRef, ViewContainerRef } from '@angular/core';
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
  private injector = inject(Injector);

  templateRef = viewChild.required<TemplateRef<unknown>>('templatePortal');
  private externalWindow: Window | null = null;
  private portalOutlet: DomPortalOutlet | null = null;

  ngAfterViewInit() {
    this.externalWindow = window.open('', '', 'width=600,height=400,left=200,top=200');
    if (!this.externalWindow) return;

    this.portalOutlet = new DomPortalOutlet(
      this.externalWindow.document.body,
      this.injector
    );

    const portal = new TemplatePortal(this.templateRef(), this.injector.get(ViewContainerRef));
    this.portalOutlet.attach(portal);
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
