/**
 * URL validation utilities
 */

export interface UrlValidationResult {
  isValid: boolean
  error?: string
  ariaLabel?: string
}

export function validateUrl(url: string): UrlValidationResult {
  if (!url) {
    return {
      isValid: false,
      error: 'URL is required',
      ariaLabel: 'URL is required',
    }
  }

  try {
    // Basic URL validation
    if (!/^https?:\/\//.test(url)) {
      return {
        isValid: false,
        error: 'URL must start with http:// or https://',
        ariaLabel: 'Invalid URL format. Must start with http:// or https://',
      }
    }

    // Check for valid domain structure
    const urlObj = new URL(url)

    // Check if domain has at least one dot and a valid TLD
    const domainParts = urlObj.hostname.split('.')
    if (domainParts.length < 2 || domainParts.some(part => !part)) {
      return {
        isValid: false,
        error: 'Please enter a valid domain name (e.g., example.com)',
        ariaLabel:
          'Invalid domain name. Please enter a valid domain like example.com',
      }
    }

    return {
      isValid: true,
      ariaLabel: 'URL is valid',
    }
  } catch {
    return {
      isValid: false,
      error: 'Please enter a valid URL (e.g., https://example.com)',
      ariaLabel:
        'Invalid URL format. Please enter a valid URL like https://example.com',
    }
  }
}

export function validateUrlOnBlur(url: string): UrlValidationResult {
  // More lenient validation for onBlur to avoid showing errors while typing
  if (!url) {
    return {
      isValid: false,
      error: 'URL is required',
      ariaLabel: 'URL is required',
    }
  }

  // Basic format check without being too strict
  try {
    // Check if it at least looks like a URL
    if (!/^https?:\/\//.test(url)) {
      return {
        isValid: false,
        error: 'URL must start with http:// or https://',
        ariaLabel: 'URL must start with http:// or https://',
      }
    }

    // Try to create a URL object to validate the format
    new URL(url)

    return {
      isValid: true,
      ariaLabel: 'URL format is valid',
    }
  } catch {
    return {
      isValid: false,
      error: 'Please enter a valid URL (e.g., https://example.com)',
      ariaLabel:
        'Invalid URL format. Please enter a valid URL like https://example.com',
    }
  }
}
