
let chart;

function initGraphingChart() {
    const chartCanvas = document.getElementById('chart');
    if (!chartCanvas) return;
    
    const ctx = chartCanvas.getContext('2d');
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
}

document.addEventListener('DOMContentLoaded', () => {
    initGraphingChart();

    const addBtn = document.getElementById('addBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
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
    }

    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            chart.data.datasets = [];
            chart.update();
            document.getElementById('result').innerHTML = '<p>Graph reset.</p>';
            document.getElementById('formulaInput').value = '';
        });
    }
});
