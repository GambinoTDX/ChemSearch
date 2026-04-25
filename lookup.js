
let lookupChart;

function initLookupChart() {
    const lookupChartCanvas = document.getElementById('lookupChart');
    if (!lookupChartCanvas) return;
    
    const lookupCtx = lookupChartCanvas.getContext('2d');
    lookupChart = new Chart(lookupCtx, {
        type: 'line',
        data: {
            labels: Array.from({length: 11}, (_, i) => i * 10),
            datasets: []
        },
        options: {
            responsive: true,
            elements: {
                line: {
                    tension: 0.75,
                    borderJoinStyle: 'round'
                }
            },
            cubicInterpolationMode: 'monotone',
            scales: {
                x: {
                    min: 0,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    }
                },
                y: {
                    min: 0,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Solubility (g/100g water)'
                    }
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initLookupChart();

    const lookupBtn = document.getElementById('lookupBtn');
    if (lookupBtn) {
        lookupBtn.addEventListener('click', () => {
            const query = document.getElementById('lookupInput').value.trim();
            const output = document.getElementById('lookupOutput');
            if (!query) {
                output.innerHTML = '<p>Please enter an element symbol, name, or formula.</p>';
                return;
            }

            const app = new main();
            const info = app.getElementInfo(query, elementData);
            if (info.type === 'none') {
                output.innerHTML = '<p>No valid element or formula found.</p>';
                lookupChart.data.datasets = [];
                lookupChart.update();
                return;
            }

            let chartData = [];
            let chartLabel = '';

            if (info.type === 'element') {
                const el = info.element;
                if (el.Solubility) {
                    chartData = el.Solubility;
                    chartLabel = `${el.Symbol} solubility`;
                }
                output.innerHTML = `
                    <div class="info-card">
                        <h3>${el.Name} (${el.Symbol})</h3>
                        <p><strong>Atomic number:</strong> ${el.AtomicNumber}</p>
                        <p><strong>Atomic mass:</strong> ${el.AtomicMass}</p>
                        <p><strong>Phase:</strong> ${el.Phase}</p>
                        <p><strong>Type:</strong> ${el.Type}</p>
                        <p><strong>Electronegativity:</strong> ${el.Electronegativity}</p>
                        <p><strong>Density:</strong> ${el.Density} g/cm³</p>
                        <p><strong>Melting point:</strong> ${el.MeltingPoint} K</p>
                        <p><strong>Boiling point:</strong> ${el.BoilingPoint} K</p>
                        <p><strong>Valence electrons:</strong> ${el.ValenceElectrons ?? 'N/A'}</p>
                        <p><strong>Specific heat capacity:</strong> ${el.SpecificHeatCapacity ?? 'N/A'} J/g·°C</p>
                        <div><strong>Lewis Diagram:</strong><br><img src="${LewisDiagramGenerator.generateLewisDiagram(el)}" alt="Lewis diagram for ${el.Symbol}" style="max-width: 200px;"></div>
                        <p><strong>Description:</strong> ${el.Description || 'No additional info available.'}</p>
                    </div>
                `;
            } else {
                const elementRows = info.elements.map(item => {
                    const el = item.element;
                    if (el) {
                        return `
                            <div class="info-card">
                                <h3>${el.Name} (${el.Symbol}) — ${item.count}</h3>
                                <p><strong>Atomic number:</strong> ${el.AtomicNumber}</p>
                                <p><strong>Atomic mass:</strong> ${el.AtomicMass}</p>
                                <p><strong>Phase:</strong> ${el.Phase}</p>
                                <p><strong>Type:</strong> ${el.Type}</p>
                                <p><strong>Electronegativity:</strong> ${el.Electronegativity}</p>
                                <p><strong>Density:</strong> ${el.Density} g/cm³</p>
                                <p><strong>Melting point:</strong> ${el.MeltingPoint} K</p>
                                <p><strong>Boiling point:</strong> ${el.BoilingPoint} K</p>
                                <p><strong>Valence electrons:</strong> ${el.ValenceElectrons ?? 'N/A'}</p>
                                <p><strong>Specific heat capacity:</strong> ${el.SpecificHeatCapacity ?? 'N/A'} J/g·°C</p>
                                <div><strong>Lewis Diagram:</strong><br><img src="${LewisDiagramGenerator.generateLewisDiagram(el)}" alt="Lewis diagram for ${el.Symbol}" style="max-width: 200px;"></div>
                                <p><strong>Description:</strong> ${el.Description || 'No additional info available.'}</p>
                            </div>
                        `;
                    }
                    return `<div class="info-card"><h3>${item.symbol} — ${item.count}</h3><p>Element data not available.</p></div>`;
                }).join('');

                chartData = app.calculateSolubility(query, elementData);
                chartLabel = `${query} solubility`;
                const formulaObj = new Formula(query, elementData);
                const compoundInfo = formulaObj.calculateCompoundInfo();
                output.innerHTML = `
                    <div class="info-card formula-card">
                        <h3>Formula: ${query}</h3>
                        <p><strong>Constituent elements:</strong> ${Object.entries(info.formula).map(([sym, count]) => `${sym}${count > 1 ? count : ''}`).join(', ')}</p>
                        <p><strong>Molar mass:</strong> ${formulaObj.getMolarMass().toFixed(2)} g/mol</p>
                        <p><strong>Compound type:</strong> ${compoundInfo.type}</p>
                        ${compoundInfo.polarity ? `<p><strong>Polarity:</strong> ${compoundInfo.polarity}</p>` : ''}
                    </div>
                    ${elementRows}
                `;
            }

            const hasCurve = chartData.some(value => value > 0);
            if (hasCurve) {
                lookupChart.data.datasets = [{
                    label: chartLabel,
                    data: chartData,
                    borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
                    fill: false,
                    tension: 0.75,
                    pointRadius: 4
                }];
            } else {
                lookupChart.data.datasets = [];
                output.innerHTML += '<p>No solubility curve available for this input.</p>';
            }
            lookupChart.update();
        });
    }
});
