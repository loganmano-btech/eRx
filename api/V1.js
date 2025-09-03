const mongoose = require('mongoose');
const axios = require('axios');
const express = require('express');
const router = express.Router();

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dob: { type: Date, required: true },
  sex: { type: String, enum: ['M', 'F', 'O'], required: true },
  address: { type: String, required: true },
  phoneNumber: { type: String, required: true }
});

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  clinicAddress: { type: String, required: true },
  clinicPhoneNumber: { type: String, required: true },
  npi: { type: String, required: true },
  dea: { type: String, required: true }
});

const prescriptionSchema = new mongoose.Schema({
  drug: { type: String, required: true },
  strength: { type: String, required: true },
  route: { type: String, required: true },
  form: { type: String, required: true },
  dateWritten: { type: Date, required: true },
  quantity: { type: Number, required: true },
  refills: { type: Number, required: true },
  daysSupply: { type: Number }, // optional
  daw: { type: String },
  directions: { type: String, required: true },
  notes: { type: String }
});

const rxFormSchema = new mongoose.Schema({
  patient: { type: patientSchema, required: true },
  doctor: { type: doctorSchema, required: true },
  prescription: { type: prescriptionSchema, required: true },
  hidden: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// === MODEL ===
const RxForm = mongoose.model('RxForm', rxFormSchema);

// Get all forms
router.get('/api/forms', async (req, res) => {
  try {
    const forms = await RxForm.find().sort({ createdAt: -1 }); // newest first
    res.json(forms);
  } catch (err) {
    console.error('Error fetching forms:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a specific form by _id
router.get('/api/forms/:_id', async (req, res) => {
  try {
    const form = await RxForm.findById(req.params._id);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    res.json(form);
  } catch (err) {
    console.error('Error fetching form:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// In rx.js
router.post('/api/forms', async (req, res) => {
  let updates = JSON.parse(req.body.update);
  try {
    const form = new RxForm(updates); // assumes body matches schema shape
    await form.save();
    res.status(201).json(form);
  } catch (err) {
    console.error('Error creating form:', err);
    res.status(400).json({ error: err.message });
  }
});

// In rx.js
router.put('/api/forms/:_id', async (req, res) => {
  let formId = req.params._id;
  let updates = JSON.parse(req.body.update);
  const form = (await RxForm.findById(req.params._id));
  try {
    form.updateOne(updates);

    await form.save();
    res.status(201).json(form);
  } catch (err) {
    console.error('Error updating form:', err);
    res.status(400).json({ error: err.message });
  }
});

// === EXPORT ===
module.exports = { RxForm, router };
