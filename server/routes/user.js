import express from 'express';
import User from '../models/User.js';

const router = express.Router();


import auth from '../middleware/auth.js';

// Add visited country (secure)
router.post('/visited', auth, async (req, res) => {
  try {
    const { countryId } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.visitedCountries.includes(countryId)) {
      user.visitedCountries.push(countryId);
      await user.save();
    }
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Remove visited country (secure)
router.delete('/visited', auth, async (req, res) => {
  try {
    const { countryId } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.visitedCountries = user.visitedCountries.filter(id => id.toString() !== countryId);
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Add wishlist country (secure)
router.post('/wishlist', auth, async (req, res) => {
  try {
    const { countryId } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.wishlistCountries.includes(countryId)) {
      user.wishlistCountries.push(countryId);
      await user.save();
    }
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Remove wishlist country (secure)
router.delete('/wishlist', auth, async (req, res) => {
  try {
    const { countryId } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.wishlistCountries = user.wishlistCountries.filter(id => id.toString() !== countryId);
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all users
router.get('/', async (req, res) => {
  const users = await User.find().populate('visitedCountries wishlistCountries');
  res.json(users);
});

export default router;
