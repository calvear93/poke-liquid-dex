# Security Review Prompt

Review the security aspects of [COMPONENT] and ensure:

1. Proper input validation using Zod schemas
2. XSS prevention through proper React patterns
3. Secure handling of sensitive data in client-side code
4. Protection against common frontend vulnerabilities
5. Proper error handling without information leakage
6. Content Security Policy implementation
7. HTTPS enforcement in production
8. Environment variable usage for configuration (no secrets in client code)
9. Proper form validation and sanitization
10. Following OWASP security guidelines for SPAs

## Focus on:

- Client-side data validation
- Input sanitization and XSS prevention
- Error message security
- Data exposure prevention
- Authentication state management

## Security Areas:

### Input Validation:

- All user inputs validated with Zod schemas
- XSS prevention through React's built-in escaping
- Never use `dangerouslySetInnerHTML` (`react/no-danger` is enforced as an error)
- Form validation on both client and server side

### Authentication & State Management:

- Secure token storage (httpOnly cookies vs localStorage)
- Proper session management
- Authentication state protection
- Protected routes implementation

### Data Protection:

- No secrets or sensitive data in client-side code; keep `import.meta.env` access centralized in the bootstrap/config layer and inject config via the IoC container (`useInjection`) — never hardcode
- Secure data transmission over HTTPS
- Proper handling of user input
- PII protection and data privacy

### Error Handling:

- No sensitive information in error messages
- Proper client-side error logging
- Graceful error boundaries
- User-friendly error messages

### Content Security:

- Content Security Policy (CSP) implementation
- Avoiding inline scripts and styles
- Trusted sources for external resources
- Subresource Integrity for CDN resources

## Security Checklist:

- [ ] Input validation with Zod schemas implemented
- [ ] XSS prevention through React patterns verified
- [ ] No sensitive data exposed in client-side code
- [ ] Error messages don't leak information
- [ ] Environment variables used correctly (no secrets)
- [ ] HTTPS enforced in production
- [ ] Content Security Policy configured
- [ ] Authentication state properly managed
- [ ] Form validation on both client and server
- [ ] OWASP guidelines for SPAs followed
- [ ] Security headers configured
