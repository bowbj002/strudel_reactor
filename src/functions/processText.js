/* globalEditor */

/**
 * 
 * @param {any} match
 * @param {...any} args
 * @returns
 * @deprecated
 */
export function ProcessText(match, ...args) {

    let replace = ""
    if (match === 1 && document.getElementById('flexRadioInstrument1Off').checked) {
        replace = "_"
    }

    if (match === 2 && document.getElementById('flexRadioInstrument2Off').checked) {
        replace = "_"
    }

    if (match === 3 && document.getElementById('flexRadioInstrument3Off').checked) {
        replace = "_"
    }

    return replace
}