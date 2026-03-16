/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Tune Player - A cute music player ❤                       *
 * Copyright © 2026 Moebytes <moebytes.com>                  *
 * Licensed under CC BY-NC 4.0. See license.txt for details. *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import fs from "fs"
import path from "path"
import {dialog} from "electron"

const audioExtensions = [".mp3", ".wav", ".ogg", ".flac", ".aac", ".mid"]

export default class MainFunctions {
    public static getSortedFiles = async (dir: string, window: Electron.BrowserWindow) => {
        let files = [] as string[]
        try {
            files = await fs.promises.readdir(dir)
        } catch {
            const result = await dialog.showOpenDialog(window, {
                defaultPath: dir,
                properties: ["createDirectory", "openDirectory"]
            })
            dir = result.filePaths[0]
            if (!dir) return []
            files = await fs.promises.readdir(dir)
        }
        return files
            .filter((f) => audioExtensions.includes(path.extname(f)))
            .map(fileName => ({
                name: fileName,
                time: fs.statSync(`${dir}/${fileName}`).mtime.getTime(),
            }))
            .sort((a, b) => b.time - a.time)
            .map(file => file.name)
    }

    public static removeDirectory = (dir: string) => {
        if (!fs.existsSync(dir)) return
        fs.readdirSync(dir).forEach((file: string) => {
            const current = path.join(dir, file)
            if (fs.lstatSync(current).isDirectory()) {
                MainFunctions.removeDirectory(current)
            } else {
                fs.unlinkSync(current)
            }
        })
        try {
            fs.rmdirSync(dir)
        } catch (e) {
            console.log(e)
        }
    }
}