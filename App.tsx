import "bootstrap/dist/css/bootstrap.min.css"
import React from "react"
import {createRoot} from "react-dom/client"
import {Provider} from "react-redux"
import TitleBar from "./components/TitleBar"
import RecentPlays from "./components/RecentPlays"
import AudioPlayer from "./components/AudioPlayer"
import AudioEffects from "./components/AudioEffects"
import AudioFilters from "./components/AudioFilters"
import MIDISynth from "./components/MIDISynth"
import ContextMenu from "./components/ContextMenu"
import LocalStorage from "./LocalStorage"
import store from "./store"
import "./index.less"

const App: React.FunctionComponent = () => {
  const onDrop = (event: React.DragEvent) => {
      const file = event.dataTransfer?.files[0] as File & {path: string}
      if (file) window.ipcRenderer.invoke("upload-file", file.path)
  }

  const onDragOver = (event: React.DragEvent) => {
    event.stopPropagation()
    event.preventDefault()
  }

  return (
    <main className="app" onDrop={onDrop} onDragOver={onDragOver}>
      <TitleBar/>
      <ContextMenu/>
      <LocalStorage/>
      <AudioEffects/>
      <AudioFilters/>
      <MIDISynth/>
      <RecentPlays/>
      <AudioPlayer/>
    </main>
  )
}

const root = createRoot(document.getElementById("root")!)
root.render(<Provider store={store}><App/></Provider>)
