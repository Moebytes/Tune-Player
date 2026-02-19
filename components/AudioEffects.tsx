import React, {useEffect, useRef, useState} from "react"
import Slider from "react-slider"
import "./styles/audioeffects.less"

const AudioEffects: React.FunctionComponent = (props) => {
    const [visible, setVisible] = useState(false)
    const [hover, setHover] = useState(false)
    const ref0 = useRef(null)
    const ref1 = useRef(null)
    const ref2 = useRef(null)
    const ref3 = useRef(null)
    const ref4 = useRef(null)
    const ref5 = useRef(null)
    const ref6 = useRef(null)
    const ref7 = useRef(null)

    const initialState = {
        sampleRate: 100,
        reverbMix: 0,
        reverbDecay: 1.5,
        delayMix: 0,
        delayTime: 0.25,
        delayFeedback: 0.3,
        phaserMix: 0,
        phaserFrequency: 1
    }

    const [state, setState] = useState(initialState)

    const reset = () => {
        setState(initialState)
        window.ipcRenderer.invoke("bitcrush", initialState)
        window.ipcRenderer.invoke("reverb", initialState)
        window.ipcRenderer.invoke("delay", initialState)
        window.ipcRenderer.invoke("phaser", initialState)
    }

    useEffect(() => {
        const showeffectsDialog = (event: any, update: any) => {
            setVisible((prev) => !prev)
        }
        const closeAllDialogs = (event: any, ignore: any) => {
            if (ignore !== "effects") setVisible(false)
        }
        window.ipcRenderer.on("show-effects-dialog", showeffectsDialog)
        window.ipcRenderer.on("close-all-dialogs", closeAllDialogs)
        window.ipcRenderer.on("reset-effects", reset)

        return () => {
            window.ipcRenderer.removeListener("show-effects-dialog", showeffectsDialog)
            window.ipcRenderer.removeListener("close-all-dialogs", closeAllDialogs)
            window.ipcRenderer.removeListener("reset-effects", reset)
        }
    }, [])

    const changeState = (type: string, value: number) => {
        switch(type) {
            case "sampleRate":
                setState((prev) => {
                    return {...prev, sampleRate: value}
                })
                window.ipcRenderer.invoke("bitcrush", {...state, sampleRate: value})
                break
            case "reverbMix":
                setState((prev) => {
                    return {...prev, reverbMix: value}
                })
                window.ipcRenderer.invoke("reverb", {...state, reverbMix: value})
                break
            case "reverbDecay":
                setState((prev) => {
                    return {...prev, reverbDecay: value}
                })
                window.ipcRenderer.invoke("reverb", {...state, reverbDecay: value})
                break
            case "delayMix":
                setState((prev) => {
                    return {...prev, delayMix: value}
                })
                window.ipcRenderer.invoke("delay", {...state, delayMix: value})
                break
            case "delayTime":
                setState((prev) => {
                    return {...prev, delayTime: value}
                })
                window.ipcRenderer.invoke("delay", {...state, delayTime: value})
                break
            case "delayFeedback":
                setState((prev) => {
                    return {...prev, delayFeedback: value}
                })
                window.ipcRenderer.invoke("delay", {...state, delayFeedback: value})
                break
            case "phaserMix":
                setState((prev) => {
                    return {...prev, phaserMix: value}
                })
                window.ipcRenderer.invoke("phaser", {...state, phaserMix: value})
                break
            case "phaserFrequency":
                setState((prev) => {
                    return {...prev, phaserFrequency: value}
                })
                window.ipcRenderer.invoke("phaser", {...state, phaserFrequency: value})
                break
        }
    }

    const close = () => {
        if (!hover) setVisible(false)
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
            <section className="effects-dialog" onMouseDown={close}>
                <div className="effects-dialog-box" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
                    <div className="effects-container">
                        <div className="effects-title-container">
                            <p className="effects-title">Audio Effects</p>
                        </div>
                        <div className="effects-row-container">
                            <div className="effects-row">
                                <p className="effects-text">Sample Rate: </p>
                                <Slider ref={ref0} className="fx-slider" trackClassName="fx-slider-track" thumbClassName="fx-slider-thumb" onChange={(value) => {changeState("sampleRate", value); updatePos(value, ref0, 100)}} min={0} max={100} step={1} value={state.sampleRate}/>
                            </div>
                            <div className="effects-row">
                                <p className="effects-text">Reverb Mix: </p>
                                <Slider ref={ref1} className="fx-slider" trackClassName="fx-slider-track" thumbClassName="fx-slider-thumb" onChange={(value) => {changeState("reverbMix", value); updatePos(value, ref1, 1)}} min={0} max={1} step={0.1} value={state.reverbMix}/>
                            </div>
                            <div className="effects-row">
                                <p className="effects-text">Reverb Decay: </p>
                                <Slider ref={ref2} className="fx-slider" trackClassName="fx-slider-track" thumbClassName="fx-slider-thumb" onChange={(value) => {changeState("reverbDecay", value); updatePos(value - 0.1, ref2, 4.9)}} min={0.1} max={5} step={0.5} value={state.reverbDecay}/>
                            </div>
                            <div className="effects-row">
                                <p className="effects-text">Delay Mix: </p>
                                <Slider ref={ref3} className="fx-slider" trackClassName="fx-slider-track" thumbClassName="fx-slider-thumb" onChange={(value) => {changeState("delayMix", value); updatePos(value, ref3, 1)}} min={0} max={1} step={0.1} value={state.delayMix}/>
                            </div>
                            <div className="effects-row">
                                <p className="effects-text">Delay Time: </p>
                                <Slider ref={ref4} className="fx-slider" trackClassName="fx-slider-track" thumbClassName="fx-slider-thumb" onChange={(value) => {changeState("delayTime", value); updatePos(value - 0.1, ref4, 0.9)}} min={0.1} max={1} step={0.1} value={state.delayTime}/>
                            </div>
                            <div className="effects-row">
                                <p className="effects-text">Delay Feedback: </p>
                                <Slider ref={ref5} className="fx-slider" trackClassName="fx-slider-track" thumbClassName="fx-slider-thumb" onChange={(value) => {changeState("delayFeedback", value); updatePos(value - 0.1, ref5, 0.9)}} min={0.1} max={1} step={0.1} value={state.delayFeedback}/>
                            </div>
                            <div className="effects-row">
                                <p className="effects-text">Phaser Mix: </p>
                                <Slider ref={ref6} className="fx-slider" trackClassName="fx-slider-track" thumbClassName="fx-slider-thumb" onChange={(value) => {changeState("phaserMix", value); updatePos(value, ref6, 1)}} min={0} max={1} step={0.1} value={state.phaserMix}/>
                            </div>
                            <div className="effects-row">
                                <p className="effects-text">Phaser Frequency: </p>
                                <Slider ref={ref7} className="fx-slider" trackClassName="fx-slider-track" thumbClassName="fx-slider-thumb" onChange={(value) => {changeState("phaserFrequency", value); updatePos(value - 1, ref7, 9)}} min={1} max={10} step={1} value={state.phaserFrequency}/>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        )
    }
    return null
}

export default AudioEffects