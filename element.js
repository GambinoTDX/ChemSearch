class Element {
    constructor(atomicNumber, name, symbol, atomicMass, phase, type, electronegativity, density, meltingPoint, boilingPoint, specificHeatCapacity, valenceElectrons) {
        this.atomicNumber = atomicNumber;
        this.name = name;
        this.symbol = symbol;
        this.atomicMass = atomicMass;
        this.phase = phase;
        this.type = type;
        this.electronegativity = electronegativity;
        this.density = density;
        this.meltingPoint = meltingPoint;
        this.boilingPoint = boilingPoint;
        this.specificHeatCapacity = specificHeatCapacity;
        this.valenceElectrons = valenceElectrons;
    }

    getAtomicNumber() {
        return this.atomicNumber;
    }

    getName() {
        return this.name;
    }

    getSymbol() {
        return this.symbol;
    }

    getAtomicMass() {
        return this.atomicMass;
    }

    getPhase() {
        return this.phase;
    }

    getType() {
        return this.type;
    }

    getElectronegativity() {
        return this.electronegativity;
    }

    getDensity() {
        return this.density;
    }

    getMeltingPoint() {
        return this.meltingPoint;
    }

    getBoilingPoint() {
        return this.boilingPoint;
    }

    getSpecificHeatCapacity() {
        return this.specificHeatCapacity;
    }

    getValenceElectrons() {
        return this.valenceElectrons;
    }
}