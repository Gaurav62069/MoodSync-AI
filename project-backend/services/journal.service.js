import JournalEntry from '../models/journalEntry.model.js';

export const createEntryService = async (userId, entryData) => {
  return await JournalEntry.create({
    ...entryData,
    user: userId
  });
};

export const getAllEntriesService = async (userId) => {
  // Sort by newest first
  return await JournalEntry.find({ user: userId }).sort('-createdAt');
};

export const getEntryByIdService = async (userId, entryId) => {
  const entry = await JournalEntry.findOne({ _id: entryId, user: userId });
  if (!entry) throw new Error('Entry not found');
  return entry;
};

export const updateEntryService = async (userId, entryId, updateData) => {
  const entry = await JournalEntry.findOne({ _id: entryId, user: userId });
  if (!entry) throw new Error('Entry not found');

  if (updateData.title) entry.title = updateData.title;
  if (updateData.content) entry.content = updateData.content;
  // Add other fields if necessary (tags, mood linkage etc.)

  return await entry.save();
};

export const deleteEntryService = async (userId, entryId) => {
  const entry = await JournalEntry.findOne({ _id: entryId, user: userId });
  if (!entry) throw new Error('Entry not found');
  
  await JournalEntry.deleteOne({ _id: entryId });
  return true;
};