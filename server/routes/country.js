import express from 'express';
import Country from '../models/Country.js';
import User from '../models/User.js';

const router = express.Router();

// Add or find a country (idempotent)
router.post('/', async (req, res) => {
  try {
    const { name, code } = req.body;
    let country = await Country.findOne({ name });
    if (!country) {
      country = new Country({ name, code });
      await country.save();
    }
    res.status(201).json(country);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// Get all countries
router.get('/', async (req, res) => {
  const countries = await Country.find();
  res.json(countries);
});

export default router;
