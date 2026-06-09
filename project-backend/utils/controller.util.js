import asyncHandler from 'express-async-handler';

/**
 * Generic function to handle suggestion requests
 * Wraps the service call, handles errors, and passes user context (Mood & Country).
 * * @param {Function} serviceFunction - The service function to call (e.g., fetchMovie)
 */
export const getSuggestion = (serviceFunction) =>
  asyncHandler(async (req, res) => {
    // 1. Mood Query Parameter check karo
    const { mood } = req.query;

    if (!mood) {
      res.status(400);
      throw new Error('Mood query parameter is required');
    }

    // 2. User ki Country nikaalo (Auth Middleware se req.user milta hai)
    // Agar user object nahi hai ya country set nahi hai, toh default 'IN' (India) use karo
    const country = req.user?.country || 'IN';

    try {
      // 3. Service function ko call karo (Mood aur Country dono bhejo)
      const result = await serviceFunction(mood, country);
      
      // 4. Result return karo
      res.json(result);
      
    } catch (error) {
      // Error handling
      console.error(`Error in service: ${serviceFunction.name}`, error.message);
      res.status(500);
      throw new Error(`${serviceFunction.name} failed: ${error.message}`);
    }
  });