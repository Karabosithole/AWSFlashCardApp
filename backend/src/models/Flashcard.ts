import mongoose, { Document, Schema } from 'mongoose';

export interface IFlashcard extends Document {
  front: string;
  back: string;
  stack: mongoose.Types.ObjectId;
  difficulty: 'easy' | 'medium' | 'hard';
  studyStats: {
    timesStudied: number;
    correctCount: number;
    incorrectCount: number;
    lastStudied?: Date;
    nextReviewDate?: Date;
    interval: number; // For spaced repetition
    easeFactor: number; // For SuperMemo algorithm
  };
  createdAt: Date;
  updatedAt: Date;
}

const FlashcardSchema = new Schema<IFlashcard>({
  front: {
    type: String,
    required: [true, 'Front content is required'],
    trim: true,
    maxlength: [1000, 'Front content cannot exceed 1000 characters']
  },
  back: {
    type: String,
    required: [true, 'Back content is required'],
    trim: true,
    maxlength: [1000, 'Back content cannot exceed 1000 characters']
  },
  stack: {
    type: Schema.Types.ObjectId,
    ref: 'FlashcardStack',
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  studyStats: {
    timesStudied: {
      type: Number,
      default: 0
    },
    correctCount: {
      type: Number,
      default: 0
    },
    incorrectCount: {
      type: Number,
      default: 0
    },
    lastStudied: {
      type: Date,
      default: null
    },
    nextReviewDate: {
      type: Date,
      default: null
    },
    interval: {
      type: Number,
      default: 1 // Days
    },
    easeFactor: {
      type: Number,
      default: 2.5 // SuperMemo algorithm default
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for accuracy percentage
FlashcardSchema.virtual('accuracy').get(function() {
  if (this.studyStats.timesStudied === 0) return 0;
  return Math.round((this.studyStats.correctCount / this.studyStats.timesStudied) * 100);
});

// Virtual for mastery level
FlashcardSchema.virtual('masteryLevel').get(function() {
  const accuracy = (this as any).accuracy;
  if (accuracy >= 90) return 'mastered';
  if (accuracy >= 70) return 'good';
  if (accuracy >= 50) return 'learning';
  return 'struggling';
});

// Indexes for better query performance
FlashcardSchema.index({ stack: 1, createdAt: -1 });
FlashcardSchema.index({ 'studyStats.nextReviewDate': 1 });
FlashcardSchema.index({ 'studyStats.lastStudied': -1 });

// Update study stats method with spaced repetition
FlashcardSchema.methods.updateStudyStats = function(quality: number) {
  // Quality: 0-5 scale (0=complete blackout, 5=perfect response)
  this.studyStats.timesStudied += 1;
  
  if (quality >= 3) {
    this.studyStats.correctCount += 1;
  } else {
    this.studyStats.incorrectCount += 1;
  }
  
  this.studyStats.lastStudied = new Date();
  
  // SuperMemo algorithm implementation
  if (quality >= 3) {
    if (this.studyStats.timesStudied === 1) {
      this.studyStats.interval = 1;
    } else if (this.studyStats.timesStudied === 2) {
      this.studyStats.interval = 6;
    } else {
      this.studyStats.interval = Math.round(this.studyStats.interval * this.studyStats.easeFactor);
    }
    
    // Update ease factor
    this.studyStats.easeFactor = this.studyStats.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    this.studyStats.easeFactor = Math.max(1.3, this.studyStats.easeFactor);
  } else {
    // Reset interval for incorrect answers
    this.studyStats.interval = 1;
  }
  
  // Set next review date
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + this.studyStats.interval);
  this.studyStats.nextReviewDate = nextReview;
  
  return this.save();
};

export default mongoose.model<IFlashcard>('Flashcard', FlashcardSchema);
