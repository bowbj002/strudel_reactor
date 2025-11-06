import './App.css';
import { useEffect, useRef } from "react";
import { StrudelMirror } from '@strudel/codemirror';
import { evalScope } from '@strudel/core';
import { drawPianoroll } from '@strudel/draw';
import { initAudioOnFirstClick } from '@strudel/webaudio';
import { transpiler } from '@strudel/transpiler';
import { getAudioContext, webaudioOutput, registerSynthSounds } from '@strudel/webaudio';
import { registerSoundfonts } from '@strudel/soundfonts';
import { stranger_tune } from './tunes';
import console_monkey_patch, { getD3Data } from './console-monkey-patch';

let globalEditor = null;

const handleD3Data = (event) => {
    console.log(event.detail);
};

export function SetupButtons() {

    //original buttons from provided skeleton
    document.getElementById('play').addEventListener('click', () => globalEditor.evaluate());
    document.getElementById('stop').addEventListener('click', () => globalEditor.stop());
    document.getElementById('process').addEventListener('click', () => { Proc() })
    document.getElementById('process_play').addEventListener('click', () => {
        if (globalEditor != null) {
            Proc()
            globalEditor.evaluate()
        }
    })

    // Save & Load buttons
    document.getElementById('save').addEventListener('click', SaveState);
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
                applySettings(settings);
            } catch (err) {
                console.error('Invalid settings file:', err);
                alert('Invalid or corrupted JSON file.');
            }
        };
        reader.readAsText(file);
    });
}

export function ProcAndPlay() {
    if (globalEditor != null && globalEditor.repl.state.started === true) {
        console.log(globalEditor)
        Proc()
        globalEditor.evaluate();
    }
}

export function Proc() {

    let proc_text = document.getElementById('proc').value

    let proc_text_replaced = proc_text.replaceAll('<p1_Radio>', ProcessText(1));
    proc_text_replaced = proc_text_replaced.replaceAll('<p2_Radio>', ProcessText(2));
    proc_text_replaced = proc_text_replaced.replaceAll('<p3_Radio>', ProcessText(3));

    ProcessText(proc_text);
    globalEditor.setCode(proc_text_replaced)
}

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

export function SaveState() {
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

// Loads strudel_state_save.json
export function loadSettings() {
    document.getElementById('loadSettingsFile').addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const loaded = JSON.parse(e.target.result);
                applySettings(loaded);
            } catch (err) {
                console.error('Invalid JSON file:', err);
                alert('Error loading file. Please make sure it is a valid JSON save.');
            }
        };
        reader.readAsText(file);
    });
}

export function applySettings(settings) {
    if (settings.procText !== undefined) {
        document.getElementById('proc').value = settings.procText;
    }

    if (settings.p1State === 'hush') {
        document.getElementById('flexRadioInstrument1On').checked = false;
        document.getElementById('flexRadioInstrument1Off').checked = true;
    } else {
        document.getElementById('flexRadioInstrument1Off').checked = false;
        document.getElementById('flexRadioInstrument1On').checked = true;
    }

    if (settings.p2State === 'hush') {
        document.getElementById('flexRadioInstrument2On').checked = false;
        document.getElementById('flexRadioInstrument2Off').checked = true;
    } else {
        document.getElementById('flexRadioInstrument2Off').checked = false;
        document.getElementById('flexRadioInstrument2On').checked = true;
    }

    if (settings.p3State === 'hush') {
        document.getElementById('flexRadioInstrument3On').checked = false;
        document.getElementById('flexRadioInstrument3Off').checked = true;
    } else {
        document.getElementById('flexRadioInstrument3Off').checked = false;
        document.getElementById('flexRadioInstrument3On').checked = true;
    }

    // Reprocess and update editor
    Proc();

    if (settings.editorCode && globalEditor) {
        globalEditor.setCode(settings.editorCode);
    }
}


export default function StrudelDemo() {

    const hasRun = useRef(false);

    useEffect(() => {

        if (!hasRun.current) {
            document.addEventListener("d3Data", handleD3Data);
            console_monkey_patch();
            hasRun.current = true;
            //Code copied from example: https://codeberg.org/uzu/strudel/src/branch/main/examples/codemirror-repl
            //init canvas
            const canvas = document.getElementById('roll');
            canvas.width = canvas.width * 2;
            canvas.height = canvas.height * 2;
            const drawContext = canvas.getContext('2d');
            const drawTime = [-2, 2]; // time window of drawn haps
            globalEditor = new StrudelMirror({
                defaultOutput: webaudioOutput,
                getTime: () => getAudioContext().currentTime,
                transpiler,
                root: document.getElementById('editor'),
                drawTime,
                onDraw: (haps, time) => drawPianoroll({ haps, time, ctx: drawContext, drawTime, fold: 0 }),
                prebake: async () => {
                    initAudioOnFirstClick(); // needed to make the browser happy (don't await this here..)
                    const loadModules = evalScope(
                        import('@strudel/core'),
                        import('@strudel/draw'),
                        import('@strudel/mini'),
                        import('@strudel/tonal'),
                        import('@strudel/webaudio'),
                    );
                    await Promise.all([loadModules, registerSynthSounds(), registerSoundfonts()]);
                },
            });

            document.getElementById('proc').value = stranger_tune
            SetupButtons()
            Proc()
        }

    }, []);


    return (
        <div>
            <head>
                <title>The Music Machine</title>
                <link rel="icon" type="image/svg+xml" href="https://strudel.cc/favicon.ico" />
            </head>

            <h2 style={{ display: 'inline-block', marginRight: 5 }}>Strudel Music Maker</h2>
            <a href="https://strudel.cc/workshop/getting-started/" rel="noopener" target="_blank" style={{ marginLeft: 5 }} className="btn btn-small btn-danger">Help!</a>

            <main>

                <div className="container-fluid">

                    <div className="row">
                        <div className="col-md-8" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                            <label htmlFor="exampleFormControlTextarea1" className="form-label">Preprocessed Music:</label>
                            <textarea className="form-control" rows="15" id="proc" ></textarea>
                        </div>

                        <div className="col-md-4">
                            <nav>
                                <label>Processing:</label> <br />
                                <button id="process" className="btn btn-lg btn-primary m-2 r-2">Preprocess</button>
                                <button id="process_play" className="btn btn-lg btn-primary">Proc & Play</button>
                                <br />

                                <label>Playing:</label> <br />
                                <button id="play" className="btn btn-lg btn-info m-2 r-2">Play</button>
                                <button id="stop" className="btn btn-lg btn-info m-2 r-2">Stop</button>
                                <br />

                                <label>Save & Load:</label> <br />
                                <button id="save" className="btn btn-lg btn-success m-2 r-2">Save</button>
                                <button id="load" className="btn btn-lg btn-warning m-2 r-2">Load</button>
                                <input type="file" id="loadSettingsFile" accept="application/json" style={{ display: 'none' }} />
                            </nav>
                        </div>
                    </div>


                    <div className="row">
                        <div className="col-md-8" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                            <div id="editor" />
                            <div id="output" />
                        </div>
                        <div className="col-md-4">
                            <div className="form-group">
                                <p>Instrument 1</p>
                                <div className="form-check">
                                    <input className="form-check-input" type="radio" name="flexRadioInstrument1" id="flexRadioInstrument1On" onChange={ProcAndPlay} defaultChecked />
                                    <label className="form-check-label" htmlFor="flexRadioInstrument1On">
                                        ON
                                    </label>
                                </div>
                                <div className="form-check">
                                    <input className="form-check-input" type="radio" name="flexRadioInstrument1" id="flexRadioInstrument1Off" onChange={ProcAndPlay} />
                                    <label className="form-check-label" htmlFor="flexRadioInstrument2Off">
                                        MUTE
                                    </label>
                                </div>

                                <p>Instrument 2</p>
                                <div className="form-check">
                                    <input className="form-check-input" type="radio" name="flexRadioInstrument2" id="flexRadioInstrument2On" onChange={ProcAndPlay} defaultChecked />
                                    <label className="form-check-label" htmlFor="flexRadioInstrument2On">
                                        ON
                                    </label>
                                </div>
                                <div className="form-check">
                                    <input className="form-check-input" type="radio" name="flexRadioInstrument2" id="flexRadioInstrument2Off" onChange={ProcAndPlay} />
                                    <label className="form-check-label" htmlFor="flexRadioInstrument2Off">
                                        MUTE
                                    </label>
                                </div>

                                <p>Instrument 3</p>
                                <div className="form-check">
                                    <input className="form-check-input" type="radio" name="flexRadioInstrument3" id="flexRadioInstrument3On" onChange={ProcAndPlay} defaultChecked />
                                    <label className="form-check-label" htmlFor="flexRadioInstrument3On">
                                        ON
                                    </label>
                                </div>
                                <div className="form-check">
                                    <input className="form-check-input" type="radio" name="flexRadioInstrument3" id="flexRadioInstrument3Off" onChange={ProcAndPlay} />
                                    <label className="form-check-label" htmlFor="flexRadioInstrument3Off">
                                        MUTE
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                <canvas id="roll"></canvas>


            </main >
        </div >
    );


}