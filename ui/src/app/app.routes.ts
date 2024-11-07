import { Routes } from '@angular/router';
import { AdsComponent } from './ads/ads.component';
import { JobAdsDetailsComponent } from './job-ads-details/job-ads-details.component';

export const routes: Routes = [
  { path: 'ads', component: AdsComponent },
  { path: 'ads/:id', component: JobAdsDetailsComponent },
  { path: '', redirectTo: '/ads', pathMatch: 'full' },
];
