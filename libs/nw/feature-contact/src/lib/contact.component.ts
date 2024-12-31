import { Component, computed, effect, inject, OnDestroy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import * as QRCode from 'qrcode-svg';
import { ToolbarService } from '@nathan-and-winnie/feature-toolbar';


type ContactInfo = {
  company: string;
  firstName: string;
  lastName: string;
  position: string;
  email: string;
  phone: string;
}

@Component({
  selector: 'lib-contact',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent implements OnDestroy {
  route = inject(ActivatedRoute);
  router = inject(Router);
  toolbar = inject(ToolbarService);

  company = '';
  firstName = '';
  lastName = '';
  position = '';
  email = '';
  phone = '';

  params = toSignal(this.route.queryParams);

  data = computed(() => {
    const data = this.params()?.['data'];
    if (!data) return null;
    return JSON.parse(atob(data)) as ContactInfo;
  });

  vcard = computed(() => {
    const data = this.data();
    if (!data) return null;
    return `BEGIN:VCARD
VERSION:3.0
N;CHARSET=UTF-8:${data.lastName};${data.firstName};;;
FN;CHARSET=UTF-8:${data.firstName} ${data.lastName}
ORG;CHARSET=UTF-8:${data.company}
TITLE;CHARSET=UTF-8:${data.position}
TEL;TYPE=work,voice;CHARSET=UTF-8:${data.phone}
EMAIL;CHARSET=UTF-8;type=WORK,INTERNET:${data.email}
END:VCARD`;
  });

  qr = computed(() => {
    const vcard = this.vcard();
    if (!vcard) return null;
    return new QRCode(vcard);
  });

  grid = computed(() => {
    const qr = this.qr();
    if (!qr) return null;
    const modules = qr.qrcode.modules;
    const length = modules.length;
    const grid = [];
    for (let y = 0; y < length; y++) {
      const row = [];
      for (let x = 0; x < length; x++) {
        row.push(modules[x][y]);
      }
      grid.push(row);
    }
    return grid;
  });

  generate() {
    const data = {
      company: this.company,
      firstName: this.firstName,
      lastName: this.lastName,
      position: this.position,
      email: this.email,
      phone: this.phone,
    };
    const encoded = btoa(JSON.stringify(data));
    this.router.navigate(['/contact'], { queryParams: { data: encoded } });
  }

  constructor() {
    effect(() => {
      this.toolbar.enabled = !this.data();
    });
  }

  ngOnDestroy() {
    this.toolbar.enabled = true;
  }
}
