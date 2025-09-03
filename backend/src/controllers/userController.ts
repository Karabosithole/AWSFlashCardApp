import { Response } from 'express';
import FlashcardStack from '../models/FlashcardStack';
import Flashcard from '../models/Flashcard';
import { AuthRequest } from '../middleware/auth';

// Get user statistics
export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;

    // Get basic counts
    const totalStacks = await FlashcardStack.countDocuments({ owner: userId });
    const totalCards = await Flashcard.countDocuments({ 
      stack: { $in: await FlashcardStack.find({ owner: userId }).distinct('_id') }
    });

    // Get study statistics
    const stacks = await FlashcardStack.find({ owner: userId });
    const totalStudySessions = stacks.reduce((sum, stack) => sum + stack.studyStats.totalStudied, 0);
    const totalCorrectAnswers = stacks.reduce((sum, stack) => sum + stack.studyStats.correctAnswers, 0);
    const totalIncorrectAnswers = stacks.reduce((sum, stack) => sum + stack.studyStats.incorrectAnswers, 0);

    // Calculate overall accuracy
    const overallAccuracy = totalStudySessions > 0 
      ? Math.round((totalCorrectAnswers / totalStudySessions) * 100) 
      : 0;

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentStacks = await FlashcardStack.find({
      owner: userId,
      'studyStats.lastStudied': { $gte: sevenDaysAgo }
    }).sort({ 'studyStats.lastStudied': -1 }).limit(5);

    // Get most studied stacks
    const mostStudiedStacks = await FlashcardStack.find({ owner: userId })
      .sort({ 'studyStats.totalStudied': -1 })
      .limit(5)
      .select('title studyStats.totalStudied studyStats.averageScore');

    // Get cards by difficulty
    const cardsByDifficulty = await Flashcard.aggregate([
      {
        $lookup: {
          from: 'flashcardstacks',
          localField: 'stack',
          foreignField: '_id',
          as: 'stackInfo'
        }
      },
      {
        $match: {
          'stackInfo.owner': userId
        }
      },
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get study streak (consecutive days with study activity)
    const studyStreak = await calculateStudyStreak(userId as string);

    res.json({
      success: true,
      data: {
        overview: {
          totalStacks,
          totalCards,
          totalStudySessions,
          overallAccuracy,
          studyStreak
        },
        studyStats: {
          totalCorrectAnswers,
          totalIncorrectAnswers,
          cardsByDifficulty: cardsByDifficulty.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {} as Record<string, number>)
        },
        recentActivity: {
          recentStacks: recentStacks.map(stack => ({
            id: stack._id,
            title: stack.title,
            lastStudied: stack.studyStats.lastStudied,
            totalStudied: stack.studyStats.totalStudied
          })),
          mostStudiedStacks: mostStudiedStacks.map(stack => ({
            id: stack._id,
            title: stack.title,
            totalStudied: stack.studyStats.totalStudied,
            averageScore: stack.studyStats.averageScore
          }))
        }
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching user statistics'
    });
  }
};

// Get study history
export const getStudyHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const days = parseInt(req.query.days as string) || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get stacks with study activity in the specified period
    const stacks = await FlashcardStack.find({
      owner: userId,
      'studyStats.lastStudied': { $gte: startDate }
    }).sort({ 'studyStats.lastStudied': -1 });

    // Group study activity by date
    const studyHistory = stacks.reduce((acc, stack) => {
      if (stack.studyStats.lastStudied) {
        const date = stack.studyStats.lastStudied.toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = {
            date,
            stacksStudied: 0,
            totalCards: 0,
            correctAnswers: 0,
            incorrectAnswers: 0
          };
        }
        acc[date].stacksStudied += 1;
        acc[date].correctAnswers += stack.studyStats.correctAnswers;
        acc[date].incorrectAnswers += stack.studyStats.incorrectAnswers;
      }
      return acc;
    }, {} as Record<string, any>);

    // Convert to array and sort by date
    const historyArray = Object.values(studyHistory).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    res.json({
      success: true,
      data: {
        studyHistory: historyArray,
        period: days,
        totalDays: historyArray.length
      }
    });
  } catch (error) {
    console.error('Get study history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching study history'
    });
  }
};

// Helper function to calculate study streak
const calculateStudyStreak = async (userId: string): Promise<number> => {
  try {
    const stacks = await FlashcardStack.find({ owner: userId });
    const studyDates = new Set<string>();

    stacks.forEach(stack => {
      if (stack.studyStats.lastStudied) {
        const date = stack.studyStats.lastStudied.toISOString().split('T')[0];
        studyDates.add(date);
      }
    });

    const sortedDates = Array.from(studyDates).sort().reverse();
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Check if user studied today or yesterday
    if (sortedDates.includes(today) || sortedDates.includes(yesterdayStr)) {
      streak = 1;
      
      for (let i = 1; i < sortedDates.length; i++) {
        const currentDate = new Date(sortedDates[i]);
        const previousDate = new Date(sortedDates[i - 1]);
        const diffTime = previousDate.getTime() - currentDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          streak++;
        } else {
          break;
        }
      }
    }

    return streak;
  } catch (error) {
    console.error('Calculate study streak error:', error);
    return 0;
  }
};
