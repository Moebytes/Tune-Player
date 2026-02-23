import React, {useEffect, useState} from "react"
import {usePlaybackSelector, usePlaybackActions} from "../store"
import Slider from "react-slider"
import "./styles/audioeffects.less"

const AudioEffects: React.FunctionComponent = () => {
    const {sampleRate, reverbMix, reverbDecay, delayMix, delayTime,
        delayFeedback, phaserMix, phaserFrequency
    } = usePlaybackSelector()
    const {setSampleRate, setReverbMix, setReverbDecay, setDelayMix, setDelayTime,
        setDelayFeedback, setPhaserMix, setPhaserFrequency
    } = usePlaybackActions()

    const [visible, setVisible] = useState(false)
    const [hover, setHover] = useState(false)

    const reset = () => {
        setSampleRate(100)
        setReverbMix(0)
        setReverbDecay(1.5)
        setDelayMix(0)
        setDelayTime(0.25)
        setDelayFeedback(0.3)
        setPhaserMix(0)
        setPhaserFrequency(1)
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

    const close = () => {
        if (!hover) setVisible(false)
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
                                <Slider className="fx-slider" trackClassName="fx-slider-track" thumbClassName="fx-slider-thumb" 
                                onChange={(value: number) => setSampleRate(value)} min={0} max={100} step={1} value={sampleRate}/>
                            </div>
                            <div className="effects-row">
                                <p className="effects-text">Reverb Mix: </p>
                                <Slider className="fx-slider" trackClassName="fx-slider-track" thumbClassName="fx-slider-thumb" 
                                onChange={(value: number) => setReverbMix(value)} min={0} max={1} step={0.1} value={reverbMix}/>
                            </div>
                            <div className="effects-row">
                                <p className="effects-text">Reverb Decay: </p>
                                <Slider className="fx-slider" trackClassName="fx-slider-track" thumbClassName="fx-slider-thumb" 
                                onChange={(value: number) => setReverbDecay(value)} min={0.1} max={5} step={0.5} value={reverbDecay}/>
                            </div>
                            <div className="effects-row">
                                <p className="effects-text">Delay Mix: </p>
                                <Slider className="fx-slider" trackClassName="fx-slider-track" thumbClassName="fx-slider-thumb" 
                                onChange={(value: number) => setDelayMix(value)} min={0} max={1} step={0.1} value={delayMix}/>
                            </div>
                            <div className="effects-row">
                                <p className="effects-text">Delay Time: </p>
                                <Slider className="fx-slider" trackClassName="fx-slider-track" thumbClassName="fx-slider-thumb" 
                                onChange={(value: number) => setDelayTime(value)} min={0.1} max={1} step={0.1} value={delayTime}/>
                            </div>
                            <div className="effects-row">
                                <p className="effects-text">Delay Feedback: </p>
                                <Slider className="fx-slider" trackClassName="fx-slider-track" thumbClassName="fx-slider-thumb" 
                                onChange={(value: number) => setDelayFeedback(value)} min={0.1} max={1} step={0.1} value={delayFeedback}/>
                            </div>
                            <div className="effects-row">
                                <p className="effects-text">Phaser Mix: </p>
                                <Slider className="fx-slider" trackClassName="fx-slider-track" thumbClassName="fx-slider-thumb" 
                                onChange={(value: number) => setPhaserMix(value)} min={0} max={1} step={0.1} value={phaserMix}/>
                            </div>
                            <div className="effects-row">
                                <p className="effects-text">Phaser Frequency: </p>
                                <Slider className="fx-slider" trackClassName="fx-slider-track" thumbClassName="fx-slider-thumb" 
                                onChange={(value: number) => setPhaserFrequency(value)} min={1} max={10} step={1} value={phaserFrequency}/>
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