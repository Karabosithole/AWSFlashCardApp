import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GenerateFlashcardsRequest {
  topic: string;
  count?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  stackId: string;
}

export interface ImproveFlashcardRequest {
  improvementType: 'clarity' | 'difficulty' | 'examples' | 'alternative';
}

export interface ExplainConceptRequest {
  concept: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
}

export interface GenerateStudyPlanRequest {
  stackId: string;
  timeAvailable: number; // in minutes
  studyGoal?: 'review' | 'learn' | 'master';
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private readonly API_URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  generateFlashcards(request: GenerateFlashcardsRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/ai/generate-flashcards`, request);
  }

  improveFlashcard(cardId: string, request: ImproveFlashcardRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/ai/improve-flashcard/${cardId}`, request);
  }

  explainConcept(request: ExplainConceptRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/ai/explain-concept`, request);
  }

  generateStudyPlan(request: GenerateStudyPlanRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/ai/generate-study-plan`, request);
  }
}
