/**
 * Input Limit Middleware for Gemini API
 * Prevents very large requests from hitting the Gemini API to save costs and improve performance
 */

/**
 * Middleware to limit user input length
 * @param {number} maxChars - Maximum allowed characters
 * @returns {Function} Express middleware function
 */
const limitUserInput = (maxChars) => {
  return (req, res, next) => {
    // Check different possible input fields based on the endpoint
    const inputFields = ['userInput', 'message', 'query', 'foodName', 'ingredients'];
    let inputToCheck = null;
    let fieldName = null;

    // Find the input field to validate
    for (const field of inputFields) {
      if (req.body[field]) {
        inputToCheck = req.body[field];
        fieldName = field;
        break;
      }
    }

    // Special handling for arrays (like ingredients)
    if (Array.isArray(inputToCheck)) {
      inputToCheck = inputToCheck.join(', ');
      fieldName = fieldName + ' (combined)';
    }

    // If no input found, check if it's required
    if (!inputToCheck) {
      return res.status(400).json({ 
        error: "Input is required.",
        message: "Please provide valid input data."
      });
    }

    // Convert to string if not already
    const inputString = String(inputToCheck);

    // Check length limit
    if (inputString.length > maxChars) {
      return res.status(413).json({ 
        error: `Input too long. Max allowed is ${maxChars} characters.`,
        message: `Your ${fieldName} contains ${inputString.length} characters, but the maximum allowed is ${maxChars} characters. Please shorten your input.`,
        details: {
          currentLength: inputString.length,
          maxLength: maxChars,
          field: fieldName
        }
      });
    }

    // Add input length info to request for logging
    req.inputInfo = {
      field: fieldName,
      length: inputString.length,
      maxAllowed: maxChars
    };

    next();
  };
};

/**
 * Middleware specifically for text inputs (messages, queries, food names)
 * @param {number} maxChars - Maximum allowed characters (default: 500)
 */
const limitTextInput = (maxChars = 500) => {
  return limitUserInput(maxChars);
};

/**
 * Middleware specifically for ingredient lists
 * @param {number} maxChars - Maximum allowed characters for combined ingredients (default: 300)
 */
const limitIngredientsInput = (maxChars = 300) => {
  return (req, res, next) => {
    const { ingredients } = req.body;

    if (!ingredients) {
      return res.status(400).json({ 
        error: "Ingredients are required.",
        message: "Please provide a list of ingredients."
      });
    }

    if (!Array.isArray(ingredients)) {
      return res.status(400).json({ 
        error: "Ingredients must be an array.",
        message: "Please provide ingredients as an array of strings."
      });
    }

    if (ingredients.length === 0) {
      return res.status(400).json({ 
        error: "At least one ingredient is required.",
        message: "Please provide at least one ingredient."
      });
    }

    // Check individual ingredient length
    const maxSingleIngredient = 50;
    for (let i = 0; i < ingredients.length; i++) {
      const ingredient = String(ingredients[i]);
      if (ingredient.length > maxSingleIngredient) {
        return res.status(413).json({ 
          error: `Ingredient ${i + 1} is too long.`,
          message: `Each ingredient must be ${maxSingleIngredient} characters or less. Ingredient "${ingredient}" is ${ingredient.length} characters.`,
          details: {
            ingredientIndex: i + 1,
            ingredientLength: ingredient.length,
            maxSingleLength: maxSingleIngredient
          }
        });
      }
    }

    // Check combined length
    const combinedLength = ingredients.join(', ').length;
    if (combinedLength > maxChars) {
      return res.status(413).json({ 
        error: `Combined ingredients too long. Max allowed is ${maxChars} characters.`,
        message: `Your ingredients list contains ${combinedLength} characters, but the maximum allowed is ${maxChars} characters. Please reduce the number of ingredients or use shorter names.`,
        details: {
          currentLength: combinedLength,
          maxLength: maxChars,
          ingredientCount: ingredients.length
        }
      });
    }

    // Add input info for logging
    req.inputInfo = {
      field: 'ingredients',
      length: combinedLength,
      maxAllowed: maxChars,
      count: ingredients.length
    };

    next();
  };
};

/**
 * Middleware for image uploads with size limits
 * @param {number} maxSizeMB - Maximum file size in MB (default: 5)
 */
const limitImageInput = (maxSizeMB = 5) => {
  return (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({ 
        error: "Image file is required.",
        message: "Please upload an image file."
      });
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    
    if (req.file.size > maxSizeBytes) {
      return res.status(413).json({ 
        error: `Image file too large. Max allowed is ${maxSizeMB}MB.`,
        message: `Your image is ${(req.file.size / (1024 * 1024)).toFixed(2)}MB, but the maximum allowed is ${maxSizeMB}MB. Please compress or resize your image.`,
        details: {
          currentSizeMB: (req.file.size / (1024 * 1024)).toFixed(2),
          maxSizeMB: maxSizeMB,
          fileName: req.file.originalname
        }
      });
    }

    // Add file info for logging
    req.inputInfo = {
      field: 'image',
      sizeMB: (req.file.size / (1024 * 1024)).toFixed(2),
      maxAllowedMB: maxSizeMB,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype
    };

    next();
  };
};

module.exports = {
  limitUserInput,
  limitTextInput,
  limitIngredientsInput,
  limitImageInput
};