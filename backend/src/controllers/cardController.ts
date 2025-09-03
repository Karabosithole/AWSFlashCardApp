import { Request, Response } from 'express';
import Flashcard from '../models/Flashcard';
import FlashcardStack from '../models/FlashcardStack';
import { AuthRequest } from '../middleware/auth';

// Create a new flashcard
export const createCard = async (req: AuthRequest, res: Response) => {
  try {
    const { front, back, stackId, difficulty } = req.body;
    const userId = req.user._id;

    // Verify that the user owns the stack
    const stack = await FlashcardStack.findOne({ _id: stackId, owner: userId });
    if (!stack) {
      return res.status(404).json({
        success: false,
        message: 'Stack not found or you do not have permission to add cards to it'
      });
    }

    const card = new Flashcard({
      front,
      back,
      stack: stackId,
      difficulty: difficulty || 'medium'
    });

    await card.save();

    // Add card to stack
    stack.cards.push(card._id as any);
    await stack.save();

    await card.populate('stack', 'title');

    res.status(201).json({
      success: true,
      message: 'Flashcard created successfully',
      data: { card }
    });
  } catch (error) {
    console.error('Create card error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating card'
    });
  }
};

// Get cards for a specific stack
export const getCards = async (req: AuthRequest, res: Response) => {
  try {
    const stackId = req.params.stackId;
    const userId = req.user._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const difficulty = req.query.difficulty as string;

    const skip = (page - 1) * limit;

    // Verify that the user has access to the stack
    const stack = await FlashcardStack.findOne({
      _id: stackId,
      $or: [{ owner: userId }, { isPublic: true }]
    });

    if (!stack) {
      return res.status(404).json({
        success: false,
        message: 'Stack not found or you do not have permission to view it'
      });
    }

    // Build query
    const query: any = { stack: stackId };
    if (difficulty) {
      query.difficulty = difficulty;
    }

    const cards = await Flashcard.find(query)
      .populate('stack', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Flashcard.countDocuments(query);

    res.json({
      success: true,
      data: {
        cards,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalCards: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get cards error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching cards'
    });
  }
};

// Get cards for study session
export const getCardsForStudy = async (req: AuthRequest, res: Response) => {
  try {
    const stackId = req.params.stackId;
    const userId = req.user._id;

    // Verify that the user has access to the stack
    const stack = await FlashcardStack.findOne({
      _id: stackId,
      $or: [{ owner: userId }, { isPublic: true }]
    });

    if (!stack) {
      return res.status(404).json({
        success: false,
        message: 'Stack not found or you do not have permission to study it'
      });
    }

    // Get cards that are due for review or haven't been studied
    const now = new Date();
    const cards = await Flashcard.find({
      stack: stackId,
      $or: [
        { 'studyStats.nextReviewDate': { $lte: now } },
        { 'studyStats.nextReviewDate': null },
        { 'studyStats.timesStudied': 0 }
      ]
    })
      .populate('stack', 'title')
      .sort({ 'studyStats.nextReviewDate': 1, createdAt: 1 });

    res.json({
      success: true,
      data: {
        cards,
        totalCards: cards.length,
        stack: {
          id: stack._id,
          title: stack.title,
          description: stack.description
        }
      }
    });
  } catch (error) {
    console.error('Get cards for study error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching cards for study'
    });
  }
};

// Get a specific flashcard
export const getCard = async (req: AuthRequest, res: Response) => {
  try {
    const cardId = req.params.id;
    const userId = req.user._id;

    const card = await Flashcard.findById(cardId).populate({
      path: 'stack',
      match: {
        $or: [{ owner: userId }, { isPublic: true }]
      }
    });

    if (!card || !card.stack) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard not found or you do not have permission to view it'
      });
    }

    res.json({
      success: true,
      data: { card }
    });
  } catch (error) {
    console.error('Get card error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching card'
    });
  }
};

// Update a flashcard
export const updateCard = async (req: AuthRequest, res: Response) => {
  try {
    const cardId = req.params.id;
    const userId = req.user._id;
    const updates = req.body;

    // First, verify that the user owns the stack containing this card
    const card = await Flashcard.findById(cardId).populate({
      path: 'stack',
      match: { owner: userId }
    });

    if (!card || !card.stack) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard not found or you do not have permission to update it'
      });
    }

    const updatedCard = await Flashcard.findByIdAndUpdate(
      cardId,
      updates,
      { new: true, runValidators: true }
    ).populate('stack', 'title');

    res.json({
      success: true,
      message: 'Flashcard updated successfully',
      data: { card: updatedCard }
    });
  } catch (error) {
    console.error('Update card error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating card'
    });
  }
};

// Delete a flashcard
export const deleteCard = async (req: AuthRequest, res: Response) => {
  try {
    const cardId = req.params.id;
    const userId = req.user._id;

    // First, verify that the user owns the stack containing this card
    const card = await Flashcard.findById(cardId).populate({
      path: 'stack',
      match: { owner: userId }
    });

    if (!card || !card.stack) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard not found or you do not have permission to delete it'
      });
    }

    // Remove card from stack
    await FlashcardStack.findByIdAndUpdate(
      card.stack._id,
      { $pull: { cards: cardId } }
    );

    // Delete the card
    await Flashcard.findByIdAndDelete(cardId);

    res.json({
      success: true,
      message: 'Flashcard deleted successfully'
    });
  } catch (error) {
    console.error('Delete card error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting card'
    });
  }
};

// Study a flashcard (update study stats)
export const studyCard = async (req: AuthRequest, res: Response) => {
  try {
    const cardId = req.params.id;
    const userId = req.user._id;
    const { quality } = req.body;

    // Verify that the user has access to the card
    const card = await Flashcard.findById(cardId).populate({
      path: 'stack',
      match: {
        $or: [{ owner: userId }, { isPublic: true }]
      }
    });

    if (!card || !card.stack) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard not found or you do not have permission to study it'
      });
    }

    // Update study stats using the spaced repetition algorithm
    await (card as any).updateStudyStats(quality);

    // Update stack study stats
    const stack = await FlashcardStack.findById(card.stack._id);
    if (stack) {
      await (stack as any).updateStudyStats(quality >= 3);
    }

    res.json({
      success: true,
      message: 'Study session recorded successfully',
      data: {
        card: {
          id: card._id,
          studyStats: card.studyStats
        }
      }
    });
  } catch (error) {
    console.error('Study card error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while recording study session'
    });
  }
};
