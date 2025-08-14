const { resolve } = require('path');
const { existsSync } = require('fs');

module.exports = (request, options) => {
  // Default Jest resolver
  const defaultResolver = options.defaultResolver;
  
  try {
    // Try the default resolution first
    return defaultResolver(request, options);
  } catch (error) {
    // If it fails and the request ends with .js, try .ts
    if (request.endsWith('.js')) {
      const tsRequest = request.replace(/\.js$/, '.ts');
      try {
        return defaultResolver(tsRequest, options);
      } catch (tsError) {
        // If .ts also fails, try without extension (let Jest handle it)
        const noExtRequest = request.replace(/\.js$/, '');
        try {
          return defaultResolver(noExtRequest, options);
        } catch (noExtError) {
          // If all fail, throw the original error
          throw error;
        }
      }
    }
    
    // For non-.js requests that fail, throw the original error
    throw error;
  }
};

