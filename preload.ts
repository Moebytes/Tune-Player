/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Tune Player - A cute music player ❤                       *
 * Copyright © 2026 Moebytes <moebytes.com>                  *
 * Licensed under CC BY-NC 4.0. See license.txt for details. *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

import {contextBridge, ipcRenderer, webUtils, IpcRendererEvent} from "electron"
import path from "path"

declare global {
  interface Window {
    platform: "mac" | "windows",
    ipcRenderer: {
      invoke: (channel: string, ...args: any[]) => Promise<any>
      send: (channel: string, ...args: any[]) => void
      on: (channel: string, listener: (...args: any[]) => void) => any
      removeListener: (channel: string, listener: (...args: any[]) => void) => void
    },
    shell: {
      showItemInFolder: (path: string) => Promise<void>
    },
    webUtils: {
      getPathForFile: (file: File) => string
    },
    path: {
      basename: (filepath: string, suffix?: string) => Promise<string>
      extname: (filepath: string) => Promise<string>
    }
  }
}

contextBridge.exposeInMainWorld("ipcRenderer", {
    invoke: async (channel: string, ...args: any[]) => {
            return ipcRenderer.invoke(channel, ...args)
    },
    send: (channel: string, ...args: any[]) => {
        ipcRenderer.send(channel, ...args)
    },
    on: (channel: string, listener: (...args: any[]) => void) => {
        const subscription = (event: IpcRendererEvent, ...args: any[]) => listener(event, ...args)

        ipcRenderer.on(channel, subscription)

        return subscription
    },
    removeListener: (channel: string, listener: (...args: any[]) => void) => {
        ipcRenderer.removeListener(channel, listener)
    }
})

contextBridge.exposeInMainWorld("shell", {
    showItemInFolder: async (location: string) => ipcRenderer.invoke("shell:showItemInFolder", location)
})

contextBridge.exposeInMainWorld("webUtils", {
    getPathForFile: (file: File) => webUtils.getPathForFile(file)
})

contextBridge.exposeInMainWorld("path", {
  basename: (filepath: string, suffix?: string) => ipcRenderer.invoke("path:basename", filepath, suffix),
  extname: (filepath: string) => ipcRenderer.invoke("path:extname", filepath)
})

contextBridge.exposeInMainWorld("platform", process.platform === "darwin" ? "mac" : "windows")