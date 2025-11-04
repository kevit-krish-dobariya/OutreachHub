import { Component, OnInit } from '@angular/core';
import { ThemeService } from './core/service/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

   constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.themeService.loadTheme();
  }
  title = 'OutreachHub-admin';
}
