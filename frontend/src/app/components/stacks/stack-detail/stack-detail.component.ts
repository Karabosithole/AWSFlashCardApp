import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-stack-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './stack-detail.component.html',
  styles: [`
    .stack-detail-container {
      padding: 24px;
    }
  `]
})
export class StackDetailComponent {}
