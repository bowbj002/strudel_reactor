import { ApplySettings } from './applyState';

/**
 * Driver for loading a file
 * @author Victoria Bowering bowbj002
 */
export function LoadState() {
    const input = document.getElementById('loadSettingsFile');
    input.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            let loaded;
            // only catch JSON parse errors
            try {
                loaded = JSON.parse(e.target.result);
            } catch (err) {
                console.error('Invalid JSON file:', err);
                alert('Error loading file. Please make sure it is a valid JSON savestate.');
                return;
            }

            // Apply settings safely — log errors but no alert
            try {
                ApplySettings(loaded);
            } catch (err) {
                console.error('Error applying settings (not a JSON file issue):', err);
            }
        };
        reader.readAsText(file);
    });
}
