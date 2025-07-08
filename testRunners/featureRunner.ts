import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

// For resolving current file path
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Relative to project root
const relativeFeaturePatterns = [
    //'../features/**/*.feature',  // Include all feature files
    // Or selectively enable a subset
    // '../features/index.feature',
     //'../features/inputs.feature',
    // '../features/basic_auth.feature',
    // '../features/checkboxes.feature',
    // '../features/dropdown.feature',
     '../features/login.feature'
];

const resolveFeaturePaths = () => {
    const allFiles = [];
    for (const pattern of relativeFeaturePatterns) {
        const resolved = glob.sync(path.resolve(__dirname, pattern));
        allFiles.push(...resolved);
    }
    return allFiles;
};

const featurePaths = resolveFeaturePaths();

export default featurePaths;
