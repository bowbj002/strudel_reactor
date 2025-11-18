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
import console_monkey_patch/*, { getD3Data }*/ from './console-monkey-patch';

import { Proc } from './functions/Proc';
import { SetupButtons } from './functions/setupButtons';

let globalEditor = null;

const handleD3Data = (event) => {
    console.log(event.detail);
};

export function ProcAndPlay() {
    if (globalEditor != null && globalEditor.repl.state.started === true) {
        console.log(globalEditor);
        Proc(globalEditor);
        globalEditor.evaluate();
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
            SetupButtons(globalEditor)
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
            <a href="https://strudel.cc/workshop/getting-started/" rel="noreferrer noopener" target="_blank" style={{ marginLeft: 5 }} className="btn btn-small btn-danger">Help!</a>

            <main>

                <div className="container-fluid">

                    <div className="row">
                        <div className="col-md-8" style={{ maxHeight: '100vh', overflowY: 'auto' }}>
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
                        <div className="col-md-8" style={{ overflowY: 'auto' }}>
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

                                <br />

                                <div className="form-group">
                                    <label htmlFor="phaserSlider">Phaser Effect Intensity</label>
                                    <input
                                        type="range"
                                        className="form-range"
                                        id="phaserSlider"
                                        min="0"
                                        max="10"
                                        step="0.1"
                                        defaultValue={0}
                                        onChange={ProcAndPlay}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="gainSlider">Audio Gain:</label>
                                    <input
                                        type="range"
                                        className="form-range"
                                        id="phaserSlider"
                                        min="-20"
                                        max="20"
                                        step="0.2"
                                        defaultValue={0}
                                        onChange={ProcAndPlay}
                                    />
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