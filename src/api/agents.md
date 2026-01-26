# 🧠 Agent Memory: API Layer

## ⚠️ Critical Lessons

_This file stores project-specific knowledge, conventions, and lessons learned for the API directory._

## 📌 Standards

- All API calls must use a centralized API client wrapper
- Error handling must be consistent across all endpoints
- Request/response types must be defined using TypeScript interfaces

## 🔒 Security

- Never log full request bodies in error handlers
- Always validate input data before sending to API
- Use environment variables for API endpoints (never hardcode)

## 🔧 Conventions

- API functions should be named with the HTTP method prefix (e.g., `getUser`, `createUser`, `updateUser`)
- Place API types in a `types.ts` file
- Use async/await for all API calls

## 📝 Notes

_Add date-stamped entries here as you encounter issues or establish patterns:_

```
Example format:
- **2026-01-26:** The fetch wrapper does not automatically parse 204 No Content. Check status before res.json().
- **2026-01-26:** Auth tokens must be passed in the header X-Strata-Auth, NOT Authorization.
```
