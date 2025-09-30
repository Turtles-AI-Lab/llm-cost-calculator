/**
 * LLM Cost Calculator - Main Application
 */

// State management
const state = {
    inputTokens: 500,
    outputTokens: 500,
    requestsPerDay: 1000,
    days: 30,
    selectedProviders: Object.keys(LLM_PROVIDERS),
    results: []
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
    // Input listeners
    document.getElementById('inputTokens').addEventListener('input', (e) => {
        state.inputTokens = parseInt(e.target.value) || 0;
        updateSliderValue('inputTokens', state.inputTokens);
        calculate();
    });

    document.getElementById('outputTokens').addEventListener('input', (e) => {
        state.outputTokens = parseInt(e.target.value) || 0;
        updateSliderValue('outputTokens', state.outputTokens);
        calculate();
    });

    document.getElementById('requestsPerDay').addEventListener('input', (e) => {
        state.requestsPerDay = parseInt(e.target.value) || 0;
        updateSliderValue('requestsPerDay', state.requestsPerDay);
        calculate();
    });

    document.getElementById('days').addEventListener('change', (e) => {
        state.days = parseInt(e.target.value) || 30;
        calculate();
    });

    // Use case selector
    document.getElementById('useCase').addEventListener('change', (e) => {
        loadUseCase(e.target.value);
    });

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

        document.getElementById('inputTokens').value = state.inputTokens;
        document.getElementById('outputTokens').value = state.outputTokens;
        document.getElementById('requestsPerDay').value = state.requestsPerDay;

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

    for (const [id, provider] of Object.entries(LLM_PROVIDERS)) {
        const label = document.createElement('label');
        label.className = 'provider-filter';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = id;
        checkbox.checked = true;
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                state.selectedProviders.push(id);
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
        display.textContent = value.toLocaleString();
    }
}

/**
 * Calculate and display results
 */
function calculate() {
    // Get comparison results
    state.results = calculator.compareProviders(
        state.inputTokens,
        state.outputTokens,
        state.requestsPerDay,
        state.days,
        state.selectedProviders
    );

    // Display results
    displayResults(state.results);
    displaySummary(state.results);
}

/**
 * Display results table
 */
function displayResults(results) {
    const tbody = document.getElementById('resultsTable');
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

        row.innerHTML = `
            <td>
                <strong>${result.provider}</strong><br>
                <small>${result.model}</small>
                ${result.hardwareCost ? '<br><small class="hardware-cost">⚠️ Local hosting</small>' : ''}
            </td>
            <td>${calculator.formatCurrency(result.inputCost)}</td>
            <td>${calculator.formatCurrency(result.outputCost)}</td>
            <td><strong>${calculator.formatCurrency(result.totalCost)}</strong></td>
            <td>${calculator.formatCurrency(result.costPerRequest, 4)}</td>
            <td>${calculator.formatCurrency(calculator.calculateCostPer1K(result.costPerRequest))}</td>
            <td>${result.contextWindow.toLocaleString()}</td>
        `;

        tbody.appendChild(row);
    });
}

/**
 * Display summary statistics
 */
function displaySummary(results) {
    const container = document.getElementById('summary');

    if (results.length === 0) {
        container.innerHTML = '<p>Select at least one provider to see results</p>';
        return;
    }

    const cheapest = results[0];
    const mostExpensive = results[results.length - 1];
    const savings = calculator.calculateSavings(cheapest, mostExpensive);

    const annualCost = calculator.calculateAnnualCost(cheapest.totalCost);

    container.innerHTML = `
        <div class="summary-grid">
            <div class="summary-card">
                <h3>💰 Best Value</h3>
                <p class="big-number">${calculator.formatCurrency(cheapest.totalCost)}</p>
                <p>${cheapest.provider} - ${cheapest.model}</p>
            </div>

            <div class="summary-card">
                <h3>📊 Price Range</h3>
                <p class="big-number">${calculator.formatCurrency(cheapest.totalCost)} - ${calculator.formatCurrency(mostExpensive.totalCost)}</p>
                <p>Across ${results.length} models</p>
            </div>

            <div class="summary-card">
                <h3>💸 Potential Savings</h3>
                <p class="big-number">${calculator.formatCurrency(savings.savings)}</p>
                <p>${savings.percentSavings}% by choosing ${cheapest.model}</p>
            </div>

            <div class="summary-card">
                <h3>📅 Annual Cost (Lowest)</h3>
                <p class="big-number">${calculator.formatCurrency(annualCost)}</p>
                <p>Based on ${cheapest.model}</p>
            </div>
        </div>

        ${cheapest.hardwareCost ? `
            <div class="local-hosting-note">
                <strong>Note on Local Hosting:</strong> ${cheapest.model} requires ${cheapest.hardwareCost}.
                Factor in hardware costs, electricity (~$100-300/month), and maintenance when comparing to cloud APIs.
            </div>
        ` : ''}

        <div class="usage-stats">
            <p><strong>Usage Statistics:</strong></p>
            <ul>
                <li>Total Requests: ${cheapest.totalRequests.toLocaleString()}</li>
                <li>Total Input Tokens: ${cheapest.totalInputTokens.toLocaleString()}</li>
                <li>Total Output Tokens: ${cheapest.totalOutputTokens.toLocaleString()}</li>
                <li>Cost per Request: ${calculator.formatCurrency(cheapest.costPerRequest, 4)}</li>
            </ul>
        </div>
    `;
}
