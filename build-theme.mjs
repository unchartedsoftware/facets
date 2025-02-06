import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Define the pattern for CSS files in the src directory.
const cssFilesPattern = path.join(process.cwd(), 'src/**/*.css');

// Object to store CSS variables and their default values.
const cssVariables = {};

// Regular expression to capture CSS variable usage with default values.
// Matches patterns like: var(--my-color, #000000)
const varRegex = /var\(\s*(--[\w-]+)\s*,\s*((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\)){1,200})\s*\)/g;

async function buildTheme() {
    console.log('Generating theme.css...');
    try {
        // Get all CSS files matching the pattern.
        const files = await glob(cssFilesPattern);
        console.log(`Found ${files.length} CSS files.`);

        // Process each file.
        for (const file of files) {
            const content = await fs.promises.readFile(file, 'utf8');
            let match;
            // Loop to extract all occurrences of the variable pattern.
            while ((match = varRegex.exec(content)) !== null) {
                const varName = match[1];
                const defaultValue = match[2].trim();
                cssVariables[varName] = defaultValue;
            }
        }

        // Construct the :root CSS block.
        let themeContent = ':root {\n';
        // Get and sort the entries by key (variable name)
        const sortedEntries = Object.entries(cssVariables).sort(([a], [b]) => a.localeCompare(b));

        for (const [variable, value] of sortedEntries) {
            themeContent += `  ${variable}: ${value};\n`;
        }
        themeContent += '}\n';

        // Set the output file path.
        const outputFilePath = path.join(process.cwd(), 'dist/theme.css');

        // Ensure the directory exists (creates it if needed)
        await fs.promises.mkdir(path.dirname(outputFilePath), { recursive: true });

        // Write the file.
        await fs.promises.writeFile(outputFilePath, themeContent, 'utf8');
        console.log('theme.css has been generated successfully.');
    } catch (error) {
        console.error('Error generating theme.css:', error);
        process.exit(1);
    }
}

buildTheme().then(() => console.log('Theme generation complete.'));
