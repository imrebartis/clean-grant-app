import { validateUrl, validateUrlOnBlur } from '../url-validation'

describe('URL Validation', () => {
  describe('validateUrl', () => {
    it('should return invalid for empty string', () => {
      const result = validateUrl('')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('URL is required')
    })

    it('should return invalid for URL without protocol', () => {
      const result = validateUrl('example.com')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('must start with http:// or https://')
    })

    it('should return invalid for URL with invalid format', () => {
      const result = validateUrl('https://example')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('valid domain name')
    })

    it('should return valid for correct URL', () => {
      const urls = [
        'https://example.com',
        'http://example.co.uk',
        'https://sub.example.com/path?query=param',
        'https://example.com:8080/path',
      ]

      urls.forEach(url => {
        const result = validateUrl(url)
        expect(result.isValid).toBe(true)
        expect(result.error).toBeUndefined()
      })
    })
  })

  describe('validateUrlOnBlur', () => {
    it('should be more lenient than validateUrl', () => {
      const result = validateUrlOnBlur('https://example')
      expect(result.isValid).toBe(true)
    })

    it('should still require protocol', () => {
      const result = validateUrlOnBlur('example.com')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('must start with http:// or https://')
    })
  })
})
