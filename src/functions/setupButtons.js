import { SaveState } from './saveState';
import { ApplySettings } from './applyState';
import { Proc } from './Proc';

/**
 * Setsup the buttons for the site
 * @param {StrudelMirror} globalEditor
 */
export function SetupButtons(globalEditor) {

    //original buttons from provided skeleton
    document.getElementById('play').addEventListener('click', () => globalEditor.evaluate());
    document.getElementById('stop').addEventListener('click', () => globalEditor.stop());
    document.getElementById('process').addEventListener('click', () => { Proc(globalEditor) })
    document.getElementById('process_play').addEventListener('click', () => {
        if (globalEditor != null) {
            Proc(globalEditor)
            globalEditor.evaluate()
        }
    })

    // Save & Load buttons
    document.getElementById('save').addEventListener('click', () => SaveState(globalEditor));
    document.getElementById('load').addEventListener('click', () => {
        document.getElementById('loadSettingsFile').click();
    });

    // Hidden file input change
    document.getElementById('loadSettingsFile').addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const settings = JSON.parse(e.target.result);
                ApplySettings(settings);
            } catch (err) {
                console.error('Invalid settings file:', err);
                alert('Invalid or corrupted JSON file.');
            }
        };
        reader.readAsText(file);
    });
}

export function ToggleDarkMode() {
    const enabled = document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkmode", enabled);
}