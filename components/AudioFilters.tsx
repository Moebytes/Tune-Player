import React, {useEffect, useRef, useState} from "react"
import Slider from "react-slider"
import "./styles/audiofilters.less"

const AudioFilters: React.FunctionComponent = (props) => {
    const [visible, setVisible] = useState(false)
    const [hover, setHover] = useState(false)
    const ref1 = useRef(null)
    const ref2 = useRef(null)
    const ref3 = useRef(null)
    const ref4 = useRef(null)
    const ref5 = useRef(null)
    const ref6 = useRef(null)
    const ref7 = useRef(null)
    const ref8 = useRef(null)

    const initialState = {
        lowpassCutoff: 100,
        highpassCutoff: 0,
        highshelfCutoff: 70,
        filterResonance: 6,
        filterSlope: 0,
        highshelfGain: 0,
        lowshelfCutoff: 30,
        lowshelfGain: 0
    }

    const [state, setState] = useState(initialState)

    const reset = () => {
        setState(initialState)
        window.ipcRenderer.invoke("lowpass", initialState)
        window.ipcRenderer.invoke("highpass", initialState)
        window.ipcRenderer.invoke("highshelf", initialState)
        window.ipcRenderer.invoke("lowshelf", initialState)
    }

    useEffect(() => {
        const showeffectsDialog = (event: any, update: any) => {
            setVisible((prev) => !prev)
        }
        const closeAllDialogs = (event: any, ignore: any) => {
            if (ignore !== "filters") setVisible(false)
        }
        window.ipcRenderer.on("show-filters-dialog", showeffectsDialog)
        window.ipcRenderer.on("close-all-dialogs", closeAllDialogs)
        window.ipcRenderer.on("reset-effects", reset)

        return () => {
            window.ipcRenderer.removeListener("show-filters-dialog", showeffectsDialog)
            window.ipcRenderer.removeListener("close-all-dialogs", closeAllDialogs)
            window.ipcRenderer.removeListener("reset-effects", reset)
        }
    }, [])

    const changeState = (type: string, value: number) => {
        switch(type) {
            case "lowpassCutoff":
                setState((prev) => {
                    return {...prev, lowpassCutoff: value}
                })
                window.ipcRenderer.invoke("lowpass", {...state, lowpassCutoff: value})
                break
            case "highpassCutoff":
                setState((prev) => {
                    return {...prev, highpassCutoff: value}
                })
                window.ipcRenderer.invoke("highpass", {...state, highpassCutoff: value})
                break
            case "highshelfCutoff":
                setState((prev) => {
                    return {...prev, highshelfCutoff: value}
                })
                window.ipcRenderer.invoke("highshelf", {...state, highshelfCutoff: value})
                break
            case "highshelfGain":
                setState((prev) => {
                    return {...prev, highshelfGain: value}
                })
                window.ipcRenderer.invoke("highshelf", {...state, highshelfGain: value})
                break
            case "lowshelfCutoff":
                setState((prev) => {
                    return {...prev, lowshelfCutoff: value}
                })
                window.ipcRenderer.invoke("lowshelf", {...state, lowshelfCutoff: value})
                break
            case "lowshelfGain":
                setState((prev) => {
                    return {...prev, lowshelfGain: value}
                })
                window.ipcRenderer.invoke("lowshelf", {...state, lowshelfGain: value})
                break
            
            case "filterResonance":
                setState((prev) => {
                    return {...prev, filterResonance: value}
                })
                window.ipcRenderer.invoke("lowpass", {...state, filterResonance: value})
                window.ipcRenderer.invoke("highpass", {...state, filterResonance: value})
                window.ipcRenderer.invoke("lowshelf", {...state, filterResonance: value})
                window.ipcRenderer.invoke("highshelf", {...state, filterResonance: value})
                break
            case "filterSlope":
                setState((prev) => {
                    return {...prev, filterSlope: value}
                })
                window.ipcRenderer.invoke("lowpass", {...state, filterSlope: value})
                window.ipcRenderer.invoke("highpass", {...state, filterSlope: value})
                window.ipcRenderer.invoke("lowshelf", {...state, filterSlope: value})
                window.ipcRenderer.invoke("highshelf", {...state, filterSlope: value})
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
            <section className="filters-dialog" onMouseDown={close}>
                <div className="filters-dialog-box" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
                    <div className="filters-container">
                        <div className="filters-title-container">
                            <p className="filters-title">Audio Filters</p>
                        </div>
                        <div className="filters-row-container">
                            <div className="filters-row">
                                <p className="filters-text">Lowpass: </p>
                                <Slider ref={ref1} className="eq-slider" trackClassName="eq-slider-track" thumbClassName="eq-slider-thumb" onChange={(value) => {changeState("lowpassCutoff", value); updatePos(value, ref1, 100)}} min={0} max={100} step={1} value={state.lowpassCutoff}/>
                            </div>
                            <div className="filters-row">
                                <p className="filters-text">Highpass: </p>
                                <Slider ref={ref2} className="eq-slider" trackClassName="eq-slider-track" thumbClassName="eq-slider-thumb" onChange={(value) => {changeState("highpassCutoff", value); updatePos(value, ref2, 100)}} min={0} max={100} step={1} value={state.highpassCutoff}/>
                            </div>
                            <div className="filters-row">
                                <p className="filters-text">Resonance: </p>
                                <Slider ref={ref3} className="eq-slider" trackClassName="eq-slider-track" thumbClassName="eq-slider-thumb" onChange={(value) => {changeState("filterResonance", value); updatePos(value, ref3, 20)}} min={0} max={20} step={1} value={state.filterResonance}/>
                            </div>
                            <div className="filters-row">
                                <p className="filters-text">Slope: </p>
                                <Slider ref={ref4} className="eq-slider" trackClassName="eq-slider-track" thumbClassName="eq-slider-thumb" onChange={(value) => {changeState("filterSlope", value); updatePos(value, ref4, 3)}} min={0} max={3} step={1} value={state.filterSlope}/>
                            </div>
                            <div className="filters-row">
                                <p className="filters-text">Highshelf Freq: </p>
                                <Slider ref={ref5} className="eq-slider" trackClassName="eq-slider-track" thumbClassName="eq-slider-thumb" onChange={(value) => {changeState("highshelfCutoff", value); updatePos(value, ref5, 100)}} min={0} max={100} step={1} value={state.highshelfCutoff}/>
                            </div>
                            <div className="filters-row">
                                <p className="filters-text">Highshelf Gain: </p>
                                <Slider ref={ref6} className="eq-slider" trackClassName="eq-slider-track" thumbClassName="eq-slider-thumb" onChange={(value) => {changeState("highshelfGain", value); updatePos(value + 12, ref6, 24)}} min={-12} max={12} step={1} value={state.highshelfGain}/>
                            </div>
                            <div className="filters-row">
                                <p className="filters-text">Lowshelf Freq: </p>
                                <Slider ref={ref7} className="eq-slider" trackClassName="eq-slider-track" thumbClassName="eq-slider-thumb" onChange={(value) => {changeState("lowshelfCutoff", value); updatePos(value, ref7, 100)}} min={0} max={100} step={1} value={state.lowshelfCutoff}/>
                            </div>
                            <div className="filters-row">
                                <p className="filters-text">Lowshelf Gain: </p>
                                <Slider ref={ref8} className="eq-slider" trackClassName="eq-slider-track" thumbClassName="eq-slider-thumb" onChange={(value) => {changeState("lowshelfGain", value); updatePos(value + 12, ref8, 24)}} min={-12} max={12} step={1} value={state.lowshelfGain}/>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        )
    }
    return null
}

export default AudioFilters