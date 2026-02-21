import React, {useEffect} from "react"
import {useThemeSelector, useThemeActions} from "./store"
import {Themes, OS} from "./reducers/themeReducer"

const lightColorList = {
	"--closeButton": "#ff497d",
	"--minimizeButton": "#ff399c",
	"--maximizeButton": "#ff2eb9",
	"--background": "#ffffff",
	"--navColor": "#ffd6e5",
	"--iconColor": "#ff63a1",
	"--textColor": "#000000",
	"--barColor": "#ffffff"
}

const darkColorList = {
	"--closeButton": "#ff497d",
	"--minimizeButton": "#ff399c",
	"--maximizeButton": "#ff2eb9",
	"--background": "#000000",
	"--navColor": "#29091e",
	"--iconColor": "#ff4c94",
	"--textColor": "#ffffff",
	"--barColor": "#000000"
}

const LocalStorage: React.FunctionComponent = () => {
    const {theme, os} = useThemeSelector()
    const {setTheme, setOS} = useThemeActions()

    useEffect(() => {
        if (typeof window === "undefined") return
        const colorList = theme.includes("light") ? lightColorList : darkColorList
        for (let i = 0; i < Object.keys(colorList).length; i++) {
            const key = Object.keys(colorList)[i]
            const color = Object.values(colorList)[i]
            document.documentElement.style.setProperty(key, color)
        }
    }, [theme])

    useEffect(() => {
        const initTheme = async () => {
            const savedTheme = await window.ipcRenderer.invoke("get-theme")
            if (savedTheme) setTheme(savedTheme as Themes)
        }
        initTheme()
    }, [])

    useEffect(() => {
        window.ipcRenderer.invoke("save-theme", theme)
    }, [theme])


    useEffect(() => {
        const initOS = async () => {
            const savedOS = await window.ipcRenderer.invoke("get-os")
            if (savedOS) setOS(savedOS as OS)
        }
        initOS()
    }, [])

    useEffect(() => {
        window.ipcRenderer.invoke("save-os", os)
    }, [os])

    return null
}

export default LocalStorage