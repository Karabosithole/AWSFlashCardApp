import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-study',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './study.component.html',
  styles: [`
    .study-container {
      padding: 24px;
    }
  `]
})
export class StudyComponent {}
