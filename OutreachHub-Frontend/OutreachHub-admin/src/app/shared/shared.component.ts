import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { ThemeService } from '../core/service/theme.service';

@Component({
  selector: 'app-shared',
  templateUrl: './shared.component.html',
  styleUrl: './shared.component.scss'
})
export class SharedComponent {
    isSidebarCollapsed = false;

    constructor() { }




}
