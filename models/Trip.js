const mongoose = require('mongoose');

const dayPlanSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  activities: [{
    time: String,
    title: String,
    description: String,
    location: String,
    cost: Number,
    category: {
      type: String,
      enum: ['景点', '餐厅', '交通', '住宿', '购物', '其他']
    }
  }]
});

const expenseSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    enum: ['交通', '住宿', '餐饮', '景点门票', '购物', '其他'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: String,
  currency: {
    type: String,
    default: 'CNY'
  }
});

const tripSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  budget: {
    type: Number,
    required: true
  },
  travelers: {
    type: Number,
    default: 1
  },
  preferences: {
    interests: [String],
    accommodation: String,
    transportation: String,
    specialRequirements: String
  },
  itinerary: [dayPlanSchema],
  expenses: [expenseSchema],
  status: {
    type: String,
    enum: ['规划中', '进行中', '已完成'],
    default: '规划中'
  },
  aiGenerated: {
    type: Boolean,
    default: false
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// 计算总花费
tripSchema.virtual('totalExpenses').get(function() {
  return this.expenses.reduce((total, expense) => total + expense.amount, 0);
});

// 计算剩余预算
tripSchema.virtual('remainingBudget').get(function() {
  return this.budget - this.totalExpenses;
});

module.exports = mongoose.model('Trip', tripSchema);
