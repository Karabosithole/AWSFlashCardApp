import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserStats {
  overview: {
    totalStacks: number;
    totalCards: number;
    totalStudySessions: number;
    overallAccuracy: number;
    studyStreak: number;
  };
  studyStats: {
    totalCorrectAnswers: number;
    totalIncorrectAnswers: number;
    cardsByDifficulty: Record<string, number>;
  };
  recentActivity: {
    recentStacks: Array<{
      id: string;
      title: string;
      lastStudied: string;
      totalStudied: number;
    }>;
    mostStudiedStacks: Array<{
      id: string;
      title: string;
      totalStudied: number;
      averageScore: number;
    }>;
  };
}

export interface StudyHistory {
  studyHistory: Array<{
    date: string;
    stacksStudied: number;
    totalCards: number;
    correctAnswers: number;
    incorrectAnswers: number;
  }>;
  period: number;
  totalDays: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getStats(): Observable<{ success: boolean; data: UserStats }> {
    return this.http.get<{ success: boolean; data: UserStats }>(`${this.API_URL}/users/stats`);
  }

  getStudyHistory(days: number = 30): Observable<{ success: boolean; data: StudyHistory }> {
    return this.http.get<{ success: boolean; data: StudyHistory }>(`${this.API_URL}/users/study-history`, {
      params: { days: days.toString() }
    });
  }
}
