# Changelog

All notable changes to the LLM Cost Calculator project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-30

### Added
- Initial release of LLM Cost Calculator web application
- Support for 6 major LLM providers (OpenAI, Anthropic, Google, Azure, Mistral, Local)
- Compare 30+ models across all providers
- Real-time cost calculations in browser
- No backend required - fully client-side JavaScript
- 6 pre-configured use case templates:
  - Customer Support Chatbot
  - Document Analysis
  - Code Generation
  - Ticket Classification
  - Content Generation
  - Custom Use Case
- Interactive sliders for input/output tokens and requests per day
- Time period selection (1 day, 1 week, 1 month, 3 months, 1 year)
- Provider filtering to customize comparison
- Cost summary with best value, price range, and potential savings
- Detailed comparison table with all pricing breakdowns
- Per-request and per-1K request cost calculations
- Annual cost projections
- Context window information for each model
- Local hosting cost notes and considerations
- Mobile-friendly responsive design
- Professional UI with gradient summary cards
- Comprehensive documentation and README
- MIT License

### Providers & Models
**OpenAI:**
- GPT-4o, GPT-4o Mini, GPT-4 Turbo, GPT-4, GPT-3.5 Turbo

**Anthropic:**
- Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Sonnet, Claude 3 Haiku

**Google:**
- Gemini 1.5 Pro, Gemini 1.5 Flash, Gemini Pro

**Azure OpenAI:**
- GPT-4o, GPT-4 Turbo, GPT-3.5 Turbo

**Mistral AI:**
- Mistral Large, Mistral Medium, Mistral Small, Mistral Tiny

**Local/Self-Hosted:**
- Llama 3 70B, Llama 3 8B, Mixtral 8x7B, Custom models

### Features
- Zero installation required
- Privacy-first (all calculations client-side)
- Instant results
- Easy to customize and extend
- Clean, modern UI
- Educational tooltips and guidance
- Pricing data sourced from official provider documentation (January 2025)

[1.0.0]: https://github.com/Turtles-AI-Lab/llm-cost-calculator/releases/tag/v1.0.0
