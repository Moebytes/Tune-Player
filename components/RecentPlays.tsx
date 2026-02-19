import React, {useEffect, useReducer, useState} from "react"
import square from "../assets/images/square.png"
import pageLeftButton from "../assets/icons/page-left.png"
import pageLeftButtonHover from "../assets/icons/page-left-hover.png"
import pageRightButton from "../assets/icons/page-right.png"
import pageRightButtonHover from "../assets/icons/page-right-hover.png"
import "./styles/recentplays.less"

let recent = [] as any[]
let pages = [] as any

const RecentPlays: React.FunctionComponent = (props) => {
    const [ignored, forceUpdate] = useReducer(x => x + 1, 0)
    const [pageIndex, setPageIndex] = useState(0)
    const [pageLeftHover, setPageLeftHover] = useState(false)
    const [pageRightHover, setPageRightHover] = useState(false)
    const [deleteQueue, setDeleteQueue] = useState({})

    useEffect(() => {
        const updateRecentGUI = async () => {
            recent = await window.ipcRenderer.invoke("get-recent")
            let newPages = [] as any
            let counter = 0;
            while (counter < recent.length - 1) {
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
            window.ipcRenderer.invoke("remove-recent", deleteQueue)
        }
        window.ipcRenderer.on("trigger-remove", triggerRemove)
        return () => {
            window.ipcRenderer.removeListener("trigger-remove", triggerRemove)
        }
    }, [deleteQueue])

    const invokePlay = (info: any) => {
        window.ipcRenderer.invoke("invoke-play", info)
    }

    const checkYT = (info: any) => {
        if (info.songUrl?.includes("youtube.com") || info.songUrl?.includes("youtu.be")) return true
        return false
    }

    const generateJSX = () => {
        let row1 = [] as any
        let row2 = [] as any
        for (let i = 0; i < 4; i++) {
            if (!pages[pageIndex]?.[i]) {
                row1.push(<img className="recent-square" src={square}/>)
            } else {
                row1.push(<img className="recent-img" onClick={() => invokePlay(pages[pageIndex][i])} src={pages[pageIndex][i].songCover} onContextMenu={() => setDeleteQueue(pages[pageIndex][i])}/>)
            }
        }
        for (let i = 4; i < 8; i++) {
            if (!pages[pageIndex]?.[i]) {
                row2.push(<img className="recent-square" src={square}/>)
            } else {
                row2.push(<img className="recent-img" onClick={() => invokePlay(pages[pageIndex][i])} src={pages[pageIndex][i].songCover} onContextMenu={() => setDeleteQueue(pages[pageIndex][i])}/>)
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
                    <img src={pageLeftHover ? pageLeftButtonHover : pageLeftButton} className="recent-page-button" onClick={previousPage} onMouseEnter={() => setPageLeftHover(true)} onMouseLeave={() => setPageLeftHover(false)}/>
                    <img src={pageRightHover ? pageRightButtonHover : pageRightButton} className="recent-page-button" onClick={nextPage} onMouseEnter={() => setPageRightHover(true)} onMouseLeave={() => setPageRightHover(false)}/>
                </div>
            </div>
            {generateJSX()}
        </section>
    )
}

export default RecentPlays