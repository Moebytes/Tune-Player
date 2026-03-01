/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Tune Player - A cute music player ❤                       *
 * Copyright © 2026 Moebytes <moebytes.com>                  *
 * Licensed under CC BY-NC 4.0. See license.txt for details. *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import React, {useEffect, useState} from "react"
import {usePlaybackSelector, usePlaybackActions} from "../store"
import Slider from "react-slider"
import SawtoothIcon from "../assets/svg/sawtooth.svg"
import SquareIcon from "../assets/svg/square.svg"
import TriangleIcon from "../assets/svg/triangle.svg"
import SineIcon from "../assets/svg/sine.svg"
import "./styles/midisynth.less"

const MIDISynth: React.FunctionComponent = () => {
    const {
        wave, basicWave, waveType, attack, decay, sustain, release, poly, portamento
    } = usePlaybackSelector()
    const {
        setWave, setBasicWave, setWaveType, setAttack, setDecay, setSustain, 
        setRelease, setPoly, setPortamento
    } = usePlaybackActions()

    const [visible, setVisible] = useState(false)
    const [hover, setHover] = useState(false)

    const reset = () => {
        setWave("square")
        setBasicWave("square")
        setWaveType("basic")
        setAttack(0.02)
        setDecay(0.5)
        setSustain(0.3)
        setRelease(0.5)
        setPoly(true)
        setPortamento(0)
    }

    useEffect(() => {
        const showsynthDialog = (event: any, update: any) => {
            setVisible((prev) => !prev)
        }
        const closeAllDialogs = (event: any, ignore: any) => {
            if (ignore !== "synth") setVisible(false)
        }
        window.ipcRenderer.on("show-synth-dialog", showsynthDialog)
        window.ipcRenderer.on("close-all-dialogs", closeAllDialogs)
        window.ipcRenderer.on("reset-synth", reset)

        return () => {
            window.ipcRenderer.removeListener("show-synth-dialog", showsynthDialog)
            window.ipcRenderer.removeListener("close-all-dialogs", closeAllDialogs)
            window.ipcRenderer.removeListener("reset-synth", reset)
        }
    }, [])

    const close = () => {
        if (!hover) setVisible(false)
    }

    const changeWave = (wave: string, newType?: string) => {
        if (!newType) newType = waveType
        let newWave = ""
        if (wave === "sawtooth") {
            if (newType === "basic") {
                newWave = "sawtooth"
            } else {
                newWave = `${newType}sawtooth`
            }
        } else if (wave === "square") {
            if (newType === "basic") {
                newWave = "square"
            } else {
                newWave = `${newType}square`
            }
        } else if (wave === "triangle") {
            if (newType === "basic") {
                newWave = "triangle"
            } else {
                newWave = `${newType}triangle`
            }
        } else if (wave === "sine") {
            if (newType === "basic") {
                newWave = "sine"
            } else {
                newWave = `${newType}sine`
            }
        }
        if (newType === "pulse") newWave = "pulse"
        if (newType === "pwm") newWave = "pwm"
        setWave(newWave)
        setBasicWave(wave)
    }

    const changeWaveType = (type: string) => {
        setWaveType(type)
        changeWave(basicWave, type)
    }

    if (visible) {
        return (
            <section className="synth-dialog" onMouseDown={close}>
                <div className="synth-dialog-box" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
                    <div className="synth-container">
                        <div className="synth-title-container">
                            <p className="synth-title">MIDI Synth</p>
                        </div>
                        <div className="synth-row-container">
                            <div className="synth-row">
                                <SawtoothIcon className={`synth-wave ${basicWave === "sawtooth" && "synth-wave-selected"}`} onClick={() => changeWave("sawtooth")}/>
                                <SquareIcon className={`synth-wave ${basicWave === "square" && "synth-wave-selected"}`} onClick={() => changeWave("square")}/>
                                <TriangleIcon className={`synth-wave ${basicWave === "triangle" && "synth-wave-selected"}`} onClick={() => changeWave("triangle")}/>
                                <SineIcon className={`synth-wave ${basicWave === "sine" && "synth-wave-selected"}`} onClick={() => changeWave("sine")}/>
                            </div>
                            <div className="synth-row">
                                <button className="synth-wave-type" style={{backgroundColor: "#ff5e97"}} onClick={() => changeWaveType("basic")}>Basic</button>
                                <button className="synth-wave-type" style={{backgroundColor: "#ff5ecc"}} onClick={() => changeWaveType("am")}>AM</button>
                                <button className="synth-wave-type" style={{backgroundColor: "#fa75ff"}} onClick={() => changeWaveType("fm")}>FM</button>
                                <button className="synth-wave-type" style={{backgroundColor: "#75b1ff"}} onClick={() => changeWaveType("fat")}>Fat</button>
                                <button className="synth-wave-type" style={{backgroundColor: "#6b81ff"}} onClick={() => changeWaveType("pulse")}>Pulse</button>
                                <button className="synth-wave-type" style={{backgroundColor: "#b35cff"}} onClick={() => changeWaveType("pwm")}>PWM</button>
                            </div>
                            <div className="synth-row">
                                <button className="synth-poly-button" style={{backgroundColor: poly ? "#ff5cab" : "#ff78f8"}} onClick={() => setPoly(!poly)}>{poly ? "Poly" : "Mono"}</button>
                                <div className="synth-porta-container">
                                    <p className="synth-text">Portamento: </p>
                                    <Slider className="synth-slider porta-slider" trackClassName="synth-slider-track" thumbClassName="synth-slider-thumb" 
                                    onChange={(value: number) => setPortamento(value)} min={0} max={0.2} step={0.01} value={portamento}/>
                                </div>
                            </div>
                            <div className="synth-row">
                                <p className="synth-text">Attack: </p>
                                <Slider className="synth-slider" trackClassName="synth-slider-track" thumbClassName="synth-slider-thumb" 
                                onChange={(value: number) => setAttack(value)} min={0} max={0.5} step={0.02} value={attack}/>
                            </div>
                            <div className="synth-row">
                                <p className="synth-text">Decay: </p>
                                <Slider className="synth-slider" trackClassName="synth-slider-track" thumbClassName="synth-slider-thumb" 
                                onChange={(value: number) => setDecay(value)} min={0} max={2} step={0.05} value={decay}/>
                            </div>
                            <div className="synth-row">
                                <p className="synth-text">Sustain: </p>
                                <Slider className="synth-slider" trackClassName="synth-slider-track" thumbClassName="synth-slider-thumb" 
                                onChange={(value: number) => setSustain(value)} min={0} max={1} step={0.02} value={sustain}/>
                            </div>
                            <div className="synth-row">
                                <p className="synth-text">Release: </p>
                                <Slider className="synth-slider" trackClassName="synth-slider-track" thumbClassName="synth-slider-thumb" 
                                onChange={(value: number) => setRelease(value)} min={0} max={2} step={0.05} value={release}/>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        )
    }
    return null
}

export default MIDISynth