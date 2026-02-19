import playTiny from "../assets/icons/playTiny.png"
import playTinyHover from "../assets/icons/playTiny-hover.png"
import pauseTiny from "../assets/icons/pauseTiny.png"
import pauseTinyHover from "../assets/icons/pauseTiny-hover.png"
import {guess} from "web-audio-beat-detector"
import path from "path"

export default class Functions {
    public static arrayIncludes = (str: string, arr: string[]) => {
        for (let i = 0; i < arr.length; i++) {
            if (str.includes(arr[i])) return true
        }
        return false
    }

    public static arrayRemove = <T>(arr: T[], val: T) => {
        return arr.filter((item) => item !== val)
    }

    public static findDupe = (recent: any[], info: any) => {
        for (let i = recent.length - 1; i >= 0; i--) {
            if (recent[i].midi) {
                if (recent[i].bpm === info.bpm
                    && recent[i].songName === info.songName
                    && recent[i].duration === info.duration) return i
            } else {
                if (recent[i].songUrl === info.songUrl
                    && recent[i].songName === info.songName
                    && recent[i].duration === info.duration) return i
            }
        }
        return -1
    }

    public static timeout = async (ms: number) => {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }

    public static logSlider = (position: number) => {
        const minPos = 0
        const maxPos = 1
        const minValue = Math.log(60)
        const maxValue = Math.log(100)
        const scale = (maxValue - minValue) / (maxPos - minPos)
        const value = Math.exp(minValue + scale * (position - minPos))
        let adjusted = value - 100
        if (adjusted > 0) adjusted = 0
        return adjusted
    }

    public static logSlider2 = (position: number, min: number, max: number) => {
        const minPos = 0
        const maxPos = 100
        const minValue = Math.log(min)
        const maxValue = Math.log(max)
        const scale = (maxValue - minValue) / (maxPos - minPos)
        const value = Math.exp(minValue + scale * (position - minPos))
        return value
    }

    public static formatSeconds = (duration: number) => {
        let seconds = Math.floor(duration % 60) as any
        let minutes = Math.floor((duration / 60) % 60) as any
        let hours = Math.floor((duration / (60 * 60)) % 24) as any
        if (Number.isNaN(seconds) || seconds < 0) seconds = 0
        if (Number.isNaN(minutes) || minutes < 0) minutes = 0
        if (Number.isNaN(hours) || hours < 0) hours = 0

        hours = (hours === 0) ? "" : ((hours < 10) ? "0" + hours + ":" : hours + ":")
        minutes = hours && (minutes < 10) ? "0" + minutes : minutes
        seconds = (seconds < 10) ? "0" + seconds : seconds
        return `${hours}${minutes}:${seconds}`
    }

    public static decodeEntities(encodedString: string) {
        const regex = /&(nbsp|amp|quot|lt|gt);/g
        const translate = {
            nbsp:" ",
            amp : "&",
            quot: "\"",
            lt  : "<",
            gt  : ">"
        } as any
        return encodedString.replace(regex, function(match, entity) {
            return translate[entity]
        }).replace(/&#(\d+);/gi, function(match, numStr) {
            const num = parseInt(numStr, 10)
            return String.fromCharCode(num)
        })
    }

    public static round = (value: number, step?: number) => {
        if (!step) step = 1.0
        const inverse = 1.0 / step
        return Math.round(value * inverse) / inverse
    }

    public static streamToBuffer = async (stream: NodeJS.ReadableStream) => {
        const chunks: any[] = []
        const arr = await new Promise<Buffer>((resolve, reject) => {
            stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)))
            stream.on("error", (err) => reject(err))
            stream.on("end", () => resolve(Buffer.concat(chunks)))
        })
        return arr.buffer
    }

    public static getFile = async (filepath: string) => {
        const blob = await fetch(filepath).then((r) => r.blob())
        const name = path.basename(filepath).replace(".mp3", "").replace(".wav", "").replace(".flac", "").replace(".ogg", "")
        // @ts-ignore
        blob.lastModifiedDate = new Date()
        // @ts-ignore
        blob.name = name
        return blob as File
    }

    public static flipPlayTitle = () => {
        const button = document.querySelector(".title-bar-button.play-title-button") as HTMLImageElement
        const name = path.basename(button?.src ?? "")
        if (name.includes("hover")) {
            if (name.includes("play")) {
                button.src = pauseTinyHover
            } else {
                button.src = playTinyHover
            }
        } else {
            if (name.includes("play")) {
                button.src = pauseTiny
            } else {
                button.src = playTiny
            }
        }
    }

    public static transposeNote = (note: string, transpose: number) => {
        const octave = Number(note.match(/\d+/)?.[0])
        note = note.replace(/\d+/g, "")
        const octaveAdjustment = Math.round(transpose / 12)
        const noteAdjustment = transpose - (octaveAdjustment * 12)
        const notes = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"]
        const noteIndex = notes.findIndex((n) => n === note)
        let adjusted = noteIndex + noteAdjustment
        while (adjusted > 12) adjusted -= 12
        while (adjusted < 0) adjusted += 12
        return `${notes[adjusted]}${octave + octaveAdjustment}`
    }

    public static noteFactor = (scaleFactor: number) => {
        if (scaleFactor === 1) return 0
        if (scaleFactor < 1) {
            return Math.round(-1 * ((1 / scaleFactor) * 6))
        } else {
            return Math.round(scaleFactor * 6)
        }
    }

    public static escapeQuotes = (str: string) => {
        return str.replace(/"/g, `"\\""`).replace(/'/g, `'\\''`)
    }

    public static semitonesToScale = (semitones: number) => {
        var scaleFactor = Math.pow(2, semitones / 12)
        scaleFactor = Math.max(0.25, scaleFactor)
        scaleFactor = Math.min(4, scaleFactor)
        return scaleFactor
    }

    public static getBPM = async (audioBuffer: AudioBuffer) => {
        return guess(audioBuffer)
    }

    public static fractionEval = (fraction: string) => {
        const [numerator, denominator] = fraction.split("/").map(Number)
        return numerator / denominator
    }

    public static cropToCenterSquare = (image: string) => {
        const img = new Image()
        img.src = image
        return new Promise<string>((resolve) => {
            img.onload = () => {
                const minDimension = Math.min(img.width, img.height)
                const offsetX = (img.width - minDimension) / 2
                const offsetY = (img.height - minDimension) / 2

                const canvas = document.createElement("canvas")
                canvas.width = minDimension
                canvas.height = minDimension
                const ctx = canvas.getContext("2d")

                if (ctx) {
                    ctx.drawImage(img, offsetX, offsetY, minDimension, minDimension, 0, 0, minDimension, minDimension)
                    const base64 = canvas.toDataURL("image/png")
                    resolve(base64)
                }
            }
        })
    }

    public static computedVar = (variable: string) => {
        if (typeof window === "undefined") return "#FF579D"
        return window.getComputedStyle(document.documentElement).getPropertyValue(variable)
    }

    public static colorizeSVG = (svg: string, varColor: string) => {
        let code = svg
        let isBase64 = svg.startsWith("data:image/svg+xml;base64,")
        let hexColor = varColor.startsWith("#") ? varColor : Functions.computedVar(varColor)

        if (isBase64) {
            const base64 = svg.replace("data:image/svg+xml;base64,", "")
            code = new TextDecoder("utf-8").decode(Uint8Array.from(atob(base64), c => c.charCodeAt(0)))
        }

        const updated = code
            .replace(/fill\s*=\s*"(black|#000000|#000|rgb\(\s*0\s*,\s*0\s*,\s*0\s*\))"/gi, `fill="${hexColor}"`)
            .replace(/stroke\s*=\s*"(black|#000000|#000|rgb\(\s*0\s*,\s*0\s*,\s*0\s*\))"/gi, `stroke="${hexColor}"`)

        if (isBase64) {
            const encoded = btoa(String.fromCharCode(...new TextEncoder().encode(updated)))
            return `data:image/svg+xml;base64,${encoded}`
        }

        return updated
    }
}