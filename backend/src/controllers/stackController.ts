import { Request, Response } from 'express';
import FlashcardStack from '../models/FlashcardStack';
import Flashcard from '../models/Flashcard';
import { AuthRequest } from '../middleware/auth';

// Create a new flashcard stack
export const createStack = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category, tags, isPublic, color } = req.body;
    const userId = req.user._id;

    const stack = new FlashcardStack({
      title,
      description,
      category,
      tags: tags || [],
      isPublic: isPublic || false,
      color: color || '#3B82F6',
      owner: userId,
      cards: []
    });

    await stack.save();
    await stack.populate('owner', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Flashcard stack created successfully',
      data: { stack }
    });
  } catch (error) {
    console.error('Create stack error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating stack'
    });
  }
};

// Get user's flashcard stacks
export const getStacks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as string;
    const search = req.query.search as string;

    const skip = (page - 1) * limit;

    // Build query
    const query: any = { owner: userId };
    
    if (category) {
      query.category = new RegExp(category, 'i');
    }
    
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const stacks = await FlashcardStack.find(query)
      .populate('owner', 'firstName lastName email')
      .populate('cards')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await FlashcardStack.countDocuments(query);

    res.json({
      success: true,
      data: {
        stacks,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalStacks: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get stacks error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching stacks'
    });
  }
};

// Get public flashcard stacks
export const getPublicStacks = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as string;
    const search = req.query.search as string;

    const skip = (page - 1) * limit;

    // Build query
    const query: any = { isPublic: true };
    
    if (category) {
      query.category = new RegExp(category, 'i');
    }
    
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const stacks = await FlashcardStack.find(query)
      .populate('owner', 'firstName lastName')
      .populate('cards')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await FlashcardStack.countDocuments(query);

    res.json({
      success: true,
      data: {
        stacks,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalStacks: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get public stacks error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching public stacks'
    });
  }
};

// Get a specific flashcard stack
export const getStack = async (req: AuthRequest, res: Response) => {
  try {
    const stackId = req.params.id;
    const userId = req.user._id;

    const stack = await FlashcardStack.findOne({
      _id: stackId,
      $or: [{ owner: userId }, { isPublic: true }]
    })
      .populate('owner', 'firstName lastName email')
      .populate('cards');

    if (!stack) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard stack not found'
      });
    }

    res.json({
      success: true,
      data: { stack }
    });
  } catch (error) {
    console.error('Get stack error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching stack'
    });
  }
};

// Update a flashcard stack
export const updateStack = async (req: AuthRequest, res: Response) => {
  try {
    const stackId = req.params.id;
    const userId = req.user._id;
    const updates = req.body;

    const stack = await FlashcardStack.findOneAndUpdate(
      { _id: stackId, owner: userId },
      updates,
      { new: true, runValidators: true }
    ).populate('owner', 'firstName lastName email').populate('cards');

    if (!stack) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard stack not found or you do not have permission to update it'
      });
    }

    res.json({
      success: true,
      message: 'Flashcard stack updated successfully',
      data: { stack }
    });
  } catch (error) {
    console.error('Update stack error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating stack'
    });
  }
};

// Delete a flashcard stack
export const deleteStack = async (req: AuthRequest, res: Response) => {
  try {
    const stackId = req.params.id;
    const userId = req.user._id;

    const stack = await FlashcardStack.findOne({ _id: stackId, owner: userId });
    if (!stack) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard stack not found or you do not have permission to delete it'
      });
    }

    // Delete all flashcards in the stack
    await Flashcard.deleteMany({ stack: stackId });

    // Delete the stack
    await FlashcardStack.findByIdAndDelete(stackId);

    res.json({
      success: true,
      message: 'Flashcard stack deleted successfully'
    });
  } catch (error) {
    console.error('Delete stack error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting stack'
    });
  }
};

// Duplicate a flashcard stack
export const duplicateStack = async (req: AuthRequest, res: Response) => {
  try {
    const stackId = req.params.id;
    const userId = req.user._id;

    const originalStack = await FlashcardStack.findOne({
      _id: stackId,
      $or: [{ owner: userId }, { isPublic: true }]
    }).populate('cards');

    if (!originalStack) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard stack not found'
      });
    }

    // Create new stack
    const newStack = new FlashcardStack({
      title: `${originalStack.title} (Copy)`,
      description: originalStack.description,
      category: originalStack.category,
      tags: originalStack.tags,
      isPublic: false, // Duplicated stacks are private by default
      color: originalStack.color,
      owner: userId,
      cards: []
    });

    await newStack.save();

    // Duplicate all flashcards
    const newCards: any[] = [];
    for (const card of originalStack.cards as any[]) {
      const newCard = new Flashcard({
        front: card.front,
        back: card.back,
        stack: newStack._id,
        difficulty: card.difficulty
      });
      await newCard.save();
      newCards.push(newCard._id);
    }

    // Update stack with new card IDs
    newStack.cards = newCards as any;
    await newStack.save();

    await newStack.populate('owner', 'firstName lastName email');
    await newStack.populate('cards');

    res.status(201).json({
      success: true,
      message: 'Flashcard stack duplicated successfully',
      data: { stack: newStack }
    });
  } catch (error) {
    console.error('Duplicate stack error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while duplicating stack'
    });
  }
};
