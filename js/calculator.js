/**
 * LLM Cost Calculator Logic
 */

class LLMCostCalculator {
    constructor() {
        this.providers = LLM_PROVIDERS;
        this.useCaseTemplates = USE_CASE_TEMPLATES;
    }

    /**
     * Calculate cost for a single model
     */
    calculateModelCost(provider, modelId, inputTokens, outputTokens, requestsPerDay, days = 30) {
        const model = this.providers[provider].models[modelId];

        if (!model) {
            throw new Error(`Model ${modelId} not found for provider ${provider}`);
        }

        // Calculate tokens per period
        const totalInputTokens = inputTokens * requestsPerDay * days;
        const totalOutputTokens = outputTokens * requestsPerDay * days;

        // Convert to millions for pricing
        const inputMillions = totalInputTokens / 1000000;
        const outputMillions = totalOutputTokens / 1000000;

        // Calculate costs
        const inputCost = inputMillions * model.inputPrice;
        const outputCost = outputMillions * model.outputPrice;
        const totalCost = inputCost + outputCost;

        // Calculate per-request cost
        const costPerRequest = totalCost / (requestsPerDay * days);

        return {
            provider: this.providers[provider].name,
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

        // If no providers selected, use all
        const providersToCheck = selectedProviders || Object.keys(this.providers);

        for (const providerId of providersToCheck) {
            const provider = this.providers[providerId];

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

        // Sort by total cost
        results.sort((a, b) => a.totalCost - b.totalCost);

        return results;
    }

    /**
     * Calculate savings between two models
     */
    calculateSavings(result1, result2) {
        const costDiff = Math.abs(result1.totalCost - result2.totalCost);
        const percentSavings = ((costDiff / Math.max(result1.totalCost, result2.totalCost)) * 100).toFixed(2);

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
        if (!text) return 0;

        // Average of character-based and word-based estimates
        const charEstimate = text.length / 4;
        const wordEstimate = text.split(/\s+/).length / 0.75;

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
        return `$${amount.toFixed(decimals)}`;
    }

    /**
     * Get model by provider and ID
     */
    getModel(provider, modelId) {
        return this.providers[provider]?.models[modelId];
    }

    /**
     * Get all models for a provider
     */
    getProviderModels(providerId) {
        return this.providers[providerId]?.models || {};
    }

    /**
     * Calculate annual cost
     */
    calculateAnnualCost(monthlyCost) {
        return monthlyCost * 12;
    }

    /**
     * Calculate cost per 1K requests
     */
    calculateCostPer1K(costPerRequest) {
        return costPerRequest * 1000;
    }

    /**
     * Estimate breakeven point for local hosting
     */
    estimateBreakeven(apiMonthlyCost, hardwareCost, monthlyOperatingCost = 200) {
        // monthlyOperatingCost = electricity + maintenance
        const monthlySavings = apiMonthlyCost - monthlyOperatingCost;
        const breakevenMonths = hardwareCost / monthlySavings;

        return {
            breakevenMonths: Math.ceil(breakevenMonths),
            monthlySavings: monthlySavings,
            worthIt: breakevenMonths <= 24 // 2 years or less
        };
    }
}

// Export for use in app
const calculator = new LLMCostCalculator();
