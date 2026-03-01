import React, {useEffect, useReducer, useState} from "react"
import square from "../assets/images/square.png"
import LeftArrowIcon from "../assets/svg/left-arrow.svg"
import RightArrowIcon from "../assets/svg/right-arrow.svg"
import {SongItem} from "../structures/functions"
import "./styles/recentplays.less"

let recent = [] as SongItem[]
let pages = [] as SongItem[][]

const RecentPlays: React.FunctionComponent = (props) => {
    const [ignored, forceUpdate] = useReducer(x => x + 1, 0)
    const [pageIndex, setPageIndex] = useState(0)
    const [deleteQueue, setDeleteQueue] = useState({})

    useEffect(() => {
        const updateRecentGUI = async () => {
            recent = await window.ipcRenderer.invoke("get-recent")
            let newPages = [] as any
            let counter = 0;
            while (counter < recent.length) {
                let newPage = [] as any
                for (let i = 0; i < 8; i++) {
                    if (!recent[counter]) break
                    newPage.push(recent[counter])
                    counter++
                }
                if (newPage.length) newPages.push(newPage)
            }
            pages = newPages
            forceUpdate()
        }
        updateRecentGUI()
        window.ipcRenderer.on("update-recent-gui", updateRecentGUI)
        return () => {
            window.ipcRenderer.removeListener("update-recent-gui", updateRecentGUI)
        }
    }, [])

    useEffect(() => {
        const triggerRemove = async () => {
            if (Object.keys(deleteQueue).length) {
                window.ipcRenderer.invoke("remove-recent", deleteQueue)
                setDeleteQueue({})
            }
        }
        window.ipcRenderer.on("trigger-remove", triggerRemove)
        return () => {
            window.ipcRenderer.removeListener("trigger-remove", triggerRemove)
        }
    }, [deleteQueue])

    const invokePlay = (info: any) => {
        window.ipcRenderer.invoke("invoke-play", info)
    }

    const generateJSX = () => {
        let row1 = [] as any
        let row2 = [] as any
        for (let i = 0; i < 4; i++) {
            const item = pages[pageIndex]?.[i]
            if (!item) {
                row1.push(<img className="recent-square" src={square}/>)
            } else {
                row1.push(
                    <div className="recent-song-item" data-song={item.song}>
                        <img className="recent-img" onClick={() => invokePlay(item)} src={item.songCover} 
                        onContextMenu={() => setDeleteQueue(item)}/>
                        <div className="recent-song-text-container">
                            <span className="recent-song-text">{item.songName}</span>
                        </div>
                    </div>)
            }
        }
        for (let i = 4; i < 8; i++) {
            const item = pages[pageIndex]?.[i]
            if (!item) {
                row2.push(<img className="recent-square" src={square}/>)
            } else {
                row2.push(
                <div className="recent-song-item" data-song={item.song}>
                    <img className="recent-img" onClick={() => invokePlay(item)} src={item.songCover} 
                    onContextMenu={() => setDeleteQueue(item)}/>
                    <div className="recent-song-text-container">
                        <span className="recent-song-text">{item.songName}</span>
                    </div>
                </div>)
            }
        }
        return (
            <div className="recent-row-container">
                <div className="recent-row">{row1}</div>
                <div className="recent-row">{row2}</div>
            </div>
        )
    }

    const previousPage = () => {
        if (pages[pageIndex - 1]) {
            setPageIndex((prev) => prev - 1)
        }
    }

    const nextPage = () => {
        if (pages[pageIndex + 1]) {
            setPageIndex((prev) => prev + 1)
        }
    }

    return (
        <section className="recent-plays">
            <div className="recent-title-container">
                <p className="recent-title">Recent Plays</p>
                <div className="recent-page-buttons">
                    <LeftArrowIcon className="recent-page-button" onClick={previousPage}/>
                    <RightArrowIcon className="recent-page-button" onClick={nextPage}/>
                </div>
            </div>
            {generateJSX()}
        </section>
    )
}

export default RecentPlays