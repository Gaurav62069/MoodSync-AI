import asyncHandler from 'express-async-handler';

// Helper: Check if user has high-level privileges (Admin OR Owner)
const isAdminOrOwner = (user) => {
  return user.role === 'admin' || user.role === 'owner';
};

export const deleteOne = (Model) =>
  asyncHandler(async (req, res) => {
    // Logic: Admin/Owner can delete by ID directly.
    // Normal User needs to own the document.
    const query = isAdminOrOwner(req.user)
      ? { _id: req.params.id }
      : { _id: req.params.id, user: req.user._id };

    const doc = await Model.findOneAndDelete(query);

    if (!doc) {
      res.status(404);
      throw new Error('No document found with that ID or permission denied');
    }

    res.status(200).json({
      status: 'success',
      data: null,
    });
  });

export const updateOne = (Model) =>
  asyncHandler(async (req, res) => {
    const query = isAdminOrOwner(req.user)
      ? { _id: req.params.id }
      : { _id: req.params.id, user: req.user._id };

    const doc = await Model.findOneAndUpdate(query, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      res.status(404);
      throw new Error('No document found or permission denied');
    }

    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });

export const createOne = (Model) =>
  asyncHandler(async (req, res) => {
    // Create new doc and attach current user's ID
    const doc = await Model.create({ ...req.body, user: req.user._id });
    
    res.status(201).json({
      status: 'success',
      data: doc,
    });
  });

export const getOne = (Model, popOptions) =>
  asyncHandler(async (req, res) => {
    const query = isAdminOrOwner(req.user)
      ? { _id: req.params.id }
      : { _id: req.params.id, user: req.user._id };

    let queryObj = Model.findOne(query);
    if (popOptions) queryObj = queryObj.populate(popOptions);
    
    const doc = await queryObj;

    if (!doc) {
      res.status(404);
      throw new Error('No document found');
    }

    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });

export const getAll = (Model, responseKey = 'data') =>
  asyncHandler(async (req, res) => {
    // CRITICAL FIX:
    // Pehle sirf 'admin' check ho raha tha.
    // Ab agar tu 'owner' hai toh filter {} rahega (sab kuch dikhega).
    // Agar normal user hai, tabhi { user: id } filter lagega.
    let filter = {};
    
    // Agar user Admin ya Owner NAHI hai, tabhi filter lagao
    if (!isAdminOrOwner(req.user)) {
      filter = { user: req.user._id };
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    const docs = await Model.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Model.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      results: docs.length,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
      },
      [responseKey]: docs,
    });
  });