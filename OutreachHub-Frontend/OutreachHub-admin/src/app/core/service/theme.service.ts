import { Injectable, Inject, PLATFORM_ID, Renderer2, RendererFactory2 } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  private isBrowser: boolean;

  // Create a BehaviorSubject to hold and emit the current theme.
  private theme$ = new BehaviorSubject<'light' | 'dark'>('dark');
  // Expose it as an observable for components to subscribe to.
  public currentTheme$ = this.theme$.asObservable();

  constructor(
    rendererFactory: RendererFactory2,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /**
   * Getter to access the current value of the theme.
   */
  get currentTheme(): 'light' | 'dark' {
    return this.theme$.getValue();
  }

  /**
   * Loads the saved theme from localStorage, only if in a browser.
   */
  loadTheme(): void {
    if (this.isBrowser) {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'dark';
      this.setTheme(savedTheme);
    }
  }

  /**
   * Toggles the theme between light and dark.
   */
  toggleTheme(): void {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  private setTheme(theme: 'light' | 'dark'): void {
    // Emit the new theme to all subscribers.
    this.theme$.next(theme);
    
    if (this.isBrowser) {
      localStorage.setItem('theme', theme);
      if (theme === 'dark') {
        this.renderer.addClass(document.documentElement, 'dark');
      } else {
        this.renderer.removeClass(document.documentElement, 'dark');
      }
    }
  }
}

