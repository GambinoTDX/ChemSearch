class main {

    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',');
        const elementsBySymbol = {};
        lines.slice(1).forEach(line => {
            const values = line.split(',');
            const obj = {};
            headers.forEach((header, index) => {
                obj[headers[index].trim()] = values[index] ? values[index].trim() : '';
            });

            const element = new Element(
                parseInt(obj.AtomicNumber) || 0,
                obj.Element || '',
                obj.Symbol || '',
                parseFloat(obj.AtomicMass) || 0,
                obj.Phase || '',
                obj.Type || '',
                parseFloat(obj.Electronegativity) || null,
                parseFloat(obj.Density) || 0,
                parseFloat(obj.MeltingPoint) || null,
                parseFloat(obj.BoilingPoint) || null,
                parseFloat(obj.SpecificHeat) || 0,
                parseInt(obj.NumberofValence) || 0
            );
            elementsBySymbol[element.getSymbol()] = element;
        });
        return elementsBySymbol;
    }

    parseFormula(formula) {
  
        const elements = {};
        const regex = /([A-Z][a-z]?)(\d*)/g;
        let match;
        while ((match = regex.exec(formula)) !== null) {
            const element = match[1];
            const count = match[2] ? parseInt(match[2]) : 1;
            elements[element] = (elements[element] || 0) + count;
        }
        return elements;
    }

    calculateMolarMass(formula, elementData) {
        const elements = this.parseFormula(formula);
        let molarMass = 0;
        for (const [elem, count] of Object.entries(elements)) {
            const element = elementData[elem];
            if (element && element.AtomicMass) {
                molarMass += count * element.AtomicMass;
            }
        }
        return molarMass;
    }

    calculateSolubility(formula, elementData) {
        const f = new Formula(formula, elementData);
        return f.calculateSolubilityCurve();
    }

    getElementInfo(query, elementData) {
        const normalized = query.trim().toLowerCase();
        const bySymbol = elementData[normalized.toUpperCase()];
        if (bySymbol) {
            return { type: 'element', element: bySymbol };
        }
        const byName = Object.values(elementData).find(el => el.Name.toLowerCase() === normalized);
        if (byName) {
            return { type: 'element', element: byName };
        }

        const formula = this.parseFormula(query);
        const entries = Object.entries(formula);
        if (entries.length === 0) {
            return { type: 'none' };
        }

        const elements = entries.map(([symbol, count]) => {
            const element = elementData[symbol];
            return {
                symbol,
                count,
                element: element || null
            };
        });

        return { type: 'formula', formula, elements };
    }

}


let elementData = {};


let compoundData = {};


async function loadElementData() {
    try {
        const response = await fetch('PToE.csv');
        if (!response.ok) throw new Error(`Failed to load PToE.csv: ${response.status}`);
        const csvText = await response.text();

        
        const parseCsvLine = (line) => {
            const out = [];
            let cur = '';
            let inQuotes = false;
            for (let i = 0; i < line.length; i++) {
                const ch = line[i];
                if (ch === '"') {
                   
                    if (inQuotes && line[i + 1] === '"') {
                        cur += '"';
                        i++;
                    } else {
                        inQuotes = !inQuotes;
                    }
                } else if (ch === ',' && !inQuotes) {
                    out.push(cur);
                    cur = '';
                } else {
                    cur += ch;
                }
            }
            out.push(cur);
            return out;
        };

        const lines = csvText.split(/\r?\n/).filter(l => l.trim().length);
        const headers = parseCsvLine(lines[0]).map(h => h.trim());

        const idx = (name) => headers.findIndex(h => h === name);
        const get = (arr, name) => {
            const i = idx(name);
            return i >= 0 ? (arr[i] ?? '').trim() : '';
        };

        const toNumberOrNull = (v) => {
            if (v == null) return null;
            const s = String(v).trim();
            if (!s) return null;
            const n = Number(s);
            return Number.isFinite(n) ? n : null;
        };

        elementData = {};

        for (const line of lines.slice(1)) {
            const values = parseCsvLine(line);
            const symbol = get(values, 'Symbol');
            if (!symbol) continue;

            const valenceFromCsv = toNumberOrNull(get(values, 'NumberofValence'));
            const specificHeatFromCsv = toNumberOrNull(get(values, 'SpecificHeat'));

            elementData[symbol] = {
                Symbol: symbol,
                Name: get(values, 'Element'),
                AtomicNumber: toNumberOrNull(get(values, 'AtomicNumber')),
                AtomicMass: toNumberOrNull(get(values, 'AtomicMass')),
                Phase: get(values, 'Phase') || 'Unknown',
                Type: (get(values, 'Type') || '').trim() || 'Unknown',
                Electronegativity: toNumberOrNull(get(values, 'Electronegativity')),
                Density: toNumberOrNull(get(values, 'Density')),
                MeltingPoint: toNumberOrNull(get(values, 'MeltingPoint')),
                BoilingPoint: toNumberOrNull(get(values, 'BoilingPoint')),
                ValenceElectrons: valenceFromCsv,
                SpecificHeatCapacity: specificHeatFromCsv,
                Description: ''
            };
        }

        console.log('Element data loaded from PToE.csv:', Object.keys(elementData).length, 'elements');
        return;
    } catch (error) {
        console.warn('Failed to load element data from PToE.csv, falling back to JSON:', error);
    }

    try {
        const response = await fetch('https://raw.githubusercontent.com/Bowserinator/Periodic-Table-JSON/master/PeriodicTableJSON.json');
        const data = await response.json();
        data.elements.forEach(el => {
            const symbol = el.symbol;
            let valence = el.valence;
            if (valence == null) {
                const group = el.group;
                if (typeof group === 'number') {
                    if (group >= 1 && group <= 2) valence = group;
                    else if (group >= 13 && group <= 18) valence = group - 10;
                }
            }

            elementData[symbol] = {
                Symbol: symbol,
                Name: el.name,
                AtomicNumber: el.number,
                AtomicMass: el.atomic_mass,
                Phase: el.phase || 'Unknown',
                Type: el.category || 'Unknown',
                Electronegativity: el.electronegativity_pauling || null,
                Density: el.density || null,
                MeltingPoint: el.melt || null,
                BoilingPoint: el.boil || null,
                ValenceElectrons: valence ?? null,
                SpecificHeatCapacity: el.specific_heat || null,
                Description: el.summary || 'No description available.'
            };
        });
        console.log('Element data loaded from JSON:', Object.keys(elementData).length, 'elements');
    } catch (error) {
        console.error('Failed to load element data:', error);
        elementData = {
            Na: { Symbol: 'Na', Name: 'Sodium', ValenceElectrons: 1 },
            Cl: { Symbol: 'Cl', Name: 'Chlorine', ValenceElectrons: 7 },
            K: { Symbol: 'K', Name: 'Potassium', ValenceElectrons: 1 },
            C: { Symbol: 'C', Name: 'Carbon', ValenceElectrons: 4 },
            O: { Symbol: 'O', Name: 'Oxygen', ValenceElectrons: 6 }
        };
    }
}

async function loadSolubilityData() {
    try {
        const response = await fetch('solubility_data.csv');
        const csvText = await response.text();
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',');
        lines.slice(1).forEach(line => {
            const values = line.split(',');
            const formula = values[1].trim();
            const temp = parseFloat(values[2]);
            const sol = parseFloat(values[3]);
            if (!compoundData[formula]) compoundData[formula] = {};
            compoundData[formula][temp] = sol;
        });
        console.log('Solubility data loaded for formulas:', Object.keys(compoundData));
    } catch (error) {
        console.error('Failed to load solubility data:', error);
    }
}

loadElementData();
loadSolubilityData();

let chart;
const ctx = document.getElementById('chart').getContext('2d');
chart = new Chart(ctx, {
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

let lookupChart;
const lookupCtx = document.getElementById('lookupChart').getContext('2d');
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

document.getElementById('addBtn').addEventListener('click', () => {
    const formula = document.getElementById('formulaInput').value.trim();
    if (formula) {
        const app = new main();
        const solubilityCurve = app.calculateSolubility(formula, elementData);
        if (solubilityCurve) {
            chart.data.datasets.push({
                label: formula,
                data: solubilityCurve,
                borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
                fill: false,
                tension: 0.75,
                pointRadius: 4
            });
            chart.update();
            document.getElementById('result').innerHTML = `<p>Solubility curve added for ${formula}.</p>`;
        } else {
            document.getElementById('result').innerHTML = `<p>No solubility data available for ${formula}.</p>`;
        }
        document.getElementById('formulaInput').value = '';
    } else {
        document.getElementById('result').innerHTML = '<p>Please enter a valid formula.</p>';
    }
});

document.getElementById('resetBtn').addEventListener('click', () => {
    chart.data.datasets = [];
    chart.update();
    document.getElementById('result').innerHTML = '<p>Graph reset.</p>';
    document.getElementById('formulaInput').value = '';
});

document.getElementById('lookupBtn').addEventListener('click', () => {
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
                <p><strong>Valence electrons:</strong> ${el.ValenceElectrons}</p>
                <p><strong>Specific heat capacity:</strong> ${el.SpecificHeatCapacity} J/g·°C</p>
                <!-- Solubility list removed from lookup display; chart remains available below -->
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
                        <p><strong>Valence electrons:</strong> ${el.ValenceElectrons}</p>
                        <p><strong>Specific heat capacity:</strong> ${el.SpecificHeatCapacity} J/g·°C</p>
                        <!-- Solubility list removed from lookup display; chart remains available below -->
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

    if (chartData && chartData.some(value => value > 0)) {
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
        if (!chartData) {
            output.innerHTML += '<p>No solubility data available for this formula.</p>';
        }
    }
    lookupChart.update();
});

