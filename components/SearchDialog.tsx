/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Tune Player - A cute music player ❤                       *
 * Copyright © 2026 Moebytes <moebytes.com>                  *
 * Licensed under CC BY-NC 4.0. See license.txt for details. *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import React, {useEffect, useState, useRef} from "react"
import SearchIcon from "../assets/svg/search.svg"
import "./styles/searchdialog.less"

const SearchDialog: React.FunctionComponent = (props) => {
    const [visible, setVisible] = useState(false)
    const [hover, setHover] = useState(false)
    const searchBox = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const showSearchDialog = (event: any) => {
            setVisible((prev) => !prev)
        }
        const closeAllDialogs = (event: any, ignore: any) => {
            if (ignore !== "search") setVisible(false)
        }
        window.ipcRenderer.on("show-search-dialog", showSearchDialog)
        window.ipcRenderer.on("close-all-dialogs", closeAllDialogs)
        return () => {
            window.ipcRenderer.removeListener("show-search-dialog", showSearchDialog)
            window.ipcRenderer.removeListener("close-all-dialogs", closeAllDialogs)
        }
    }, [])

    useEffect(() => {
        const enterPressed = () => {
            if (visible) search()
        }
        const escapePressed = () => {
            if (visible) setVisible(false)
        }
        window.ipcRenderer.on("enter-pressed", enterPressed)
        window.ipcRenderer.on("escape-pressed", escapePressed)
        return () => {
            window.ipcRenderer.removeListener("enter-pressed", enterPressed)
            window.ipcRenderer.removeListener("escape-pressed", escapePressed)
        }
    })

    const close = () => {
        setTimeout(() => {
            if (!hover) setVisible(false)
        }, 100)
    }

    const search = async () => {
        const text = searchBox.current!.value
        searchBox.current!.value = ""
        if (text) {
            const status = await fetch(text).then((r) => r.status)
            if (status !== 404) window.ipcRenderer.invoke("trigger-search", text)
        }
        setVisible(false)
    }

    if (visible) {
        return (
            <section className="search-dialog" onMouseDown={close}>
                <div className="search-dialog-box" onMouseOver={() => setHover(true)} onMouseLeave={() => setHover(false)}>
                    <div className="search-dialog-container">
                        <form className="search-dialog-bar">
                            <input type="text" className="search-dialog-input" ref={searchBox} placeholder="Soundcloud link..." spellCheck="false"/>
                            
                            <button onClick={(event) => {event.preventDefault(); search()}} className="search-dialog-button">
                                <SearchIcon classname="search-dialog-icon"/>
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        )
    }
    return null
}

export default SearchDialog