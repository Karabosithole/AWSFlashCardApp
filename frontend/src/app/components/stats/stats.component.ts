import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './stats.component.html',
  styles: [`
    .stats-container {
      padding: 24px;
    }
  `]
})
export class StatsComponent {}
