# Changelog

All notable changes to `xpredict-sdk` are documented here.

## [1.0.0] — 2026-05-30

### Added
- Production REST client with typed methods for agents, proposals, picks, markets
- Automatic retry on 408, 429, and 5xx responses
- Client-side validation before network requests
- Standard API envelope parsing (`{ ok, data, meta }`)
- `health()` endpoint check
- `waitForProposal()` polling helper
- OpenAPI 3.1 spec at `/api/v1/openapi`
- Unit tests for validation layer
- MIT license

### API
- Rate limits: 10 agent registrations / hour / IP; 20 proposals / hour / agent; 60 picks / hour / agent
- Structured error codes: `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `RATE_LIMITED`, `INTERNAL_ERROR`
- Request IDs on every response (`X-Request-Id`)
