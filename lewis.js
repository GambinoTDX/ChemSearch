// lewis.js - Lewis diagram generator for elements

class LewisDiagramGenerator {
    static generateLewisDiagram(element) {
        const symbol = element.Symbol;
        let valenceElectrons = element.ValenceElectrons;
        if (valenceElectrons == null) {
            valenceElectrons = this.calculateValence(element.AtomicNumber);
        }

        // Create a canvas
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');

        // Clear canvas with white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 200, 200);

        // Draw element symbol in center
        ctx.fillStyle = 'black';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(symbol, 100, 100);

        // Draw valence electrons as dots
        if (valenceElectrons > 0) {
            this.drawElectrons(ctx, valenceElectrons);
        }

        // Return data URL
        return canvas.toDataURL('image/png');
    }

    static calculateValence(atomicNumber) {
        // Simple calculation for main group elements
        if (atomicNumber <= 2) return atomicNumber;
        if (atomicNumber <= 10) return atomicNumber - 2;
        if (atomicNumber <= 18) return atomicNumber - 10;
        if (atomicNumber <= 36) return atomicNumber - 18;
        if (atomicNumber <= 54) return atomicNumber - 36;
        if (atomicNumber <= 86) return atomicNumber - 54;
        return atomicNumber - 86; // approximate
    }

    static drawElectrons(ctx, count) {
        const positions = [
            // Top: pair horizontal
            { x: 90, y: 40 },
            { x: 110, y: 40 },
            // Right: pair vertical
            { x: 140, y: 90 },
            { x: 140, y: 110 },
            // Bottom: pair horizontal
            { x: 90, y: 160 },
            { x: 110, y: 160 },
            // Left: pair vertical
            { x: 60, y: 90 },
            { x: 60, y: 110 }
        ];

        for (let i = 0; i < Math.min(count, 8); i++) {
            ctx.beginPath();
            ctx.arc(positions[i].x, positions[i].y, 3, 0, 2 * Math.PI);
            ctx.fillStyle = 'black';
            ctx.fill();
        }
    }
}

// Export for use
window.LewisDiagramGenerator = LewisDiagramGenerator;