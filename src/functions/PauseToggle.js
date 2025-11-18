import { Proc } from './Proc';

/**
 * Toggles between playing and paused
 * @author Victoria Bowering
 * @param {StrudelMirror} globalEditor
 * @returns
 */
export function PauseToggle(globalEditor) {
    if (globalEditor) { }

    const isPlaying = globalEditor.repl.state.started;

    if (isPlaying) {
        globalEditor.stop();   // stops playback
    } else {
        Proc(globalEditor);    // preprocess code before playing
        globalEditor.evaluate(); // starts playback
    }
}

