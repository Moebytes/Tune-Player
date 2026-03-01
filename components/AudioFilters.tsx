/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Tune Player - A cute music player ❤                       *
 * Copyright © 2026 Moebytes <moebytes.com>                  *
 * Licensed under CC BY-NC 4.0. See license.txt for details. *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import React, {useEffect, useState} from "react"
import {usePlaybackSelector, usePlaybackActions} from "../store"
import Slider from "react-slider"
import "./styles/audiofilters.less"

const AudioFilters: React.FunctionComponent = () => {
    const {lowpassCutoff, highpassCutoff, highshelfCutoff, lowshelfCutoff,
        lowshelfGain, highshelfGain, filterResonance, filterSlope
    } = usePlaybackSelector()
    const {setLowpassCutoff, setHighpassCutoff, setHighshelfCutoff, setLowshelfCutoff,
        setLowshelfGain, setHighshelfGain, setFilterResonance, setFilterSlope
    } = usePlaybackActions()

    const [visible, setVisible] = useState(false)
    const [hover, setHover] = useState(false)

    const reset = () => {
        setLowpassCutoff(100)
        setHighpassCutoff(0)
        setHighshelfCutoff(70)
        setFilterResonance(6)
        setFilterSlope(0)
        setHighshelfGain(0)
        setLowshelfCutoff(30)
        setLowshelfGain(0)
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

    const close = () => {
        if (!hover) setVisible(false)
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
                                <Slider className="eq-slider" trackClassName="eq-slider-track" thumbClassName="eq-slider-thumb" 
                                onChange={(value: number) => setLowpassCutoff(value)} min={0} max={100} step={1} value={lowpassCutoff}/>
                            </div>
                            <div className="filters-row">
                                <p className="filters-text">Highpass: </p>
                                <Slider className="eq-slider" trackClassName="eq-slider-track" thumbClassName="eq-slider-thumb" 
                                onChange={(value: number) => setHighpassCutoff(value)} min={0} max={100} step={1} value={highpassCutoff}/>
                            </div>
                            <div className="filters-row">
                                <p className="filters-text">Resonance: </p>
                                <Slider className="eq-slider" trackClassName="eq-slider-track" thumbClassName="eq-slider-thumb" 
                                onChange={(value: number) => setFilterResonance(value)} min={0} max={20} step={1} value={filterResonance}/>
                            </div>
                            <div className="filters-row">
                                <p className="filters-text">Slope: </p>
                                <Slider className="eq-slider" trackClassName="eq-slider-track" thumbClassName="eq-slider-thumb" 
                                onChange={(value: number) => setFilterSlope(value)} min={0} max={3} step={1} value={filterSlope}/>
                            </div>
                            <div className="filters-row">
                                <p className="filters-text">Highshelf Freq: </p>
                                <Slider className="eq-slider" trackClassName="eq-slider-track" thumbClassName="eq-slider-thumb" 
                                onChange={(value: number) => setHighshelfCutoff(value)} min={0} max={100} step={1} value={highshelfCutoff}/>
                            </div>
                            <div className="filters-row">
                                <p className="filters-text">Highshelf Gain: </p>
                                <Slider className="eq-slider" trackClassName="eq-slider-track" thumbClassName="eq-slider-thumb" 
                                onChange={(value: number) => setHighshelfGain(value)} min={-12} max={12} step={1} value={highshelfGain}/>
                            </div>
                            <div className="filters-row">
                                <p className="filters-text">Lowshelf Freq: </p>
                                <Slider className="eq-slider" trackClassName="eq-slider-track" thumbClassName="eq-slider-thumb" 
                                onChange={(value: number) => setLowshelfCutoff(value)} min={0} max={100} step={1} value={lowshelfCutoff}/>
                            </div>
                            <div className="filters-row">
                                <p className="filters-text">Lowshelf Gain: </p>
                                <Slider className="eq-slider" trackClassName="eq-slider-track" thumbClassName="eq-slider-thumb" 
                                onChange={(value: number) => setLowshelfGain(value)} min={-12} max={12} step={1} value={lowshelfGain}/>
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