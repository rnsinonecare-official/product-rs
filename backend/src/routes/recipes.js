const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { db } = require('../config/firebase');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const apiService = require('../services/apiService');

const router = express.Router();

/**
 * @route   GET /api/recipes/search
 * @desc    Search recipes by ingredients
 * @access  Private
 */
router.get('/search',
  [
    query('ingredients').notEmpty().withMessage('Ingredients are required'),
    query('number').optional().isInt({ min: 1, max: 50 }).withMessage('Number must be between 1 and 50')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'ValidationError',
        message: errors.array().map(err => err.msg).join(', ')
      });
    }

    const { ingredients, number = 12 } = req.query;
    const ingredientsList = ingredients.split(',').map(ing => ing.trim());

    try {
      const recipes = await apiService.searchRecipesByIngredients(ingredientsList, parseInt(number));
      
      res.json({
        success: true,
        data: recipes,
        count: recipes.length,
        ingredients: ingredientsList
      });
    } catch (error) {
      console.error('Recipe search error:', error);
      throw new AppError('Failed to search recipes', 500);
    }
  })
);

/**
 * @route   GET /api/recipes/:recipeId
 * @desc    Get detailed recipe information
 * @access  Private
 */
router.get('/:recipeId', asyncHandler(async (req, res) => {
  const { recipeId } = req.params;

  try {
    const recipe = await apiService.getRecipeDetails(recipeId);
    
    res.json({
      success: true,
      data: recipe
    });
  } catch (error) {
    console.error('Recipe details error:', error);
    throw new AppError('Failed to get recipe details', 500);
  }
}));

/**
 * @route   POST /api/recipes/favorites
 * @desc    Save recipe to favorites
 * @access  Private
 */
router.post('/favorites',
  [
    body('recipeId').notEmpty().withMessage('Recipe ID is required'),
    body('title').notEmpty().withMessage('Recipe title is required'),
    body('image').optional().isURL().withMessage('Image must be a valid URL'),
    body('cookingTime').optional().isNumeric().withMessage('Cooking time must be a number'),
    body('servings').optional().isNumeric().withMessage('Servings must be a number'),
    body('calories').optional().isNumeric().withMessage('Calories must be a number'),
    body('ingredients').optional().isArray().withMessage('Ingredients must be an array'),
    body('instructions').optional().isArray().withMessage('Instructions must be an array'),
    body('nutritionFacts').optional().isObject().withMessage('Nutrition facts must be an object')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'ValidationError',
        message: errors.array().map(err => err.msg).join(', ')
      });
    }

    const userId = req.user.uid;
    const recipeData = {
      ...req.body,
      userId,
      createdAt: new Date().toISOString(),
      isFavorite: true
    };

    try {
      // Check if recipe is already in favorites
      const existingQuery = await db.collection('favoriteRecipes')
        .where('userId', '==', userId)
        .where('recipeId', '==', req.body.recipeId)
        .get();

      if (!existingQuery.empty) {
        throw new AppError('Recipe is already in favorites', 400);
      }

      const docRef = await db.collection('favoriteRecipes').add(recipeData);
      const newFavorite = { id: docRef.id, ...recipeData };

      res.status(201).json({
        success: true,
        data: newFavorite,
        message: 'Recipe added to favorites successfully'
      });
    } catch (error) {
      console.error('Add favorite recipe error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to add recipe to favorites', 500);
    }
  })
);

/**
 * @route   GET /api/recipes/favorites
 * @desc    Get user's favorite recipes
 * @access  Private
 */
router.get('/favorites/list',
  [
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'ValidationError',
        message: errors.array().map(err => err.msg).join(', ')
      });
    }

    const userId = req.user.uid;
    const { limit = 50 } = req.query;

    try {
      const query = db.collection('favoriteRecipes')
        .where('userId', '==', userId)
        .where('isFavorite', '==', true)
        .orderBy('createdAt', 'desc')
        .limit(parseInt(limit));

      const snapshot = await query.get();
      const favorites = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      res.json({
        success: true,
        data: favorites,
        count: favorites.length
      });
    } catch (error) {
      console.error('Get favorite recipes error:', error);
      throw new AppError('Failed to get favorite recipes', 500);
    }
  })
);

/**
 * @route   DELETE /api/recipes/favorites/:favoriteId
 * @desc    Remove recipe from favorites
 * @access  Private
 */
router.delete('/favorites/:favoriteId', asyncHandler(async (req, res) => {
  const { favoriteId } = req.params;
  const userId = req.user.uid;

  try {
    const favoriteRef = db.collection('favoriteRecipes').doc(favoriteId);
    const favoriteDoc = await favoriteRef.get();

    if (!favoriteDoc.exists) {
      throw new AppError('Favorite recipe not found', 404);
    }

    const favoriteData = favoriteDoc.data();
    if (favoriteData.userId !== userId) {
      throw new AppError('Unauthorized to delete this favorite', 403);
    }

    await favoriteRef.delete();

    res.json({
      success: true,
      message: 'Recipe removed from favorites successfully'
    });
  } catch (error) {
    console.error('Remove favorite recipe error:', error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to remove recipe from favorites', 500);
  }
}));

/**
 * @route   POST /api/recipes/shared
 * @desc    Share a recipe with the community
 * @access  Private
 */
router.post('/shared',
  [
    body('title').notEmpty().withMessage('Recipe title is required'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('ingredients').isArray().withMessage('Ingredients must be an array'),
    body('instructions').isArray().withMessage('Instructions must be an array'),
    body('cookingTime').isNumeric().withMessage('Cooking time must be a number'),
    body('servings').isNumeric().withMessage('Servings must be a number'),
    body('difficulty').isIn(['Easy', 'Medium', 'Hard']).withMessage('Invalid difficulty level'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('nutritionFacts').optional().isObject().withMessage('Nutrition facts must be an object'),
    body('image').optional().isURL().withMessage('Image must be a valid URL')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'ValidationError',
        message: errors.array().map(err => err.msg).join(', ')
      });
    }

    const userId = req.user.uid;
    const recipeData = {
      ...req.body,
      userId,
      authorName: req.user.name || req.user.email,
      createdAt: new Date().toISOString(),
      likes: 0,
      views: 0,
      isPublic: true,
      isApproved: false // Recipes need approval before being public
    };

    try {
      const docRef = await db.collection('sharedRecipes').add(recipeData);
      const newSharedRecipe = { id: docRef.id, ...recipeData };

      res.status(201).json({
        success: true,
        data: newSharedRecipe,
        message: 'Recipe shared successfully and is pending approval'
      });
    } catch (error) {
      console.error('Share recipe error:', error);
      throw new AppError('Failed to share recipe', 500);
    }
  })
);

/**
 * @route   GET /api/recipes/shared
 * @desc    Get shared community recipes
 * @access  Private
 */
router.get('/shared/list',
  [
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('tags').optional().isString().withMessage('Tags must be a string'),
    query('difficulty').optional().isIn(['Easy', 'Medium', 'Hard']).withMessage('Invalid difficulty level'),
    query('sortBy').optional().isIn(['newest', 'popular', 'likes']).withMessage('Invalid sort option')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'ValidationError',
        message: errors.array().map(err => err.msg).join(', ')
      });
    }

    const { limit = 20, tags, difficulty, sortBy = 'newest' } = req.query;

    try {
      let query = db.collection('sharedRecipes')
        .where('isPublic', '==', true)
        .where('isApproved', '==', true);

      if (difficulty) {
        query = query.where('difficulty', '==', difficulty);
      }

      // Apply sorting
      switch (sortBy) {
        case 'popular':
          query = query.orderBy('views', 'desc');
          break;
        case 'likes':
          query = query.orderBy('likes', 'desc');
          break;
        default:
          query = query.orderBy('createdAt', 'desc');
      }

      query = query.limit(parseInt(limit));

      const snapshot = await query.get();
      let recipes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter by tags if provided (client-side filtering since Firestore doesn't support array-contains-any with other filters)
      if (tags) {
        const tagList = tags.split(',').map(tag => tag.trim().toLowerCase());
        recipes = recipes.filter(recipe => 
          recipe.tags && recipe.tags.some(tag => 
            tagList.includes(tag.toLowerCase())
          )
        );
      }

      res.json({
        success: true,
        data: recipes,
        count: recipes.length,
        filters: { tags, difficulty, sortBy }
      });
    } catch (error) {
      console.error('Get shared recipes error:', error);
      throw new AppError('Failed to get shared recipes', 500);
    }
  })
);

/**
 * @route   POST /api/recipes/shared/:recipeId/like
 * @desc    Like a shared recipe
 * @access  Private
 */
router.post('/shared/:recipeId/like', asyncHandler(async (req, res) => {
  const { recipeId } = req.params;
  const userId = req.user.uid;

  try {
    const recipeRef = db.collection('sharedRecipes').doc(recipeId);
    const recipeDoc = await recipeRef.get();

    if (!recipeDoc.exists) {
      throw new AppError('Recipe not found', 404);
    }

    // Check if user already liked this recipe
    const likeQuery = await db.collection('recipeLikes')
      .where('userId', '==', userId)
      .where('recipeId', '==', recipeId)
      .get();

    if (!likeQuery.empty) {
      throw new AppError('Recipe already liked', 400);
    }

    // Add like record
    await db.collection('recipeLikes').add({
      userId,
      recipeId,
      createdAt: new Date().toISOString()
    });

    // Increment likes count
    const currentData = recipeDoc.data();
    await recipeRef.update({
      likes: (currentData.likes || 0) + 1
    });

    res.json({
      success: true,
      message: 'Recipe liked successfully'
    });
  } catch (error) {
    console.error('Like recipe error:', error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to like recipe', 500);
  }
}));

/**
 * @route   DELETE /api/recipes/shared/:recipeId/like
 * @desc    Unlike a shared recipe
 * @access  Private
 */
router.delete('/shared/:recipeId/like', asyncHandler(async (req, res) => {
  const { recipeId } = req.params;
  const userId = req.user.uid;

  try {
    const recipeRef = db.collection('sharedRecipes').doc(recipeId);
    const recipeDoc = await recipeRef.get();

    if (!recipeDoc.exists) {
      throw new AppError('Recipe not found', 404);
    }

    // Find and remove like record
    const likeQuery = await db.collection('recipeLikes')
      .where('userId', '==', userId)
      .where('recipeId', '==', recipeId)
      .get();

    if (likeQuery.empty) {
      throw new AppError('Recipe not liked yet', 400);
    }

    // Remove like record
    await likeQuery.docs[0].ref.delete();

    // Decrement likes count
    const currentData = recipeDoc.data();
    await recipeRef.update({
      likes: Math.max((currentData.likes || 0) - 1, 0)
    });

    res.json({
      success: true,
      message: 'Recipe unliked successfully'
    });
  } catch (error) {
    console.error('Unlike recipe error:', error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to unlike recipe', 500);
  }
}));

/**
 * @route   GET /api/recipes/my-shared
 * @desc    Get user's shared recipes
 * @access  Private
 */
router.get('/my-shared/list',
  [
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'ValidationError',
        message: errors.array().map(err => err.msg).join(', ')
      });
    }

    const userId = req.user.uid;
    const { limit = 50 } = req.query;

    try {
      const query = db.collection('sharedRecipes')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(parseInt(limit));

      const snapshot = await query.get();
      const myRecipes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      res.json({
        success: true,
        data: myRecipes,
        count: myRecipes.length
      });
    } catch (error) {
      console.error('Get my shared recipes error:', error);
      throw new AppError('Failed to get your shared recipes', 500);
    }
  })
);

module.exports = router;