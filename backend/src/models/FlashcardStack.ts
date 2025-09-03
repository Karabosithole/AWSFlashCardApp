import mongoose, { Document, Schema } from 'mongoose';

export interface IFlashcardStack extends Document {
  title: string;
  description?: string;
  category: string;
  tags: string[];
  isPublic: boolean;
  color?: string;
  owner: mongoose.Types.ObjectId;
  cards: mongoose.Types.ObjectId[];
  studyStats: {
    totalStudied: number;
    correctAnswers: number;
    incorrectAnswers: number;
    lastStudied?: Date;
    averageScore: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const FlashcardStackSchema = new Schema<IFlashcardStack>({
  title: {
    type: String,
    required: [true, 'Stack title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: '#3B82F6', // Default blue color
    match: [/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color']
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cards: [{
    type: Schema.Types.ObjectId,
    ref: 'Flashcard'
  }],
  studyStats: {
    totalStudied: {
      type: Number,
      default: 0
    },
    correctAnswers: {
      type: Number,
      default: 0
    },
    incorrectAnswers: {
      type: Number,
      default: 0
    },
    lastStudied: {
      type: Date,
      default: null
    },
    averageScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for card count
FlashcardStackSchema.virtual('cardCount').get(function() {
  return this.cards.length;
});

// Virtual for accuracy percentage
FlashcardStackSchema.virtual('accuracy').get(function() {
  if (this.studyStats.totalStudied === 0) return 0;
  return Math.round((this.studyStats.correctAnswers / this.studyStats.totalStudied) * 100);
});

// Indexes for better query performance
FlashcardStackSchema.index({ owner: 1, createdAt: -1 });
FlashcardStackSchema.index({ isPublic: 1, createdAt: -1 });
FlashcardStackSchema.index({ category: 1 });
FlashcardStackSchema.index({ tags: 1 });
FlashcardStackSchema.index({ title: 'text', description: 'text' });

// Update study stats method
FlashcardStackSchema.methods.updateStudyStats = function(isCorrect: boolean) {
  this.studyStats.totalStudied += 1;
  if (isCorrect) {
    this.studyStats.correctAnswers += 1;
  } else {
    this.studyStats.incorrectAnswers += 1;
  }
  this.studyStats.lastStudied = new Date();
  this.studyStats.averageScore = Math.round((this.studyStats.correctAnswers / this.studyStats.totalStudied) * 100);
  return this.save();
};

export default mongoose.model<IFlashcardStack>('FlashcardStack', FlashcardStackSchema);
