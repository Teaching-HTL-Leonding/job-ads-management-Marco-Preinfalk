import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';

export type Translation = {
  language: string;
  translatedText: string;
}

export type Content = {
  title: string;
  textEN: string;
  id: number;
  translations: Translation[];
}

@Injectable({
  providedIn: 'root',
})
export class AdsService {
  private baseUrl = 'http://localhost:3000/ads';

  ads = signal<Content[]>([]);
  ad = signal<Content | null>(null);

  constructor(private http: HttpClient) {}

  loadAds(): void {
    this.http.get<Content[]>(this.baseUrl).subscribe((data) => this.ads.set(data));
  }

  async loadAdById(id: number): Promise<void> {
    try {
      const ad = await firstValueFrom(
        this.http.get<Content>(`${this.baseUrl}/${id}`)
      );
      this.ad.set(ad);
    } catch (error) {
      console.error('Error loading ad by ID:', error);
      throw new Error('Failed to load ad from server.');
    }
  }

  deleteAd(id: number): void {
    this.http.delete(`${this.baseUrl}/${id}`).subscribe(() => {
      this.ads.update((currentAds) => currentAds.filter((ad) => ad.id !== id));
    });
  }

  public updateAd(job: Content): Promise<void> {
    return firstValueFrom(
      this.http.patch<void>(`${this.baseUrl}/${job.id}`, job)
    );
  }

  addTranslation(adId: number, language: string, text: string): void {
    this.http
      .put<Content>(`${this.baseUrl}/${adId}/translations/${language}`, { translatedText: text })
      .subscribe((updatedAd) => this.ad.set(updatedAd));
  }

  deleteTranslation(adId: number, language: string): void {
    this.http.delete<Content>(`${this.baseUrl}/${adId}/translations/${language}`).subscribe((updatedAd) => {
      this.ad.set(updatedAd);
    });
  }

  public async autoTranslate(jobId: number, lang: string) {
    const translate = {
      text: this.ad()!.textEN,
      source_lang: 'EN',
      target_lang: lang,
    };
    type TranslationResp = {
      translation: string;
    };
    const translated: TranslationResp = await firstValueFrom(
      this.http.post<TranslationResp>(
        `http://localhost:3000/deepl/v2/translate`,
        translate
      )
    );
    
    return firstValueFrom(
      this.http.put<void>(
        `${this.baseUrl}/${jobId}/translations/${lang}`,
        {
          translatedText: translated.translation,
        }
      )
    );
  }
}
