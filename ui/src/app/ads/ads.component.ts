import { Component, inject, signal } from '@angular/core';
import { AdsService, Content } from '../ads.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';



@Component({
  selector: 'app-ads',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './ads.component.html',
  styleUrl: './ads.component.css'
})
export class AdsComponent {
  ads = inject(AdsService).ads;

  constructor(private adsService: AdsService) {}

  ngOnInit(): void {
    this.adsService.loadAds();
  }

  deleteAd(id: number): void {
    this.adsService.deleteAd(id);
  }
}

