import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import { 
  createEntryService, 
  getAllEntriesService, 
  getEntryByIdService, 
  updateEntryService, 
  deleteEntryService 
} from '../services/journal.service.js';

/**
 * @desc    Create a new journal entry
 * @route   POST /api/journal
 * @access  Private
 */
export const createJournalEntry = asyncHandler(async (req, res) => {
  const entry = await createEntryService(req.user._id, req.body);
  
  res.status(201).json({
    success: true,
    data: entry
  });
});

/**
 * @desc    Get all journal entries for the user
 * @route   GET /api/journal
 * @access  Private
 */
export const getAllJournalEntries = asyncHandler(async (req, res) => {
  const entries = await getAllEntriesService(req.user._id);
  
  res.status(200).json({
    success: true,
    count: entries.length,
    data: entries
  });
});

/**
 * @desc    Get a single journal entry by ID
 * @route   GET /api/journal/:id
 * @access  Private
 */
export const getJournalEntryById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid entry ID');
  }
  
  try {
    const entry = await getEntryByIdService(req.user._id, req.params.id);
    res.json(entry);
  } catch (error) {
    res.status(404);
    throw new Error(error.message); // e.g. "Entry not found"
  }
});

/**
 * @desc    Update a journal entry
 * @route   PATCH /api/journal/:id
 * @access  Private
 */
export const updateJournalEntry = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid entry ID');
  }

  try {
    const updatedEntry = await updateEntryService(req.user._id, req.params.id, req.body);
    res.json(updatedEntry);
  } catch (error) {
    res.status(404);
    throw new Error(error.message);
  }
});

/**
 * @desc    Delete a journal entry
 * @route   DELETE /api/journal/:id
 * @access  Private
 */
export const deleteJournalEntry = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid entry ID');
  }

  try {
    await deleteEntryService(req.user._id, req.params.id);
    res.status(200).json({ message: 'Entry deleted successfully' });
  } catch (error) {
    res.status(404);
    throw new Error(error.message);
  }
});