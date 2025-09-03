import express from 'express';
import { body, param, query } from 'express-validator';
import { 
  createStack, 
  getStacks, 
  getStack, 
  updateStack, 
  deleteStack,
  getPublicStacks,
  duplicateStack
} from '../controllers/stackController';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';

const router = express.Router();

// Validation rules
const createStackValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('category')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category must be between 1 and 50 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Each tag cannot exceed 30 characters'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color')
];

const updateStackValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid stack ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('category')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category must be between 1 and 50 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Each tag cannot exceed 30 characters'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color')
];

const stackIdValidation = [
  param('id')
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
  query('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Category filter cannot exceed 50 characters'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term cannot exceed 100 characters')
];

// Routes
router.post('/', authenticate, createStackValidation, validateRequest, createStack as any);
router.get('/', authenticate, queryValidation, validateRequest, getStacks as any);
router.get('/public', optionalAuth, queryValidation, validateRequest, getPublicStacks as any);
router.get('/:id', authenticate, stackIdValidation, validateRequest, getStack as any);
router.put('/:id', authenticate, updateStackValidation, validateRequest, updateStack as any);
router.delete('/:id', authenticate, stackIdValidation, validateRequest, deleteStack as any);
router.post('/:id/duplicate', authenticate, stackIdValidation, validateRequest, duplicateStack as any);

export default router;
