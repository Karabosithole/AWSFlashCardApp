import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Flashcard {
  _id: string;
  front: string;
  back: string;
  stack: string;
  difficulty: 'easy' | 'medium' | 'hard';
  studyStats: {
    timesStudied: number;
    correctCount: number;
    incorrectCount: number;
    lastStudied?: string;
    nextReviewDate?: string;
    interval: number;
    easeFactor: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface FlashcardStack {
  _id: string;
  title: string;
  description?: string;
  category: string;
  tags: string[];
  isPublic: boolean;
  color: string;
  owner: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  cards: Flashcard[];
  studyStats: {
    totalStudied: number;
    correctAnswers: number;
    incorrectAnswers: number;
    lastStudied?: string;
    averageScore: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateStackRequest {
  title: string;
  description?: string;
  category: string;
  tags?: string[];
  isPublic?: boolean;
  color?: string;
}

export interface CreateCardRequest {
  front: string;
  back: string;
  stackId: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface StudySession {
  cardId: string;
  quality: number; // 0-5 scale
}

@Injectable({
  providedIn: 'root'
})
export class FlashcardService {
  private readonly API_URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Stack operations
  createStack(stackData: CreateStackRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/stacks`, stackData);
  }

  getStacks(page: number = 1, limit: number = 10, category?: string, search?: string): Observable<any> {
    let params: any = { page: page.toString(), limit: limit.toString() };
    if (category) params.category = category;
    if (search) params.search = search;
    
    return this.http.get(`${this.API_URL}/stacks`, { params });
  }

  getPublicStacks(page: number = 1, limit: number = 10, category?: string, search?: string): Observable<any> {
    let params: any = { page: page.toString(), limit: limit.toString() };
    if (category) params.category = category;
    if (search) params.search = search;
    
    return this.http.get(`${this.API_URL}/stacks/public`, { params });
  }

  getStack(stackId: string): Observable<any> {
    return this.http.get(`${this.API_URL}/stacks/${stackId}`);
  }

  updateStack(stackId: string, stackData: Partial<CreateStackRequest>): Observable<any> {
    return this.http.put(`${this.API_URL}/stacks/${stackId}`, stackData);
  }

  deleteStack(stackId: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/stacks/${stackId}`);
  }

  duplicateStack(stackId: string): Observable<any> {
    return this.http.post(`${this.API_URL}/stacks/${stackId}/duplicate`, {});
  }

  // Card operations
  createCard(cardData: CreateCardRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/cards`, cardData);
  }

  getCards(stackId: string, page: number = 1, limit: number = 20, difficulty?: string): Observable<any> {
    let params: any = { page: page.toString(), limit: limit.toString() };
    if (difficulty) params.difficulty = difficulty;
    
    return this.http.get(`${this.API_URL}/cards/stack/${stackId}`, { params });
  }

  getCardsForStudy(stackId: string): Observable<any> {
    return this.http.get(`${this.API_URL}/cards/study/${stackId}`);
  }

  getCard(cardId: string): Observable<any> {
    return this.http.get(`${this.API_URL}/cards/${cardId}`);
  }

  updateCard(cardId: string, cardData: Partial<CreateCardRequest>): Observable<any> {
    return this.http.put(`${this.API_URL}/cards/${cardId}`, cardData);
  }

  deleteCard(cardId: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/cards/${cardId}`);
  }

  studyCard(cardId: string, quality: number): Observable<any> {
    return this.http.post(`${this.API_URL}/cards/${cardId}/study`, { quality });
  }
}
