# Contributing to LLM Cost Calculator

Thank you for your interest in contributing to LLM Cost Calculator! We welcome contributions from the community.

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue on GitHub with:
- A clear, descriptive title
- Steps to reproduce the problem
- Expected behavior vs actual behavior
- Browser and OS details
- Screenshots if applicable

### Updating Pricing Data

**This is the #1 way to contribute!** LLM pricing changes frequently.

To update pricing:

1. **Verify official pricing** from provider websites:
   - [OpenAI Pricing](https://openai.com/pricing)
   - [Anthropic Pricing](https://www.anthropic.com/pricing)
   - [Google AI Pricing](https://ai.google.dev/pricing)
   - [Azure OpenAI Pricing](https://azure.microsoft.com/pricing/details/cognitive-services/openai-service/)
   - [Mistral Pricing](https://mistral.ai/technology/#pricing)

2. **Update** `js/providers.js`:
   ```javascript
   "model-name": {
       name: "Model Display Name",
       inputPrice: X.XX,   // per 1M tokens
       outputPrice: X.XX,  // per 1M tokens
       contextWindow: XXXXX
   }
   ```

3. **Test** by opening `index.html` in a browser
4. **Submit PR** with pricing source links

### Adding New Providers

To add a new LLM provider:

1. Add to `js/providers.js`:
   ```javascript
   newProvider: {
       name: "Provider Name",
       models: {
           "model-id": {
               name: "Model Name",
               inputPrice: X.XX,
               outputPrice: X.XX,
               contextWindow: XXXXX
           }
       }
   }
   ```

2. Update provider filters in `js/app.js` (auto-generates from providers.js)

### Adding New Models

Add models to existing providers in `js/providers.js`:

```javascript
"new-model-id": {
    name: "New Model Name",
    inputPrice: X.XX,
    outputPrice: X.XX,
    contextWindow: XXXXX
}
```

### Adding Use Case Templates

Add templates to `js/providers.js`:

```javascript
const USE_CASE_TEMPLATES = {
    myUseCase: {
        name: "My Use Case Name",
        avgInputTokens: 500,
        avgOutputTokens: 500,
        requestsPerDay: 1000
    }
};
```

## Development Guidelines

### Code Style
- Use clear, descriptive variable names
- Add comments for complex logic
- Keep functions focused and modular
- Follow existing code patterns

### Testing

Before submitting changes:

1. **Open** `index.html` in multiple browsers:
   - Chrome/Edge
   - Firefox
   - Safari (if available)

2. **Test** all features:
   - Provider filtering
   - Use case templates
   - Slider adjustments
   - Cost calculations
   - Responsive design (mobile view)

3. **Verify** calculations are accurate:
   - Spot-check against provider calculators
   - Test edge cases (very low/high values)

### File Structure

```
llm-cost-calculator/
├── index.html          # Main page structure
├── css/
│   └── style.css      # All styles
├── js/
│   ├── providers.js   # Provider data
│   ├── calculator.js  # Cost calculation logic
│   └── app.js         # UI interactions
├── README.md
└── LICENSE
```

## Pull Request Process

1. **Fork** the repository
2. **Create** a branch (`git checkout -b feature/amazing-feature`)
3. **Make** your changes
4. **Test** thoroughly
5. **Update** documentation if needed
6. **Update** CHANGELOG.md
7. **Commit** with clear messages
8. **Push** to your fork
9. **Open** a Pull Request

### PR Guidelines

- Reference any related issues
- Include screenshots for UI changes
- Provide pricing source links for pricing updates
- Keep changes focused (one feature/fix per PR)

## Areas Where We Need Help

### High Priority
- 🔥 **Pricing updates** - Verify and update current pricing
- 🆕 **New providers** - Add emerging LLM providers
- 🌍 **Internationalization** - Multi-language support

### Medium Priority
- 📱 **Mobile UX** - Improve mobile experience
- 📊 **Charts** - Add visual cost comparison charts
- 💾 **Save/Share** - Save configurations or share links
- 🔍 **Search** - Search/filter models
- 📈 **Trends** - Historical pricing data

### Nice to Have
- 🎨 **Themes** - Dark mode, custom themes
- 📋 **Export** - Export results to CSV/PDF
- 🔔 **Alerts** - Price change notifications
- 🧮 **Advanced** - Batch size optimization, caching strategies

## Community

- **Issues:** [GitHub Issues](https://github.com/Turtles-AI-Lab/llm-cost-calculator/issues)
- **Discussions:** Use Issues for feature discussions
- **Contact:** jgreenia@jandraisolutions.com

## Code of Conduct

### Our Standards
- Be respectful and welcoming
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards others

### Not Acceptable
- Harassment or discriminatory behavior
- Trolling, insulting comments
- Personal or political attacks
- Publishing others' private information without permission

## Pricing Data Accuracy

We strive for accuracy, but pricing changes frequently. By contributing:

- You confirm pricing data is from official sources
- You provide source links when updating pricing
- You understand this is community-maintained

**Disclaimer:** Always verify pricing with official provider documentation before making business decisions.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be acknowledged in the README (unless you prefer not to be listed).

## Questions?

Open an issue or contact us at jgreenia@jandraisolutions.com

Thank you for making LLM Cost Calculator better! 🚀
