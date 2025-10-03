/**
 * LLM Cost Calculator Logic
 */

// Constants to replace magic numbers
const TOKENS_PER_MILLION = 1000000;
const CHAR_TO_TOKEN_RATIO = 4;
const WORD_TO_TOKEN_RATIO = 0.75;
const REQUESTS_PER_1K = 1000;
const DAYS_PER_YEAR = 365;
const BREAKEVEN_THRESHOLD_MONTHS = 24;

// Input bounds to prevent overflow and unreasonable values
const MAX_INPUT_TOKENS = 10000000; // 10 million
const MAX_OUTPUT_TOKENS = 10000000; // 10 million
const MAX_REQUESTS_PER_DAY = 100000000; // 100 million
const MAX_DAYS = 3650; // 10 years

class LLMCostCalculator {
    constructor() {
        this.providers = LLM_PROVIDERS;
        this.useCaseTemplates = USE_CASE_TEMPLATES;
    }

    /**
     * Calculate cost for a single model
     */
    calculateModelCost(provider, modelId, inputTokens, outputTokens, requestsPerDay, days = 30) {
        // Validate inputs
        if (typeof inputTokens !== 'number' || inputTokens < 0) {
            throw new Error('Invalid input: inputTokens must be a non-negative number');
        }
        if (typeof outputTokens !== 'number' || outputTokens < 0) {
            throw new Error('Invalid input: outputTokens must be a non-negative number');
        }
        if (typeof requestsPerDay !== 'number' || requestsPerDay < 0) {
            throw new Error('Invalid input: requestsPerDay must be a non-negative number');
        }
        if (typeof days !== 'number' || days <= 0) {
            throw new Error('Invalid input: days must be a positive number');
        }

        // Add bounds checking to prevent overflow
        if (inputTokens > MAX_INPUT_TOKENS) {
            throw new Error(`Input tokens exceed maximum of ${MAX_INPUT_TOKENS}`);
        }
        if (outputTokens > MAX_OUTPUT_TOKENS) {
            throw new Error(`Output tokens exceed maximum of ${MAX_OUTPUT_TOKENS}`);
        }
        if (requestsPerDay > MAX_REQUESTS_PER_DAY) {
            throw new Error(`Requests per day exceed maximum of ${MAX_REQUESTS_PER_DAY}`);
        }
        if (days > MAX_DAYS) {
            throw new Error(`Days exceed maximum of ${MAX_DAYS}`);
        }

        // Validate provider exists
        if (!this.providers[provider]) {
            throw new Error(`Provider ${provider} not found`);
        }

        const model = this.providers[provider].models[modelId];

        if (!model) {
            throw new Error(`Model ${modelId} not found for provider ${provider}`);
        }

        // Calculate tokens per period
        const totalInputTokens = inputTokens * requestsPerDay * days;
        const totalOutputTokens = outputTokens * requestsPerDay * days;

        // Convert to millions for pricing
        const inputMillions = totalInputTokens / TOKENS_PER_MILLION;
        const outputMillions = totalOutputTokens / TOKENS_PER_MILLION;

        // Calculate costs
        const inputCost = inputMillions * model.inputPrice;
        const outputCost = outputMillions * model.outputPrice;
        const totalCost = inputCost + outputCost;

        // Calculate per-request cost
        const totalRequests = requestsPerDay * days;
        const costPerRequest = totalRequests > 0 ? totalCost / totalRequests : 0;

        return {
            provider: this.providers[provider]?.name || provider,
            model: model.name,
            inputCost: inputCost,
            outputCost: outputCost,
            totalCost: totalCost,
            costPerRequest: costPerRequest,
            totalInputTokens: totalInputTokens,
            totalOutputTokens: totalOutputTokens,
            totalRequests: requestsPerDay * days,
            contextWindow: model.contextWindow,
            hardwareCost: model.hardwareCost || null
        };
    }

    /**
     * Compare costs across multiple providers/models
     */
    compareProviders(inputTokens, outputTokens, requestsPerDay, days = 30, selectedProviders = null) {
        const results = [];

        // Validate and sanitize inputs
        if (!Array.isArray(selectedProviders) && selectedProviders !== null) {
            console.error('Invalid selectedProviders: must be an array or null');
            selectedProviders = null;
        }

        // If no providers selected, use all
        const providersToCheck = selectedProviders || Object.keys(this.providers);

        // Ensure we have providers to check
        if (!providersToCheck || providersToCheck.length === 0) {
            console.warn('No providers to check');
            return results;
        }

        for (const providerId of providersToCheck) {
            const provider = this.providers[providerId];

            // Validate provider exists
            if (!provider) {
                console.error(`Provider ${providerId} not found`);
                continue;
            }

            // Ensure provider has models
            if (!provider.models || typeof provider.models !== 'object') {
                console.error(`Provider ${providerId} has no valid models`);
                continue;
            }

            for (const modelId in provider.models) {
                try {
                    const result = this.calculateModelCost(
                        providerId,
                        modelId,
                        inputTokens,
                        outputTokens,
                        requestsPerDay,
                        days
                    );
                    results.push({
                        providerId,
                        modelId,
                        ...result
                    });
                } catch (error) {
                    console.error(`Error calculating for ${providerId}/${modelId}:`, error);
                }
            }
        }

        // Sort by total cost with safe comparison
        results.sort((a, b) => {
            const costA = typeof a.totalCost === 'number' ? a.totalCost : 0;
            const costB = typeof b.totalCost === 'number' ? b.totalCost : 0;
            return costA - costB;
        });

        return results;
    }

    /**
     * Calculate savings between two models
     */
    calculateSavings(result1, result2) {
        // Validate inputs
        if (!result1 || !result2 || typeof result1.totalCost !== 'number' || typeof result2.totalCost !== 'number') {
            throw new Error('Invalid results: both results must have valid totalCost');
        }

        const costDiff = Math.abs(result1.totalCost - result2.totalCost);
        const maxCost = Math.max(result1.totalCost, result2.totalCost);

        // Fix division by zero bug
        const percentSavings = maxCost > 0 ? ((costDiff / maxCost) * 100).toFixed(2) : 0;

        return {
            savings: costDiff,
            percentSavings: parseFloat(percentSavings),
            cheaperModel: result1.totalCost < result2.totalCost ? result1.model : result2.model
        };
    }

    /**
     * Estimate tokens from text
     * Rough estimation: 1 token ≈ 4 characters or 0.75 words
     */
    estimateTokens(text) {
        if (!text || typeof text !== 'string') return 0;

        // Trim text to handle empty strings and whitespace
        const trimmedText = text.trim();
        if (trimmedText.length === 0) return 0;

        // Average of character-based and word-based estimates
        const charEstimate = trimmedText.length / CHAR_TO_TOKEN_RATIO;
        const words = trimmedText.split(/\s+/).filter(word => word.length > 0);
        const wordEstimate = words.length / WORD_TO_TOKEN_RATIO;

        return Math.round((charEstimate + wordEstimate) / 2);
    }

    /**
     * Get use case template
     */
    getUseCase(useCaseId) {
        return this.useCaseTemplates[useCaseId];
    }

    /**
     * Format currency
     */
    formatCurrency(amount, decimals = 2) {
        // Handle null/undefined/NaN values
        if (amount == null || isNaN(amount) || typeof amount !== 'number') {
            return '$0.00';
        }

        return `$${amount.toFixed(decimals)}`;
    }

    /**
     * Get model by provider and ID
     */
    getModel(provider, modelId) {
        // Validate inputs
        if (!provider || !modelId) {
            console.error('Invalid input: provider and modelId are required');
            return null;
        }

        return this.providers[provider]?.models[modelId] || null;
    }

    /**
     * Get all models for a provider
     */
    getProviderModels(providerId) {
        // Validate input
        if (!providerId) {
            console.error('Invalid input: providerId is required');
            return {};
        }

        return this.providers[providerId]?.models || {};
    }

    /**
     * Calculate annual cost from period cost
     */
    calculateAnnualCost(costForPeriod, days) {
        // Validate inputs
        if (typeof costForPeriod !== 'number' || typeof days !== 'number') {
            throw new Error('Invalid input: costForPeriod and days must be numbers');
        }

        // Convert to daily cost, then annualize
        if (days <= 0) return 0;
        const costPerDay = costForPeriod / days;
        return costPerDay * DAYS_PER_YEAR;
    }

    /**
     * Calculate cost per 1K requests
     */
    calculateCostPer1K(costPerRequest) {
        // Validate input
        if (typeof costPerRequest !== 'number' || isNaN(costPerRequest)) {
            console.error('Invalid input: costPerRequest must be a valid number');
            return 0;
        }

        return costPerRequest * REQUESTS_PER_1K;
    }

    /**
     * Estimate breakeven point for local hosting
     */
    estimateBreakeven(apiMonthlyCost, hardwareCost, monthlyOperatingCost = 200) {
        // Validate inputs
        if (typeof apiMonthlyCost !== 'number' || typeof hardwareCost !== 'number' || typeof monthlyOperatingCost !== 'number') {
            throw new Error('Invalid input: all parameters must be numbers');
        }

        // Validate inputs are non-negative
        if (apiMonthlyCost < 0 || hardwareCost < 0 || monthlyOperatingCost < 0) {
            throw new Error('Invalid input: costs cannot be negative');
        }

        // monthlyOperatingCost = electricity + maintenance
        const monthlySavings = apiMonthlyCost - monthlyOperatingCost;

        // Prevent infinite loop or unreasonable calculations
        let breakevenMonths;
        if (monthlySavings <= 0) {
            breakevenMonths = Infinity;
        } else {
            breakevenMonths = Math.ceil(hardwareCost / monthlySavings);
            // Cap at a reasonable maximum to prevent overflow
            if (breakevenMonths > 10000) {
                breakevenMonths = Infinity;
            }
        }

        return {
            breakevenMonths: breakevenMonths,
            monthlySavings: monthlySavings,
            worthIt: breakevenMonths !== Infinity && breakevenMonths <= BREAKEVEN_THRESHOLD_MONTHS
        };
    }
}

// Export for use in app
const calculator = new LLMCostCalculator();
