/* globalEditor */
import { Proc } from './Proc';

/**
 * Applies the loaded file
 * @param {any} settings
 * @param {StrudelMirror} globalEditor
 * @author Victoria Bowering
 */
export function ApplySettings(settings, globalEditor) {
    const procElem = document.getElementById('proc');
    if (procElem && settings.procText !== undefined) {
        procElem.value = settings.procText;
    }

    const radioIds = [
        ['flexRadioInstrument1On', 'flexRadioInstrument1Off', settings.p1State],
        ['flexRadioInstrument2On', 'flexRadioInstrument2Off', settings.p2State],
        ['flexRadioInstrument3On', 'flexRadioInstrument3Off', settings.p3State]
    ];

    radioIds.forEach(([onId, offId, state]) => {
        const onInstrument = document.getElementById(onId);
        const offInstrument = document.getElementById(offId);
        if (onInstrument && offInstrument) {
            if (state === 'hush') {
                onInstrument.checked = false;
                offInstrument.checked = true;
            } else {
                offInstrument.checked = false;
                onInstrument.checked = true;
            }
        }
    });

    // Only call Proc if it exists
    if (typeof Proc === 'function') {
        Proc();
    }

    // Only set code if globalEditor exists
    if (settings.editorCode && globalEditor) {
        globalEditor.setCode(settings.editorCode);
    }
}
