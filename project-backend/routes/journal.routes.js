import express from 'express';
import {
  createJournalEntry,
  getAllJournalEntries,
  getJournalEntryById,
  updateJournalEntry,
  deleteJournalEntry,
} from '../controllers/journal.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();
router
  .route('/')
  .post(protect, createJournalEntry)
  .get(protect, getAllJournalEntries);

router
  .route('/:id')
  .get(protect, getJournalEntryById)
  .patch(protect, updateJournalEntry)
  .delete(protect, deleteJournalEntry);

export default router;