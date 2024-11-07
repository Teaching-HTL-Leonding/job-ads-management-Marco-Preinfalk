import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdsService, Content, Translation } from '../ads.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-job-ads-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './job-ads-details.component.html',
  styleUrls: ['./job-ads-details.component.css'],
})
export class JobAdsDetailsComponent {
  private service = inject(AdsService);

  adId = signal<number>(-1);
  title = signal<string>('');
  textEN = signal<string>('');
  translations = signal<Translation[]>([]);

  translatedText = signal<string>('');
  lang = signal<string>('');
  availableLanguages = signal<string[]>(['de', 'fr', 'es', 'it']);

  constructor(private route: ActivatedRoute, private router: Router) {}

  async ngOnInit() {
    const id: string | null = this.route.snapshot.paramMap.get('id');
    if (id) {
      await this.setJobProperties(parseInt(id));
    }
  }

  async setJobProperties(id: number) {
    try {
      await this.service.loadAdById(id);
      const ad = this.service.ad();
      if (!ad) {
        throw new Error('Failed to load job data.');
      }
      this.adId.set(ad.id);
      this.title.set(ad.title);
      this.textEN.set(ad.textEN);
      this.translations.set(ad.translations);
    } catch (error) {
      console.error('Error loading job details:', error);
      alert('Failed to load job details. Please try again.');
    }
  }

  async addTranslation() {
    if (!this.lang() || !this.translatedText()) {
      alert('Please provide both language and translation text.');
      return;
    }

    try {
      await this.service.addTranslation(
        this.adId(),
        this.lang(),
        this.translatedText()
      );
      await this.setJobProperties(this.adId());
      this.translatedText.set('');
      this.lang.set('');
    } catch (error) {
      console.error('Error adding translation:', error);
      alert('Failed to add translation. Please try again.');
    }
  }

  async autoTranslate() {
    if (!this.lang()) {
      alert('Please select a language for auto-translation.');
      return;
    }

    try {
      await this.service.autoTranslate(this.adId(), this.lang());
      await this.setJobProperties(this.adId());
    } catch (error) {
      console.error('Error in auto-translate:', error);
      alert('Auto-translation failed. Please try again.');
    }
  }

  async deleteTranslation(lang: string) {
    try {
      await this.service.deleteTranslation(this.adId(), lang);
      await this.setJobProperties(this.adId());
    } catch (error) {
      console.error('Error deleting translation:', error);
      alert('Failed to delete translation. Please try again.');
    }
  }

  updateJob() {
    const job: Content = {
      id: this.adId(),
      title: this.title(),
      textEN: this.textEN(),
      translations: this.translations(),
    };

    try {
      this.service.updateAd(job);
      alert('Job details updated successfully.');
    } catch (error) {
      console.error('Error updating job:', error);
      alert('Failed to update job details. Please try again.');
    }
  }

  returnToAllJobs() {
    this.router.navigate(['/ads']);
  }
}
