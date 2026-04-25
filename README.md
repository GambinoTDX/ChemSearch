# RidgeHacks-2026-ChemSearch

ChemSearch is an all-in-one interactive chemistry platform that simplifies chemical analysis by combining element data lookup, dynamic solubility graphing, and an automated, step-by-step Lewis structure generator into one intuitive, modern interface.

Inspiration
Chemistry resources and calculators are often scattered across multiple websites with outdated, clunky interfaces. We wanted to create a unified, modern hub—inspired by clean productivity tools like Trello—where students, educators, and professionals can pull up physical properties, visualize solubility data, and understand complex molecular structures instantly.

What it does
Smart Lookup: Users can search for specific elements or complex chemical formulas to instantly retrieve properties like molar mass, electronegativity, valence electrons, and specific heat capacity.
Solubility Graphing: Dynamically plots interactive solubility curves (using Chart.js) based on temperature and solubility data.
Lewis Structure Generator: Automatically identifies whether a compound is ionic or covalent, distributes electrons, enforces octet/duet rules, minimizes formal charges, and provides a step-by-step text breakdown of how the Lewis diagram is built.
How we built it
The project was built using vanilla HTML, CSS, and JavaScript to keep it lightweight and fast. We used Chart.js for the graphing capabilities. The chemical formula parsing and Lewis structure generation rely on custom-built JavaScript algorithms. Data is dynamically ingested out of local CSV files (PToE.csv, solubility_data.csv) and JSON endpoints, parsed and cleaned on the client side.

Challenges we ran into
Lewis Structure Algorithm: Translating the strict rules of chemistry (electronegativity, valence counts, hydrogen's duet exception, and minimizing formal charges) into a functioning, consistent algorithm was highly complex.
Data Parsing: Cleaning and aligning data from CSV files—specifically ensuring properties like valence electrons and specific heat capacity mapped correctly when data fields were null or missing.
Formula Parsing: Creating a robust Regex-based parser to accurately separate elements and their subscripts from user inputs (e.g., parsing KNO3 or NaCl).
Accomplishments that we're proud of
Successfully building the custom Lewis structure generator from scratch without relying on external chemistry visualizer libraries.
Creating a highly polished, professional, SaaS-like UI entirely with raw CSS.
Seamlessly blending the Lewis structure outputs directly into the dynamic Lookup cards for a perfect user experience.
What we learned
Advanced JavaScript algorithmic problem-solving to enforce real-world chemistry logic.
How to manage and parse bulk local CSV data in the browser cleanly.
Modern CSS design principles to create a cohesive, readable, and responsive user interface.
What's next for our project
3D Molecular Visualization: Integrating libraries to show interactive 3D models alongside the Lewis structures.
Equation Balancer: Adding a tool to input chemical reactions and automatically output the balanced stoichiometry.
Expanded Database: Sourcing larger datasets for solubility to support thousands of compounds.
