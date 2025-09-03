const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

/** ---------- Schemas (relaxed) ---------- */
const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dob: { type: Date, required: true },
  sex: { type: String, enum: ['M', 'F', 'O', '', null], default: '' }, // relaxed
  address: { type: String, default: '' },
  phoneNumber: { type: String, default: '' }
}, { _id: false });

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },       // keep name required
  clinicAddress: { type: String, default: '' },
  clinicPhoneNumber: { type: String, default: '' },
  npi: { type: String, default: '' },
  dea: { type: String, default: '' }
}, { _id: false });

const prescriptionSchema = new mongoose.Schema({
  drug: { type: String, required: true },
  strength: { type: String, default: '' },
  route: { type: String, default: '' },         // relaxed
  form: { type: String, default: '' },          // relaxed
  dateWritten: { type: Date, required: true },
  quantity: { type: Number, required: true },
  refills: { type: Number, default: 0 },
  daysSupply: { type: Number, default: null },
  daw: { type: String, default: '' },
  directions: { type: String, default: '' },    // relaxed
  notes: { type: String, default: '' }
}, { _id: false });

const rxFormSchema = new mongoose.Schema({
  patient: { type: patientSchema, required: true },
  doctor:  { type: doctorSchema, required: true },
  prescription: { type: prescriptionSchema, required: true }
}, { timestamps: true });

/** ---------- Model ---------- */
const RxForm = mongoose.model('RxForm', rxFormSchema);

/** ---------- Helpers ---------- */
function parsePayload(req) {
  if (typeof req.body?.update === 'string') {
    try { return JSON.parse(req.body.update); }
    catch { throw new Error('Invalid JSON in "update"'); }
  }
  return req.body;
}

/** ---------- Routes (CRUD) ---------- */
router.get('/api/forms', async (_req, res) => {
  try {
    const forms = await RxForm.find().sort({ createdAt: -1 });
    res.json(forms);
  } catch (err) {
    console.error('Error fetching forms:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/api/forms/:id', async (req, res) => {
  try {
    const form = await RxForm.findById(req.params.id);
    if (!form) return res.status(404).json({ error: 'Form not found' });
    res.json(form);
  } catch (err) {
    console.error('Error fetching form:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/api/forms', async (req, res) => {
  try {
    const payload = parsePayload(req);
    const doc = new RxForm(payload);
    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    console.error('Error creating form:', err);
    res.status(400).json({ error: err.message });
  }
});

router.put('/api/forms/:id', async (req, res) => {
  try {
    const payload = parsePayload(req);
    const updated = await RxForm.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Form not found' });
    res.json(updated);
  } catch (err) {
    console.error('Error updating form:', err);
    res.status(400).json({ error: err.message });
  }
});

router.delete('/api/forms/:id', async (req, res) => {
  try {
    const removed = await RxForm.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ error: 'Form not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error('Error deleting form:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = { RxForm, router };
