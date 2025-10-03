/**
 * LLM Cost Calculator - Main Application
 */

// State management with defensive copy to prevent mutation issues
const state = {
    inputTokens: 500,
    outputTokens: 500,
    requestsPerDay: 1000,
    days: 30,
    selectedProviders: [...Object.keys(LLM_PROVIDERS)],
    results: [],
    _isCalculating: false // Flag to prevent concurrent calculations
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeUI();
    loadUseCaseTemplates();
    calculate();
});

/**
 * Initialize UI elements
 */
function initializeUI() {
    // Input listeners with null checks
    const inputTokensEl = document.getElementById('inputTokens');
    if (inputTokensEl) {
        inputTokensEl.addEventListener('input', (e) => {
            const value = parseInt(e.target.value, 10) || 0;
            // Validate and clamp to non-negative values
            state.inputTokens = Math.max(0, value);
            updateSliderValue('inputTokens', state.inputTokens);
            calculate();
        });
    }

    const outputTokensEl = document.getElementById('outputTokens');
    if (outputTokensEl) {
        outputTokensEl.addEventListener('input', (e) => {
            const value = parseInt(e.target.value, 10) || 0;
            // Validate and clamp to non-negative values
            state.outputTokens = Math.max(0, value);
            updateSliderValue('outputTokens', state.outputTokens);
            calculate();
        });
    }

    const requestsPerDayEl = document.getElementById('requestsPerDay');
    if (requestsPerDayEl) {
        requestsPerDayEl.addEventListener('input', (e) => {
            const value = parseInt(e.target.value, 10) || 0;
            // Validate and clamp to non-negative values
            state.requestsPerDay = Math.max(0, value);
            updateSliderValue('requestsPerDay', state.requestsPerDay);
            calculate();
        });
    }

    const daysEl = document.getElementById('days');
    if (daysEl) {
        daysEl.addEventListener('change', (e) => {
            const value = parseInt(e.target.value, 10) || 30;
            // Validate and clamp to positive values (at least 1 day)
            state.days = Math.max(1, value);
            calculate();
        });
    }

    // Use case selector
    const useCaseEl = document.getElementById('useCase');
    if (useCaseEl) {
        useCaseEl.addEventListener('change', (e) => {
            loadUseCase(e.target.value);
        });
    }

    // Provider checkboxes
    loadProviderFilters();

    // Set initial values
    updateSliderValue('inputTokens', state.inputTokens);
    updateSliderValue('outputTokens', state.outputTokens);
    updateSliderValue('requestsPerDay', state.requestsPerDay);
}

/**
 * Load use case templates into dropdown
 */
function loadUseCaseTemplates() {
    const select = document.getElementById('useCase');

    if (!select) {
        console.error('Use case select element not found');
        return;
    }

    for (const [id, template] of Object.entries(USE_CASE_TEMPLATES)) {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = template.name;
        select.appendChild(option);
    }
}

/**
 * Load a use case template
 */
function loadUseCase(useCaseId) {
    const useCase = calculator.getUseCase(useCaseId);

    if (useCase) {
        state.inputTokens = useCase.avgInputTokens;
        state.outputTokens = useCase.avgOutputTokens;
        state.requestsPerDay = useCase.requestsPerDay;

        const inputTokensEl = document.getElementById('inputTokens');
        const outputTokensEl = document.getElementById('outputTokens');
        const requestsPerDayEl = document.getElementById('requestsPerDay');

        if (inputTokensEl) inputTokensEl.value = state.inputTokens;
        if (outputTokensEl) outputTokensEl.value = state.outputTokens;
        if (requestsPerDayEl) requestsPerDayEl.value = state.requestsPerDay;

        updateSliderValue('inputTokens', state.inputTokens);
        updateSliderValue('outputTokens', state.outputTokens);
        updateSliderValue('requestsPerDay', state.requestsPerDay);

        calculate();
    }
}

/**
 * Load provider filter checkboxes
 */
function loadProviderFilters() {
    const container = document.getElementById('providerFilters');

    if (!container) {
        console.error('Provider filters container not found');
        return;
    }

    for (const [id, provider] of Object.entries(LLM_PROVIDERS)) {
        const label = document.createElement('label');
        label.className = 'provider-filter';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = id;
        checkbox.checked = true;
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                // Prevent duplicates in selectedProviders array
                if (!state.selectedProviders.includes(id)) {
                    state.selectedProviders.push(id);
                }
            } else {
                state.selectedProviders = state.selectedProviders.filter(p => p !== id);
            }
            calculate();
        });

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(` ${provider.name}`));
        container.appendChild(label);
    }
}

/**
 * Update slider value display
 */
function updateSliderValue(id, value) {
    const display = document.getElementById(`${id}Value`);
    if (display) {
        try {
            // Safe toLocaleString with fallback
            display.textContent = (typeof value === 'number' && !isNaN(value)) ? value.toLocaleString() : '0';
        } catch (error) {
            console.error('Error formatting number:', error);
            display.textContent = String(value || '0');
        }
    }
}

/**
 * Calculate and display results
 */
function calculate() {
    // Prevent concurrent calculations (race condition fix)
    if (state._isCalculating) {
        return;
    }

    state._isCalculating = true;

    try {
        // Create defensive copy of selectedProviders to prevent mutation
        const providersToUse = [...state.selectedProviders];

        // Get comparison results
        state.results = calculator.compareProviders(
            state.inputTokens,
            state.outputTokens,
            state.requestsPerDay,
            state.days,
            providersToUse
        );

        // Display results
        displayResults(state.results);
        displaySummary(state.results);
    } catch (error) {
        console.error('Error calculating results:', error);
        // Display error to user
        const tbody = document.getElementById('resultsTable');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: red;">Error calculating results. Please check your inputs.</td></tr>';
        }
    } finally {
        state._isCalculating = false;
    }
}

/**
 * Display results table
 */
function displayResults(results) {
    const tbody = document.getElementById('resultsTable');

    if (!tbody) {
        console.error('Results table body not found');
        return;
    }

    tbody.innerHTML = '';

    if (results.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No providers selected</td></tr>';
        return;
    }

    results.forEach((result, index) => {
        const row = document.createElement('tr');
        if (index === 0) {
            row.classList.add('best-value');
        }

        // Create cells safely using textContent/createElement to prevent XSS
        const providerCell = document.createElement('td');
        const providerStrong = document.createElement('strong');
        providerStrong.textContent = result.provider;
        providerCell.appendChild(providerStrong);
        providerCell.appendChild(document.createElement('br'));
        const modelSmall = document.createElement('small');
        modelSmall.textContent = result.model;
        providerCell.appendChild(modelSmall);
        if (result.hardwareCost) {
            providerCell.appendChild(document.createElement('br'));
            const hardwareSmall = document.createElement('small');
            hardwareSmall.className = 'hardware-cost';
            hardwareSmall.textContent = '⚠️ Local hosting';
            providerCell.appendChild(hardwareSmall);
        }

        const inputCostCell = document.createElement('td');
        inputCostCell.textContent = calculator.formatCurrency(result.inputCost);

        const outputCostCell = document.createElement('td');
        outputCostCell.textContent = calculator.formatCurrency(result.outputCost);

        const totalCostCell = document.createElement('td');
        const totalCostStrong = document.createElement('strong');
        totalCostStrong.textContent = calculator.formatCurrency(result.totalCost);
        totalCostCell.appendChild(totalCostStrong);

        const costPerRequestCell = document.createElement('td');
        costPerRequestCell.textContent = calculator.formatCurrency(result.costPerRequest, 4);

        const costPer1KCell = document.createElement('td');
        costPer1KCell.textContent = calculator.formatCurrency(calculator.calculateCostPer1K(result.costPerRequest));

        const contextWindowCell = document.createElement('td');
        // Safe access to contextWindow with fallback
        const contextWindow = (result.contextWindow && typeof result.contextWindow === 'number')
            ? result.contextWindow
            : 0;
        contextWindowCell.textContent = contextWindow.toLocaleString();

        row.appendChild(providerCell);
        row.appendChild(inputCostCell);
        row.appendChild(outputCostCell);
        row.appendChild(totalCostCell);
        row.appendChild(costPerRequestCell);
        row.appendChild(costPer1KCell);
        row.appendChild(contextWindowCell);

        tbody.appendChild(row);
    });
}

/**
 * Display summary statistics
 */
function displaySummary(results) {
    const container = document.getElementById('summary');

    if (!container) {
        console.error('Summary container not found');
        return;
    }

    // Clear previous content
    container.innerHTML = '';

    if (results.length === 0) {
        const message = document.createElement('p');
        message.textContent = 'Select at least one provider to see results';
        container.appendChild(message);
        return;
    }

    // Array bounds check - ensure we have at least one result
    if (!results[0]) {
        console.error('No results available');
        return;
    }

    const cheapest = results[0];
    const mostExpensive = results[results.length - 1] || cheapest;
    const savings = calculator.calculateSavings(cheapest, mostExpensive);

    const annualCost = calculator.calculateAnnualCost(cheapest.totalCost, state.days);

    // Create summary grid using DOM methods to prevent XSS
    const summaryGrid = document.createElement('div');
    summaryGrid.className = 'summary-grid';

    // Best Value card
    const bestValueCard = createSummaryCard('💰 Best Value',
        calculator.formatCurrency(cheapest.totalCost),
        `${cheapest.provider} - ${cheapest.model}`);
    summaryGrid.appendChild(bestValueCard);

    // Price Range card
    const priceRangeCard = createSummaryCard('📊 Price Range',
        `${calculator.formatCurrency(cheapest.totalCost)} - ${calculator.formatCurrency(mostExpensive.totalCost)}`,
        `Across ${results.length} models`);
    summaryGrid.appendChild(priceRangeCard);

    // Potential Savings card
    const savingsCard = createSummaryCard('💸 Potential Savings',
        calculator.formatCurrency(savings.savings),
        `${savings.percentSavings}% by choosing ${cheapest.model}`);
    summaryGrid.appendChild(savingsCard);

    // Annual Cost card
    const annualCostCard = createSummaryCard('📅 Annual Cost (Lowest)',
        calculator.formatCurrency(annualCost),
        `Based on ${cheapest.model}`);
    summaryGrid.appendChild(annualCostCard);

    container.appendChild(summaryGrid);

    // Add hardware cost note if applicable
    if (cheapest.hardwareCost) {
        const hostingNote = document.createElement('div');
        hostingNote.className = 'local-hosting-note';

        const noteTitle = document.createElement('strong');
        noteTitle.textContent = 'Note on Local Hosting: ';
        hostingNote.appendChild(noteTitle);

        const noteText = document.createTextNode(`${cheapest.model} requires ${cheapest.hardwareCost}. Factor in hardware costs, electricity (~$100-300/month), and maintenance when comparing to cloud APIs.`);
        hostingNote.appendChild(noteText);

        container.appendChild(hostingNote);
    }

    // Add usage stats
    const usageStats = document.createElement('div');
    usageStats.className = 'usage-stats';

    const statsTitle = document.createElement('p');
    const statsTitleStrong = document.createElement('strong');
    statsTitleStrong.textContent = 'Usage Statistics:';
    statsTitle.appendChild(statsTitleStrong);
    usageStats.appendChild(statsTitle);

    const statsList = document.createElement('ul');

    const stats = [
        { label: 'Total Requests', value: cheapest.totalRequests.toLocaleString() },
        { label: 'Total Input Tokens', value: cheapest.totalInputTokens.toLocaleString() },
        { label: 'Total Output Tokens', value: cheapest.totalOutputTokens.toLocaleString() },
        { label: 'Cost per Request', value: calculator.formatCurrency(cheapest.costPerRequest, 4) }
    ];

    stats.forEach(stat => {
        const li = document.createElement('li');
        li.textContent = `${stat.label}: ${stat.value}`;
        statsList.appendChild(li);
    });

    usageStats.appendChild(statsList);
    container.appendChild(usageStats);
}

/**
 * Helper function to create summary cards safely
 */
function createSummaryCard(title, bigNumber, description) {
    const card = document.createElement('div');
    card.className = 'summary-card';

    const h3 = document.createElement('h3');
    h3.textContent = title;
    card.appendChild(h3);

    const bigNumberP = document.createElement('p');
    bigNumberP.className = 'big-number';
    bigNumberP.textContent = bigNumber;
    card.appendChild(bigNumberP);

    const descP = document.createElement('p');
    descP.textContent = description;
    card.appendChild(descP);

    return card;
}
