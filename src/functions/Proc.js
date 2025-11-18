
/**
 * Processes the plaintext code
 * @param {StrudelMirror} globalEditor
 * @returns
 * @author Victoria Bowering
 */
export function Proc(globalEditor) {
    ProcStart()
    if (!globalEditor) return; // prevent crash
    let proc_text = document.getElementById('proc').value;

    const phaserIntensity = parseFloat(document.getElementById('phaserSlider').value);
    const cpm = parseInt(document.getElementById('cpmInput').value) || 28;
    const gainLevel = parseFloat(document.getElementById('gainSlider').value);


    const PLACEHOLDERS = {
        phaser: () => phaserIntensity > 0 ? `.phaser(${phaserIntensity})` : "",
        speed: () => cpm !== 28 ? `.cpm(${cpm})` : "",
        gain: () => gainLevel !== 0 ? `.gain(${gainLevel})` : "",
        p1_Radio: () => document.getElementById("flexRadioInstrument1Off").checked ? "_" : "",
        p2_Radio: () => document.getElementById("flexRadioInstrument2Off").checked ? "_" : "",
        p3_Radio: () => document.getElementById("flexRadioInstrument3Off").checked ? "_" : "",
    };

    for (const key in PLACEHOLDERS) {
        proc_text = proc_text.replaceAll(`<${key}>`, PLACEHOLDERS[key]());
    }

    ProcEnd()
    // put text in editor
    globalEditor.setCode(proc_text)

}

function ProcStart() {
    const processingBanner = document.getElementById("status");
    if (processingBanner) processingBanner.style.opacity = 1;
}
function ProcEnd() {
    const processingBanner = document.getElementById("status");
    if (processingBanner) processingBanner.style.opacity = 0;
}