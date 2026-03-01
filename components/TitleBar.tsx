/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Tune Player - A cute music player ❤                       *
 * Copyright © 2026 Moebytes <moebytes.com>                  *
 * Licensed under CC BY-NC 4.0. See license.txt for details. *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import React, {useState} from "react"
import {useThemeSelector, useThemeActions} from "../store"
import CircleIcon from "../assets/svg/circle.svg"
import CircleCloseIcon from "../assets/svg/circle-close.svg"
import CircleMinimizeIcon from "../assets/svg/circle-minimize.svg"
import CircleMaximizeIcon from "../assets/svg/circle-maximize.svg"
import CloseIcon from "../assets/svg/close.svg"
import MinimizeIcon from "../assets/svg/minimize.svg"
import MaximizeIcon from "../assets/svg/maximize.svg"
import Icon from "../assets/svg/icon.svg"
import UploadIcon from "../assets/svg/upload.svg"
import DownloadIcon from "../assets/svg/download.svg"
import SearchIcon from "../assets/svg/search.svg"
import SawtoothIcon from "../assets/svg/sawtooth.svg"
import EQIcon from "../assets/svg/eq.svg"
import FXIcon from "../assets/svg/fx.svg"
import TransparentIcon from "../assets/svg/transparent.svg"
import PinIcon from "../assets/svg/pin.svg"
import LightIcon from "../assets/svg/light.svg"
import DarkIcon from "../assets/svg/dark.svg"
import WindowsIcon from "../assets/svg/windows.svg"
import MacIcon from "../assets/svg/mac.svg"
import "./styles/titlebar.less"

const TitleBar: React.FunctionComponent = (props) => {
    const {theme, os, transparent, pinned} = useThemeSelector()
    const {setTheme, setOS, setTransparent, setPinned} = useThemeActions()
    const [iconHover, setIconHover] = useState(false)

    const onMouseDown = () => {
        window.ipcRenderer.send("moveWindow")
    }

    const close = () => {
        window.ipcRenderer.invoke("close")
    }

    const minimize = async () => {
        await window.ipcRenderer.invoke("minimize")
        setIconHover(false)
    }

    const maximize = () => {
        window.ipcRenderer.invoke("maximize")
    }

    const upload = () => {
        window.ipcRenderer.invoke("trigger-open")
    }

    const download = () => {
        window.ipcRenderer.invoke("trigger-save")
    }

    const search = () => {
        window.ipcRenderer.invoke("show-search-dialog")
    }

    const fx = () => {
        window.ipcRenderer.invoke("audio-effects")
    }

    const eq = () => {
        window.ipcRenderer.invoke("audio-filters")
    }

    const synth = () => {
        window.ipcRenderer.invoke("midi-synth")
    }

    const switchTheme = () => {
        setTheme(theme === "light" ? "dark" : "light")
    }

    const switchOSStyle = () => {
        setOS(os === "mac" ? "windows" : "mac")
    }

    const switchTransparency = () => {
        setTransparent(!transparent)
    }

    const switchPinned = () => {
        setPinned(!pinned)
    }

    const macTitleBar = () => {
        return (
            <div className="title-group-container">
                <div className="title-mac-container" onMouseEnter={() => setIconHover(true)} onMouseLeave={() => setIconHover(false)}>
                    {iconHover ? <>
                    <CircleCloseIcon className="title-mac-button" color="var(--closeButton)" onClick={close}/>
                    <CircleMinimizeIcon className="title-mac-button" color="var(--minimizeButton)" onClick={minimize}/>
                    <CircleMaximizeIcon className="title-mac-button" color="var(--maximizeButton)" onClick={maximize}/>
                    </> : <>
                    <CircleIcon className="title-mac-button" color="var(--closeButton)" onClick={close}/>
                    <CircleIcon className="title-mac-button" color="var(--minimizeButton)" onClick={minimize}/>
                    <CircleIcon className="title-mac-button" color="var(--maximizeButton)" onClick={maximize}/>
                    </>}
                </div>
                <div className="title-container">
                    <Icon className="app-icon"/>
                    <span className="title">Tune Player</span>
                </div>
                <div className="title-button-container">
                    <UploadIcon className="title-bar-button" onClick={upload}/>
                    <DownloadIcon className="title-bar-button" onClick={download}/>
                    <SearchIcon className="title-bar-button" onClick={search}/>
                    <SawtoothIcon className="title-bar-button" onClick={synth}/>
                    <EQIcon className="title-bar-button" onClick={eq}/>
                    <FXIcon className="title-bar-button" onClick={fx}/>
                    <TransparentIcon className="title-bar-button" onClick={switchTransparency}/>
                    <PinIcon className={`title-bar-button ${pinned && "title-button-active"}`} onClick={switchPinned}/>
                    {theme === "light" ?
                    <LightIcon className="title-bar-button" onClick={switchTheme}/> :
                    <DarkIcon className="title-bar-button" onClick={switchTheme}/>}
                    <MacIcon className="title-bar-button" onClick={switchOSStyle}/>
                </div>
            </div>
        )
    }

    const windowsTitleBar = () => {
        return (
            <>
            <div className="title-group-container">
                <div className="title-container">
                    <Icon className="app-icon"/>
                    <span className="title">Tune Player</span>
                </div>
                <div className="title-button-container">
                    <UploadIcon className="title-bar-button" onClick={upload}/>
                    <DownloadIcon className="title-bar-button" onClick={download}/>
                    <SearchIcon className="title-bar-button" onClick={search}/>
                    <SawtoothIcon className="title-bar-button" onClick={synth}/>
                    <EQIcon className="title-bar-button" onClick={eq}/>
                    <FXIcon className="title-bar-button" onClick={fx}/>
                    <TransparentIcon className="title-bar-button" onClick={switchTransparency}/>
                    <PinIcon className={`title-bar-button ${pinned && "title-button-active"}`} onClick={switchPinned}/>
                    {theme === "light" ?
                    <LightIcon className="title-bar-button" onClick={switchTheme}/> :
                    <DarkIcon className="title-bar-button" onClick={switchTheme}/>}
                    <WindowsIcon className="title-bar-button" onClick={switchOSStyle}/>
                </div>
            </div>
            <div className="title-group-container">
                <div className="title-win-container">
                    <MinimizeIcon className="title-win-button" color="var(--minimizeButton)" onClick={minimize}/>
                    <MaximizeIcon className="title-win-button" color="var(--maximizeButton)" onClick={maximize} style={{marginLeft: "4px"}}/>
                    <CloseIcon className="title-win-button" color="var(--closeButton)" onClick={close}/>
                </div>
            </div>
            </>
        )
    }

    return (
        <section className="title-bar" onMouseDown={onMouseDown}>
                <div className="title-bar-drag-area">
                    {os === "mac" ? macTitleBar() : windowsTitleBar()}
                </div>
        </section>
    )
}

export default TitleBar