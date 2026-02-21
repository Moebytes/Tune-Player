import React, {useEffect, useRef, useState} from "react"
import Slider from "react-slider"
import SawtoothIcon from "../assets/svg/sawtooth.svg"
import SquareIcon from "../assets/svg/square.svg"
import TriangleIcon from "../assets/svg/triangle.svg"
import SineIcon from "../assets/svg/sine.svg"
import "./styles/midisynth.less"

const MIDISynth: React.FunctionComponent = (props) => {
    const [visible, setVisible] = useState(false)
    const [hover, setHover] = useState(false)
    const ref1 = useRef(null)
    const ref2 = useRef(null)
    const ref3 = useRef(null)
    const ref4 = useRef(null)
    const ref5 = useRef(null)

    const initialState = {
        wave: "square",
        basicWave: "square",
        waveType: "basic",
        attack: 0.02,
        decay: 0.5,
        sustain: 0.3,
        release: 0.5,
        poly: true,
        portamento: 0
    }

    const [state, setState] = useState(initialState)

    const reset = () => {
        setState(initialState)
    }

    useEffect(() => {
        const showsynthDialog = (event: any, update: any) => {
            setVisible((prev) => {
                if (prev === true) return false
                if (prev === false) {
                    window.ipcRenderer.invoke("get-synth-state").then((newState) => {
                        setState((prev) => {
                            return {...prev, ...newState}
                        })
                    })
                }
                return true
            })
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

    const changeState = (type: string, value: any) => {
        switch(type) {
            case "attack":
                setState((prev) => {
                    return {...prev, attack: value}
                })
                window.ipcRenderer.invoke("synth", {...state, attack: value})
                break
            case "decay":
                setState((prev) => {
                    return {...prev, decay: value}
                })
                window.ipcRenderer.invoke("synth", {...state, decay: value})
                break
            case "sustain":
                setState((prev) => {
                    return {...prev, sustain: value}
                })
                window.ipcRenderer.invoke("synth", {...state, sustain: value})
                break
            case "release":
                setState((prev) => {
                    return {...prev, release: value}
                })
                window.ipcRenderer.invoke("synth", {...state, release: value})
                break
            case "portamento":
                setState((prev) => {
                    return {...prev, portamento: value}
                })
                window.ipcRenderer.invoke("synth", {...state, portamento: value})
                break
            case "poly":
                setState((prev) => {
                    return {...prev, poly: value}
                })
                window.ipcRenderer.invoke("synth", {...state, poly: value})
                break
            }
    }

    const close = () => {
        if (!hover) setVisible(false)
    }

    const changeWave = (type: string, waveType?: string) => {
        if (!waveType) waveType = state.waveType
        let wave = ""
        if (type === "sawtooth") {
            if (waveType === "basic") {
                wave = "sawtooth"
            } else {
                wave = `${waveType}sawtooth`
            }
        } else if (type === "square") {
            if (waveType === "basic") {
                wave = "square"
            } else {
                wave = `${waveType}square`
            }
        } else if (type === "triangle") {
            if (waveType === "basic") {
                wave = "triangle"
            } else {
                wave = `${waveType}triangle`
            }
        } else if (type === "sine") {
            if (waveType === "basic") {
                wave = "sine"
            } else {
                wave = `${waveType}sine`
            }
        }
        if (waveType === "pulse") wave = "pulse"
        if (waveType === "pwm") wave = "pwm"
        setState((prev) => {
            return {...prev, wave, basicWave: type}
        })
        window.ipcRenderer.invoke("synth", {...state, wave, waveType, basicWave: type})
    }

    const changeWaveType = (type: string) => {
        setState((prev) => {
            return {...prev, waveType: type}
        })
        changeWave(state.basicWave, type)
    }

    const updatePos = (value: number, ref: any, max: number) => {
        value *= (100 / max)
        if (!ref.current) return
        const width = ref.current.slider.clientWidth - 20
        const valuePx = (value / 100) * width
        ref.current.slider.childNodes[0].style = `position: absolute; left: 0px; right: ${width - valuePx}px`
        ref.current.slider.childNodes[1].style = `position: absolute; left: ${valuePx}px; right: 0px`
        ref.current.slider.childNodes[2].ariaValueNow = `${value * 10}`
        ref.current.slider.childNodes[2].style = `position: absolute; touch-action: none; z-index: 1; left: ${valuePx}px`
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
                                <SawtoothIcon className="synth-wave" onClick={() => changeWave("sawtooth")}/>
                                <SquareIcon className="synth-wave" onClick={() => changeWave("square")}/>
                                <TriangleIcon className="synth-wave" onClick={() => changeWave("triangle")}/>
                                <SineIcon className="synth-wave" onClick={() => changeWave("sine")}/>
                            </div>
                            <div className="synth-row">
                                <button className="synth-wave-type" onClick={() => changeWaveType("basic")}>Basic</button>
                                <button className="synth-wave-type" onClick={() => changeWaveType("am")}>AM</button>
                                <button className="synth-wave-type" onClick={() => changeWaveType("fm")}>FM</button>
                                <button className="synth-wave-type" onClick={() => changeWaveType("fat")}>Fat</button>
                                <button className="synth-wave-type" onClick={() => changeWaveType("pulse")}>Pulse</button>
                                <button className="synth-wave-type" onClick={() => changeWaveType("pwm")}>PWM</button>
                            </div>
                            <div className="synth-row">
                                <button className="synth-poly-button" onClick={() => changeState("poly", !state.poly)}>{state.poly ? "Poly" : "Mono"}</button>
                                <div className="synth-porta-container">
                                    <p className="synth-text">Portamento: </p>
                                    <Slider ref={ref1} className="synth-slider porta-slider" trackClassName="synth-slider-track" thumbClassName="synth-slider-thumb" onChange={(value) => {changeState("portamento", Number(value)); updatePos(value, ref1, 0.2)}} min={0} max={0.2} step={0.01} value={state.portamento}/>
                                </div>
                            </div>
                            <div className="synth-row">
                                <p className="synth-text">Attack: </p>
                                <Slider ref={ref2} className="synth-slider" trackClassName="synth-slider-track" thumbClassName="synth-slider-thumb" onChange={(value) => {changeState("attack", Number(value)); updatePos(value, ref2, 0.5)}} min={0} max={0.5} step={0.02} value={state.attack}/>
                            </div>
                            <div className="synth-row">
                                <p className="synth-text">Decay: </p>
                                <Slider ref={ref3} className="synth-slider" trackClassName="synth-slider-track" thumbClassName="synth-slider-thumb" onChange={(value) => {changeState("decay", Number(value)); updatePos(value, ref3, 2)}} min={0} max={2} step={0.05} value={state.decay}/>
                            </div>
                            <div className="synth-row">
                                <p className="synth-text">Sustain: </p>
                                <Slider ref={ref4} className="synth-slider" trackClassName="synth-slider-track" thumbClassName="synth-slider-thumb" onChange={(value) => {changeState("sustain", Number(value)); updatePos(value, ref4, 1)}} min={0} max={1} step={0.02} value={state.sustain}/>
                            </div>
                            <div className="synth-row">
                                <p className="synth-text">Release: </p>
                                <Slider ref={ref5} className="synth-slider" trackClassName="synth-slider-track" thumbClassName="synth-slider-thumb" onChange={(value) => {changeState("release", Number(value)); updatePos(value, ref5, 2)}} min={0} max={2} step={0.05} value={state.release}/>
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