# Security Policy

## Supported Versions

We support security updates for the following versions of Omniscript:

| Version | Supported          |
| ------- | ------------------ |
| 2.x.x   | :white_check_mark: |
| 1.x.x   | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability in Omniscript, please report it responsibly.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities to:

- **Email**: [Create an issue with the "security" label](https://github.com/RyAnPr1Me/Omniscript/issues/new?labels=security&template=security.md)
- For critical vulnerabilities, contact the maintainers directly through GitHub

### What to Include

Please include the following information in your report:

- A description of the vulnerability
- Steps to reproduce the issue
- Potential impact and severity
- Any proof-of-concept code (if applicable)
- Your contact information for follow-up

### Response Timeline

- **Initial Response**: We will acknowledge receipt of your report within 48 hours
- **Investigation**: We will investigate and validate the vulnerability within 5 business days
- **Resolution**: We will work to resolve critical vulnerabilities within 30 days
- **Disclosure**: We will coordinate with you on responsible disclosure timing

### Security Best Practices

When using Omniscript in production:

1. **Keep Updated**: Always use the latest stable version
2. **Input Validation**: Validate all user inputs in your applications
3. **Dependency Management**: Regularly update dependencies using `npm audit`
4. **Code Review**: Review all code before deployment
5. **Environment Security**: Secure your runtime environment appropriately

## Security Features

Omniscript includes several built-in security features:

- **Type Safety**: Strong typing helps prevent common vulnerabilities
- **Sandboxed Execution**: Runtime sandboxing for untrusted code
- **Input Validation**: Built-in validation utilities
- **Secure Defaults**: Safe default configurations

## Known Security Considerations

- Be cautious when using `@unsafe` annotations
- Validate all database queries to prevent injection attacks
- Use proper authentication and authorization in web applications
- Follow secure coding practices when handling sensitive data

## Bug Bounty

We currently do not offer a formal bug bounty program, but we appreciate responsible disclosure and will acknowledge security researchers who help improve Omniscript's security.
