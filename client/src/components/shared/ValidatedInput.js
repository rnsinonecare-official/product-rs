import React, { useState } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

/**
 * ValidatedInput Component
 * Provides input validation with character limits and visual feedback
 */
const ValidatedInput = ({
  value,
  onChange,
  onSubmit,
  placeholder = "Enter your text...",
  maxLength = 500,
  minLength = 2,
  warningThreshold = null,
  type = "text", // "text", "textarea", "search"
  disabled = false,
  className = "",
  showCharacterCount = true,
  showProgressBar = true,
  submitButtonText = "Submit",
  submitButtonIcon = null,
  rows = 3,
  helpText = null,
  validateOnChange = true,
  customValidation = null, // Function that returns { isValid: boolean, message: string }
  ...props
}) => {
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  
  // Set default warning threshold
  const actualWarningThreshold = warningThreshold || Math.floor(maxLength * 0.9);
  
  // Validation function
  const validateInput = (inputValue) => {
    const trimmed = inputValue.trim();
    
    // Check if empty
    if (!trimmed && touched) {
      return { isValid: false, message: 'This field is required' };
    }
    
    // Check minimum length
    if (trimmed.length > 0 && trimmed.length < minLength) {
      return { isValid: false, message: `Minimum ${minLength} characters required` };
    }
    
    // Check maximum length
    if (inputValue.length > maxLength) {
      return { isValid: false, message: `Maximum ${maxLength} characters allowed` };
    }
    
    // Custom validation
    if (customValidation && trimmed.length > 0) {
      const customResult = customValidation(trimmed);
      if (!customResult.isValid) {
        return customResult;
      }
    }
    
    return { isValid: true, message: '' };
  };
  
  // Handle input change
  const handleChange = (e) => {
    const newValue = e.target.value;
    
    // Don't allow input beyond max length
    if (newValue.length > maxLength) {
      return;
    }
    
    // Validate if enabled
    if (validateOnChange) {
      const validation = validateInput(newValue);
      setError(validation.message);
    }
    
    onChange(newValue);
  };
  
  // Handle blur (when user leaves the field)
  const handleBlur = () => {
    setTouched(true);
    const validation = validateInput(value);
    setError(validation.message);
  };
  
  // Handle submit
  const handleSubmit = () => {
    setTouched(true);
    const validation = validateInput(value);
    
    if (validation.isValid) {
      setError('');
      onSubmit(value.trim());
    } else {
      setError(validation.message);
    }
  };
  
  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && type !== 'textarea') {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  // Calculate progress percentage
  const progressPercentage = Math.min((value.length / maxLength) * 100, 100);
  
  // Determine color scheme based on length
  const getColorScheme = () => {
    if (error) return 'error';
    if (value.length > actualWarningThreshold) return 'warning';
    if (value.length > maxLength * 0.7) return 'caution';
    return 'normal';
  };
  
  const colorScheme = getColorScheme();
  
  const colorClasses = {
    normal: {
      border: 'border-gray-300 focus:border-sage focus:ring-sage',
      text: 'text-gray-700',
      count: 'text-gray-500',
      progress: 'bg-sage'
    },
    caution: {
      border: 'border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500',
      text: 'text-gray-700',
      count: 'text-yellow-600',
      progress: 'bg-yellow-500'
    },
    warning: {
      border: 'border-orange-300 focus:border-orange-500 focus:ring-orange-500',
      text: 'text-gray-700',
      count: 'text-orange-600',
      progress: 'bg-orange-500'
    },
    error: {
      border: 'border-red-300 focus:border-red-500 focus:ring-red-500',
      text: 'text-gray-700',
      count: 'text-red-600',
      progress: 'bg-red-500'
    }
  };
  
  const currentColors = colorClasses[colorScheme];
  
  return (
    <div className={`w-full ${className}`}>
      {/* Input/Textarea */}
      <div className="relative">
        {type === 'textarea' ? (
          <textarea
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            rows={rows}
            disabled={disabled}
            className={`w-full px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 transition-colors ${currentColors.border} ${currentColors.text} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            {...props}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${currentColors.border} ${currentColors.text} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            {...props}
          />
        )}
        
        {/* Submit button (if onSubmit provided) */}
        {onSubmit && (
          <button
            onClick={handleSubmit}
            disabled={disabled || !value.trim() || !!error}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-sage text-white px-4 py-2 rounded-md hover:bg-sage/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {submitButtonIcon && <span>{submitButtonIcon}</span>}
            <span className="hidden sm:inline">{submitButtonText}</span>
          </button>
        )}
      </div>
      
      {/* Character count and progress bar */}
      {(showCharacterCount || showProgressBar) && (
        <div className="mt-2 flex justify-between items-center">
          {showCharacterCount && (
            <span className={`text-sm ${currentColors.count}`}>
              {value.length}/{maxLength} characters
            </span>
          )}
          
          {showProgressBar && (
            <div className="flex-1 max-w-32 ml-4">
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${currentColors.progress}`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="mt-2 flex items-center space-x-2 text-red-600">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      
      {/* Success indicator */}
      {!error && value.trim() && touched && (
        <div className="mt-2 flex items-center space-x-2 text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">Looks good!</span>
        </div>
      )}
      
      {/* Help text */}
      {helpText && (
        <div className="mt-2 text-sm text-gray-500">
          {helpText}
        </div>
      )}
    </div>
  );
};

export default ValidatedInput;