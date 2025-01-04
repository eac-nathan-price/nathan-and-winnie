import { Component, computed, effect, inject, OnDestroy, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import QRCode from 'qrcode';
import { ToolbarService } from '@nathan-and-winnie/feature-toolbar';


type ContactInfo = {
  company: string;
  firstName: string;
  lastName: string;
  position: string;
  email: string;
  phone: string;
  logo: string;
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
export class ContactComponent implements OnInit, OnDestroy {
  route = inject(ActivatedRoute);
  router = inject(Router);
  toolbar = inject(ToolbarService);

  company = '';
  firstName = '';
  lastName = '';
  position = '';
  email = '';
  phone = '';
  logo = '';

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
    return QRCode.create(vcard);
  });

  grid = computed(() => {
    const qr = this.qr();
    if (!qr) return null;
    const modules = qr.modules;
    const size = modules.size;
    const grid = [];
    for (let y = 0; y < size; y++) {
      const row = [];
      for (let x = 0; x < size; x++) {
        row.push(modules.get(x, y));
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
      logo: this.logo
    };
    const encoded = btoa(JSON.stringify(data));
    this.router.navigate(['/vcard'], { queryParams: { data: encoded } });
  }

  constructor() {
    effect(() => {
      this.toolbar.enabled = !this.data();
    });
  }

  ngOnInit() {
    this.toolbar.patch(1, {
      icon: 'person',
      label: 'VCard',
      title: 'VCard',
      route: '/vcard',
    });
  }

  ngOnDestroy() {
    this.toolbar.enabled = true;
  }
}
