class Formula {
    constructor(formula, elementsBySymbol) {
        this.formula = formula;
        this.elements = {};

        // Parse chemical formulas like CO2, H2O, NaCl, etc.
        const regex = /([A-Z][a-z]?)(\d*)/g;
        let match;

        while ((match = regex.exec(formula)) !== null) {
            const symbol = match[1];
            const count = match[2] ? parseInt(match[2], 10) : 1;
            const element = elementsBySymbol[symbol];

            if (!this.elements[symbol]) {
                this.elements[symbol] = { element, count };
            } else {
                this.elements[symbol].count += count;
            }

            this[symbol] = this.elements[symbol];
        }
    }

    getMolarMass() {
        return Object.values(this.elements).reduce((sum, entry) => {
            const element = entry.element;
            const atomicMass = element && (element.getAtomicMass ? element.getAtomicMass() : element.atomicMass || element.AtomicMass);
            return sum + (atomicMass ? atomicMass * entry.count : 0);
        }, 0);
    }

    calculateCompoundInfo() {
        const elements = Object.values(this.elements);
        if (elements.length <= 1) {
            return { type: 'Element', polarity: null };
        }

        let minEN = Infinity;
        let maxEN = -Infinity;

        for (const entry of elements) {
            const element = entry.element;
            const en = element && (element.Electronegativity || element.electronegativity_pauling);
            if (en != null) {
                if (en < minEN) minEN = en;
                if (en > maxEN) maxEN = en;
            }
        }

        if (minEN === Infinity || maxEN === -Infinity) {
            return { type: 'Unknown', polarity: null };
        }

        const diff = maxEN - minEN;
        let type, polarity;
        if (diff > 1.7) {
            type = 'Ionic compound';
            polarity = 'Ionic';
        } else {
            type = 'Molecular compound';
            if (diff > 0.4) {
                polarity = 'Polar';
            } else {
                polarity = 'Nonpolar';
            }
        }
        return { type, polarity };
    }

    calculateSolubilityAtTemp(temp) {
        if (!compoundData[this.formula]) return null;
        const data = compoundData[this.formula];
        const temps = Object.keys(data).map(Number).sort((a, b) => a - b);
        if (temps.length === 0) return null;

        if (temp <= temps[0]) return data[temps[0]];
        if (temp >= temps[temps.length - 1]) return data[temps[temps.length - 1]];

        for (let i = 0; i < temps.length - 1; i++) {
            const t1 = temps[i], t2 = temps[i + 1];
            if (temp >= t1 && temp <= t2) {
                const s1 = data[t1], s2 = data[t2];
                return s1 + (s2 - s1) * (temp - t1) / (t2 - t1);
            }
        }
        return null;
    }

    calculateSolubilityCurve() {
        // Check if formula exists in compoundData
        if (!compoundData[this.formula]) {
            return null;
        }
        return Array.from({ length: 11 }, (_, i) => this.calculateSolubilityAtTemp(i * 10));
    }

    
}