import { Request, Response } from 'express';
import Flashcard from '../models/Flashcard';
import FlashcardStack from '../models/FlashcardStack';
import { AuthRequest } from '../middleware/auth';

// AI API integration helper
const callAIAPI = async (prompt: string, maxTokens: number = 500): Promise<string> => {
  try {
    const response = await fetch(process.env.AI_API_URL + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful educational assistant that creates high-quality flashcards and study materials. Always respond in JSON format when appropriate.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: maxTokens,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json() as any;
    return data.choices[0].message.content;
  } catch (error) {
    console.error('AI API call failed:', error);
    throw new Error('Failed to generate AI response');
  }
};

// Generate flashcards using AI
export const generateFlashcards = async (req: AuthRequest, res: Response) => {
  try {
    const { topic, count = 10, difficulty = 'medium', stackId } = req.body;
    const userId = req.user._id;

    // Verify that the user owns the stack
    const stack = await FlashcardStack.findOne({ _id: stackId, owner: userId });
    if (!stack) {
      return res.status(404).json({
        success: false,
        message: 'Stack not found or you do not have permission to add cards to it'
      });
    }

    const prompt = `Generate ${count} flashcards about "${topic}" with ${difficulty} difficulty level. 
    Return the response as a JSON array where each flashcard has "front" and "back" properties.
    Make the content educational, accurate, and appropriate for the difficulty level.
    Example format: [{"front": "What is...?", "back": "The answer is..."}]`;

    const aiResponse = await callAIAPI(prompt, 2000);
    
    let flashcards;
    try {
      flashcards = JSON.parse(aiResponse);
    } catch (parseError) {
      throw new Error('Failed to parse AI response');
    }

    if (!Array.isArray(flashcards)) {
      throw new Error('AI response is not an array');
    }

    // Create flashcards in database
    const createdCards = [];
    for (const cardData of flashcards.slice(0, count)) {
      if (cardData.front && cardData.back) {
        const card = new Flashcard({
          front: cardData.front,
          back: cardData.back,
          stack: stackId,
          difficulty
        });
        await card.save();
        createdCards.push(card);
        
        // Add card to stack
        stack.cards.push(card._id as any);
      }
    }

    await stack.save();

    res.status(201).json({
      success: true,
      message: `Generated ${createdCards.length} flashcards successfully`,
      data: {
        cards: createdCards,
        topic,
        difficulty,
        requestedCount: count,
        actualCount: createdCards.length
      }
    });
  } catch (error) {
    console.error('Generate flashcards error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error while generating flashcards'
    });
  }
};

// Improve an existing flashcard using AI
export const improveFlashcard = async (req: AuthRequest, res: Response) => {
  try {
    const cardId = req.params.id;
    const userId = req.user._id;
    const { improvementType } = req.body;

    // Verify that the user owns the card
    const card = await Flashcard.findById(cardId).populate({
      path: 'stack',
      match: { owner: userId }
    });

    if (!card || !card.stack) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard not found or you do not have permission to improve it'
      });
    }

    let prompt = '';
    switch (improvementType) {
      case 'clarity':
        prompt = `Improve the clarity of this flashcard. Make the question and answer clearer and more understandable.
        Front: "${card.front}"
        Back: "${card.back}"
        Return improved versions in JSON format: {"front": "improved front", "back": "improved back"}`;
        break;
      case 'difficulty':
        prompt = `Make this flashcard more challenging while keeping it accurate and educational.
        Front: "${card.front}"
        Back: "${card.back}"
        Return improved versions in JSON format: {"front": "improved front", "back": "improved back"}`;
        break;
      case 'examples':
        prompt = `Add examples or additional context to this flashcard to make it more helpful for learning.
        Front: "${card.front}"
        Back: "${card.back}"
        Return improved versions in JSON format: {"front": "improved front", "back": "improved back with examples"}`;
        break;
      case 'alternative':
        prompt = `Create an alternative version of this flashcard with the same learning objective but different wording.
        Front: "${card.front}"
        Back: "${card.back}"
        Return alternative versions in JSON format: {"front": "alternative front", "back": "alternative back"}`;
        break;
      default:
        throw new Error('Invalid improvement type');
    }

    const aiResponse = await callAIAPI(prompt, 1000);
    
    let improvedCard;
    try {
      improvedCard = JSON.parse(aiResponse);
    } catch (parseError) {
      throw new Error('Failed to parse AI response');
    }

    res.json({
      success: true,
      message: 'Flashcard improvement generated successfully',
      data: {
        originalCard: {
          front: card.front,
          back: card.back
        },
        improvedCard,
        improvementType
      }
    });
  } catch (error) {
    console.error('Improve flashcard error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error while improving flashcard'
    });
  }
};

// Explain a concept using AI
export const explainConcept = async (req: AuthRequest, res: Response) => {
  try {
    const { concept, level = 'intermediate' } = req.body;

    const prompt = `Explain the concept "${concept}" at a ${level} level. 
    Provide a clear, educational explanation that would help someone understand this concept.
    Keep the explanation concise but comprehensive.`;

    const explanation = await callAIAPI(prompt, 1000);

    res.json({
      success: true,
      message: 'Concept explanation generated successfully',
      data: {
        concept,
        level,
        explanation
      }
    });
  } catch (error) {
    console.error('Explain concept error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error while explaining concept'
    });
  }
};

// Generate a study plan using AI
export const generateStudyPlan = async (req: AuthRequest, res: Response) => {
  try {
    const { stackId, timeAvailable, studyGoal = 'review' } = req.body;
    const userId = req.user._id;

    // Verify that the user owns the stack
    const stack = await FlashcardStack.findOne({ _id: stackId, owner: userId }).populate('cards');
    if (!stack) {
      return res.status(404).json({
        success: false,
        message: 'Stack not found or you do not have permission to create a study plan for it'
      });
    }

    const prompt = `Create a study plan for a flashcard stack with ${stack.cards.length} cards.
    Available time: ${timeAvailable} minutes
    Study goal: ${studyGoal}
    Stack title: "${stack.title}"
    Category: "${stack.category}"
    
    Return a JSON object with:
    - "sessions": array of study sessions with duration and focus
    - "recommendedTechnique": study technique recommendation
    - "tips": array of study tips
    - "estimatedProgress": expected progress after completion`;

    const aiResponse = await callAIAPI(prompt, 1500);
    
    let studyPlan;
    try {
      studyPlan = JSON.parse(aiResponse);
    } catch (parseError) {
      throw new Error('Failed to parse AI response');
    }

    res.json({
      success: true,
      message: 'Study plan generated successfully',
      data: {
        stack: {
          id: stack._id,
          title: stack.title,
          cardCount: stack.cards.length
        },
        timeAvailable,
        studyGoal,
        studyPlan
      }
    });
  } catch (error) {
    console.error('Generate study plan error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error while generating study plan'
    });
  }
};
