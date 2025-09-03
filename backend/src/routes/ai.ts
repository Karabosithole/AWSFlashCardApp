import express from 'express';
import { body, param } from 'express-validator';
import { 
  generateFlashcards, 
  improveFlashcard, 
  explainConcept,
  generateStudyPlan
} from '../controllers/aiController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';

const router = express.Router();

// Validation rules
const generateFlashcardsValidation = [
  body('topic')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Topic must be between 1 and 200 characters'),
  body('count')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Count must be between 1 and 50'),
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty must be easy, medium, or hard'),
  body('stackId')
    .isMongoId()
    .withMessage('Invalid stack ID')
];

const improveFlashcardValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid card ID'),
  body('improvementType')
    .isIn(['clarity', 'difficulty', 'examples', 'alternative'])
    .withMessage('Improvement type must be clarity, difficulty, examples, or alternative')
];

const explainConceptValidation = [
  body('concept')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Concept must be between 1 and 500 characters'),
  body('level')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Level must be beginner, intermediate, or advanced')
];

const generateStudyPlanValidation = [
  body('stackId')
    .isMongoId()
    .withMessage('Invalid stack ID'),
  body('timeAvailable')
    .isInt({ min: 5, max: 480 })
    .withMessage('Time available must be between 5 and 480 minutes'),
  body('studyGoal')
    .optional()
    .isIn(['review', 'learn', 'master'])
    .withMessage('Study goal must be review, learn, or master')
];

// Routes
router.post('/generate-flashcards', authenticate, generateFlashcardsValidation, validateRequest, generateFlashcards as any);
router.post('/improve-flashcard/:id', authenticate, improveFlashcardValidation, validateRequest, improveFlashcard as any);
router.post('/explain-concept', authenticate, explainConceptValidation, validateRequest, explainConcept as any);
router.post('/generate-study-plan', authenticate, generateStudyPlanValidation, validateRequest, generateStudyPlan as any);

export default router;
