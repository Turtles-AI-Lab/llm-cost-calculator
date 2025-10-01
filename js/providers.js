/**
 * LLM Provider Pricing Data
 * Prices in USD per 1M tokens (updated September 2025)
 */

const LLM_PROVIDERS = {
    openai: {
        name: "OpenAI",
        models: {
            "gpt-4o": {
                name: "GPT-4o",
                inputPrice: 2.50,
                outputPrice: 10.00,
                contextWindow: 128000
            },
            "gpt-4o-mini": {
                name: "GPT-4o Mini",
                inputPrice: 0.150,
                outputPrice: 0.600,
                contextWindow: 128000
            },
            "gpt-4-turbo": {
                name: "GPT-4 Turbo",
                inputPrice: 10.00,
                outputPrice: 30.00,
                contextWindow: 128000
            },
            "gpt-4": {
                name: "GPT-4",
                inputPrice: 30.00,
                outputPrice: 60.00,
                contextWindow: 8192
            },
            "gpt-3.5-turbo": {
                name: "GPT-3.5 Turbo",
                inputPrice: 0.50,
                outputPrice: 1.50,
                contextWindow: 16385
            }
        }
    },

    anthropic: {
        name: "Anthropic",
        models: {
            "claude-sonnet-4.5": {
                name: "Claude Sonnet 4.5",
                inputPrice: 3.00,
                outputPrice: 15.00,
                contextWindow: 200000
            },
            "claude-3.5-sonnet": {
                name: "Claude 3.5 Sonnet",
                inputPrice: 3.00,
                outputPrice: 15.00,
                contextWindow: 200000
            },
            "claude-3-opus": {
                name: "Claude 3 Opus",
                inputPrice: 15.00,
                outputPrice: 75.00,
                contextWindow: 200000
            },
            "claude-3-sonnet": {
                name: "Claude 3 Sonnet",
                inputPrice: 3.00,
                outputPrice: 15.00,
                contextWindow: 200000
            },
            "claude-3-haiku": {
                name: "Claude 3 Haiku",
                inputPrice: 0.25,
                outputPrice: 1.25,
                contextWindow: 200000
            }
        }
    },

    google: {
        name: "Google",
        models: {
            "gemini-1.5-pro": {
                name: "Gemini 1.5 Pro",
                inputPrice: 1.25,
                outputPrice: 5.00,
                contextWindow: 2000000
            },
            "gemini-1.5-flash": {
                name: "Gemini 1.5 Flash",
                inputPrice: 0.075,
                outputPrice: 0.30,
                contextWindow: 1000000
            },
            "gemini-pro": {
                name: "Gemini Pro",
                inputPrice: 0.50,
                outputPrice: 1.50,
                contextWindow: 32000
            }
        }
    },

    azure: {
        name: "Azure OpenAI",
        models: {
            "gpt-4o": {
                name: "GPT-4o (Azure)",
                inputPrice: 5.00,
                outputPrice: 15.00,
                contextWindow: 128000
            },
            "gpt-4-turbo": {
                name: "GPT-4 Turbo (Azure)",
                inputPrice: 10.00,
                outputPrice: 30.00,
                contextWindow: 128000
            },
            "gpt-35-turbo": {
                name: "GPT-3.5 Turbo (Azure)",
                inputPrice: 0.50,
                outputPrice: 1.50,
                contextWindow: 16385
            }
        }
    },

    mistral: {
        name: "Mistral AI",
        models: {
            "mistral-large": {
                name: "Mistral Large 24B",
                inputPrice: 2.00,
                outputPrice: 6.00,
                contextWindow: 32000
            },
            "mistral-medium": {
                name: "Mistral Medium",
                inputPrice: 0.40,
                outputPrice: 2.00,
                contextWindow: 32000
            }
        }
    },

    local: {
        name: "Local/Self-Hosted",
        models: {
            "llama-3-70b": {
                name: "Llama 3 70B (Local)",
                inputPrice: 0,
                outputPrice: 0,
                contextWindow: 8192,
                hardwareCost: "Requires 2x A100 GPUs (~$20k+ investment)"
            },
            "llama-3-8b": {
                name: "Llama 3 8B (Local)",
                inputPrice: 0,
                outputPrice: 0,
                contextWindow: 8192,
                hardwareCost: "Runs on consumer GPU (~$1-2k)"
            },
            "mixtral-8x7b": {
                name: "Mixtral 8x7B (Local)",
                inputPrice: 0,
                outputPrice: 0,
                contextWindow: 32000,
                hardwareCost: "Requires high-end GPU (~$3-5k)"
            },
            "custom": {
                name: "Custom Local Model",
                inputPrice: 0,
                outputPrice: 0,
                contextWindow: 8192,
                hardwareCost: "Varies by model size"
            }
        }
    }
};

// Use case templates
const USE_CASE_TEMPLATES = {
    chatbot: {
        name: "Customer Support Chatbot",
        avgInputTokens: 500,
        avgOutputTokens: 200,
        requestsPerDay: 1000
    },
    documentAnalysis: {
        name: "Document Analysis",
        avgInputTokens: 3000,
        avgOutputTokens: 500,
        requestsPerDay: 100
    },
    codeGeneration: {
        name: "Code Generation",
        avgInputTokens: 800,
        avgOutputTokens: 600,
        requestsPerDay: 500
    },
    ticketClassification: {
        name: "Ticket Classification",
        avgInputTokens: 300,
        avgOutputTokens: 100,
        requestsPerDay: 5000
    },
    contentGeneration: {
        name: "Content Generation",
        avgInputTokens: 500,
        avgOutputTokens: 1000,
        requestsPerDay: 200
    },
    custom: {
        name: "Custom Use Case",
        avgInputTokens: 500,
        avgOutputTokens: 500,
        requestsPerDay: 1000
    }
};
