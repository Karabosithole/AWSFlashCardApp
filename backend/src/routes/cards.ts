import express from 'express';
import { body, param, query } from 'express-validator';
import { 
  createCard, 
  getCards, 
  getCard, 
  updateCard, 
  deleteCard,
  studyCard,
  getCardsForStudy
} from '../controllers/cardController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';

const router = express.Router();

// Validation rules
const createCardValidation = [
  body('front')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Front content must be between 1 and 1000 characters'),
  body('back')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Back content must be between 1 and 1000 characters'),
  body('stackId')
    .isMongoId()
    .withMessage('Invalid stack ID'),
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty must be easy, medium, or hard')
];

const updateCardValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid card ID'),
  body('front')
    .optional()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Front content must be between 1 and 1000 characters'),
  body('back')
    .optional()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Back content must be between 1 and 1000 characters'),
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty must be easy, medium, or hard')
];

const studyCardValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid card ID'),
  body('quality')
    .isInt({ min: 0, max: 5 })
    .withMessage('Quality must be an integer between 0 and 5')
];

const cardIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid card ID')
];

const stackIdValidation = [
  param('stackId')
    .isMongoId()
    .withMessage('Invalid stack ID')
];

const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty filter must be easy, medium, or hard')
];

// Routes
router.post('/', authenticate, createCardValidation, validateRequest, createCard as any);
router.get('/stack/:stackId', authenticate, stackIdValidation, queryValidation, validateRequest, getCards as any);
router.get('/study/:stackId', authenticate, stackIdValidation, validateRequest, getCardsForStudy as any);
router.get('/:id', authenticate, cardIdValidation, validateRequest, getCard as any);
router.put('/:id', authenticate, updateCardValidation, validateRequest, updateCard as any);
router.delete('/:id', authenticate, cardIdValidation, validateRequest, deleteCard as any);
router.post('/:id/study', authenticate, studyCardValidation, validateRequest, studyCard as any);

export default router;
