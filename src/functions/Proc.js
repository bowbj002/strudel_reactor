
/**
 * Processes the plaintext code
 * @param {StrudelMirror} globalEditor
 * @returns
 * @author Victoria Bowering
 */
export function Proc(globalEditor) {
    if (!globalEditor) return; // prevent crash

    let proc_text = document.getElementById('proc').value;

    const phaserIntensity = parseFloat(document.getElementById('phaserSlider').value);
    if (phaserIntensity > 0) {
        proc_text = proc_text.replace('<phaser>', `.phaser(${phaserIntensity})`);
    }
    else {
        proc_text = proc_text.replaceAll('<phaser>', ''); // remove effect if 0
    }

    const gainLevel = parseFloat(document.getElementById('gainSlider').value);
    if (gainLevel !== 0) {
        proc_text = proc_text.replace('<gain>', `.gain(${gainLevel})`);
    }
    else {
        proc_text = proc_text.replaceAll('<gain>', ''); // remove effect if 0
    }


    ['1', '2', '3'].forEach(i => {
        const placeholder = `<p${i}_Radio>`;
        const isMuted = document.getElementById(`flexRadioInstrument${i}Off`).checked;
        // if there are markers in the code
        if (proc_text.includes(placeholder)) {
            proc_text = proc_text.replaceAll(placeholder, isMuted ? '_' : ''); // if muted make "_" else ""
        }
    });

    // put text in editor
   globalEditor.setCode(proc_text)

}