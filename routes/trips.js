const express = require('express');
const Trip = require('../models/Trip');
const auth = require('../middleware/auth');

const router = express.Router();

// 获取用户的所有旅行计划
router.get('/', auth, async (req, res) => {
  try {
    const trips = await Trip.find({ user: req.userId })
      .sort({ createdAt: -1 });
    res.json(trips);
  } catch (error) {
    console.error('获取旅行计划错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取单个旅行计划
router.get('/:id', auth, async (req, res) => {
  try {
    const trip = await Trip.findOne({ 
      _id: req.params.id, 
      user: req.userId 
    });
    
    if (!trip) {
      return res.status(404).json({ message: '旅行计划未找到' });
    }
    
    res.json(trip);
  } catch (error) {
    console.error('获取旅行计划错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 创建新的旅行计划
router.post('/', auth, async (req, res) => {
  try {
    const tripData = {
      ...req.body,
      user: req.userId
    };
    
    const trip = new Trip(tripData);
    await trip.save();
    
    res.status(201).json({
      message: '旅行计划创建成功',
      trip
    });
  } catch (error) {
    console.error('创建旅行计划错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新旅行计划
router.put('/:id', auth, async (req, res) => {
  try {
    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true }
    );
    
    if (!trip) {
      return res.status(404).json({ message: '旅行计划未找到' });
    }
    
    res.json({
      message: '旅行计划更新成功',
      trip
    });
  } catch (error) {
    console.error('更新旅行计划错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 删除旅行计划
router.delete('/:id', auth, async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });
    
    if (!trip) {
      return res.status(404).json({ message: '旅行计划未找到' });
    }
    
    res.json({ message: '旅行计划删除成功' });
  } catch (error) {
    console.error('删除旅行计划错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 添加费用记录
router.post('/:id/expenses', auth, async (req, res) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      user: req.userId
    });
    
    if (!trip) {
      return res.status(404).json({ message: '旅行计划未找到' });
    }
    
    trip.expenses.push(req.body);
    await trip.save();
    
    res.json({
      message: '费用记录添加成功',
      trip
    });
  } catch (error) {
    console.error('添加费用记录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新费用记录
router.put('/:id/expenses/:expenseId', auth, async (req, res) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      user: req.userId
    });
    
    if (!trip) {
      return res.status(404).json({ message: '旅行计划未找到' });
    }
    
    const expense = trip.expenses.id(req.params.expenseId);
    if (!expense) {
      return res.status(404).json({ message: '费用记录未找到' });
    }
    
    Object.assign(expense, req.body);
    await trip.save();
    
    res.json({
      message: '费用记录更新成功',
      trip
    });
  } catch (error) {
    console.error('更新费用记录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 删除费用记录
router.delete('/:id/expenses/:expenseId', auth, async (req, res) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      user: req.userId
    });
    
    if (!trip) {
      return res.status(404).json({ message: '旅行计划未找到' });
    }
    
    trip.expenses.id(req.params.expenseId).remove();
    await trip.save();
    
    res.json({
      message: '费用记录删除成功',
      trip
    });
  } catch (error) {
    console.error('删除费用记录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
