import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatMenuModule
  ],
  templateUrl: './dashboard.component.html',
  styles: [`
    .dashboard-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .toolbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 2;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .sidenav-container {
      flex: 1;
      margin-top: 64px;
    }

    .sidenav {
      width: 250px;
    }

    .content {
      padding: 24px;
      background-color: #f5f5f5;
      min-height: calc(100vh - 64px);
    }

    .welcome-section {
      margin-bottom: 32px;
      text-align: center;
    }

    .welcome-section h1 {
      color: #333;
      margin-bottom: 8px;
    }

    .welcome-section p {
      color: #666;
      font-size: 16px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }

    .stat-info h3 {
      margin: 0;
      font-size: 32px;
      font-weight: bold;
    }

    .stat-info p {
      margin: 0;
      opacity: 0.9;
    }

    .quick-actions {
      margin-bottom: 32px;
    }

    .quick-actions h2 {
      color: #333;
      margin-bottom: 16px;
    }

    .action-buttons {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .action-buttons button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .recent-activity h2 {
      color: #333;
      margin-bottom: 16px;
    }

    .activity-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
    }

    .activity-card {
      background: white;
    }

    .activity-card h4 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .activity-card p {
      margin: 4px 0;
      color: #666;
      font-size: 14px;
    }

    .active {
      background-color: rgba(0, 0, 0, 0.04);
    }

    @media (max-width: 768px) {
      .sidenav {
        width: 200px;
      }
      
      .content {
        padding: 16px;
      }
      
      .stats-grid {
        grid-template-columns: 1fr;
      }
      
      .action-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser: any = null;
  userStats: any = null;

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadUserStats();
  }

  loadUserStats(): void {
    this.userService.getStats().subscribe({
      next: (response) => {
        if (response.success) {
          this.userStats = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading user stats:', error);
      }
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        // Navigation is handled in the service
      },
      error: (error) => {
        console.error('Logout error:', error);
      }
    });
  }
}
