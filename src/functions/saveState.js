

/**
 * Saves the state of the current editor contents
 * @param {StrudelMirror} globalEditor
 * @author Victoria Bowering
 */
export function SaveState(globalEditor) {
    const currState = {
        procText: document.getElementById('proc').value,

        p1State: document.getElementById('flexRadioInstrument1Off').checked ? 'hush' : 'on',
        p2State: document.getElementById('flexRadioInstrument2Off').checked ? 'hush' : 'on',
        p3State: document.getElementById('flexRadioInstrument3Off').checked ? 'hush' : 'on',

        editorCode: globalEditor?.getCode?.() || '',
    }

    // Creates a js 'blob' object that stores the insides of the strudel window 
    const strudelBlob = new Blob([JSON.stringify(currState, null, 2)], { type: 'application/json' })

    // Makes a url and downloads
    const url = URL.createObjectURL(strudelBlob)
    const a = document.createElement('a');
    a.href = url;
    a.download = 'strudel_state_save.json';
    a.click();
    URL.revokeObjectURL(url);
}