import React, {useEffect, useState, useRef} from "react"
import {usePlaybackSelector, usePlaybackActions} from "../store"
import path from "path"
import Slider from "react-slider"
import * as Tone from "tone"
import {Midi} from "@tonejs/midi"
import {ID3Writer} from "browser-id3-writer"
import jsmediatags from "jsmediatags"
import functions from "../structures/functions"
import PlayIcon from "../assets/svg/play.svg"
import PauseIcon from "../assets/svg/pause.svg"
import ReverseIcon from "../assets/svg/reverse.svg"
import SpeedIcon from "../assets/svg/speed.svg"
import PitchIcon from "../assets/svg/pitch.svg"
import LoopIcon from "../assets/svg/loop.svg"
import ABLoopIcon from "../assets/svg/abloop.svg"
import RevertIcon from "../assets/svg/revert.svg"
import VolumeIcon from "../assets/svg/volume.svg"
import VolumeLowIcon from "../assets/svg/volume-low.svg"
import VolumeMuteIcon from "../assets/svg/volume-mute.svg"
import PrevIcon from "../assets/svg/prev.svg"
import NextIcon from "../assets/svg/next.svg"
import CheckboxIcon from "../assets/svg/checkbox.svg"
import CheckboxCheckedIcon from "../assets/svg/checkbox-checked.svg"
import placeholder from "../assets/images/placeholder.png"
import midiPlaceholder from "../assets/images/midi-placeholder.png"
import silence from "../assets/silence.mp3"
import audioEncoder from "audio-encoder"
import "./styles/audioplayer.less"

let timer = null as any
let player: Tone.Player
let synths = [] as Tone.PolySynth[]
let audioNode: any
let effectNode: any
let gainNode: any
let soundtouchNode: any
let staticSoundtouchNode: any
let staticSoundtouchNode2: any
let soundtouchURL = ""
let lfoNode: any
let lfoURL = ""
let bitcrusherNode: any

const initialize = async () => {
    player = new Tone.Player(silence).sync().start()
    
    const context = Tone.getContext()
    const soundtouchSource = await window.ipcRenderer.invoke("get-soundtouch-source")
    const soundtouchBlob = new Blob([soundtouchSource], {type: "text/javascript"})
    soundtouchURL = window.URL.createObjectURL(soundtouchBlob)
    await context.addAudioWorkletModule(soundtouchURL, "soundtouch")
    soundtouchNode = context.createAudioWorkletNode("soundtouch-processor")
    staticSoundtouchNode = context.createAudioWorkletNode("soundtouch-processor")
    staticSoundtouchNode2 = context.createAudioWorkletNode("soundtouch-processor")
    const lfoSource = await window.ipcRenderer.invoke("get-lfo-source")
    const lfoBlob = new Blob([lfoSource], {type: "text/javascript"})
    lfoURL = window.URL.createObjectURL(lfoBlob)
    await context.addAudioWorkletModule(lfoURL, "lfo")
    lfoNode = context.createAudioWorkletNode("lfo-processor", {numberOfInputs: 2, outputChannelCount: [2]})
    gainNode = new Tone.Gain(1)

    // @ts-expect-error
    audioNode = new Tone.ToneAudioNode()
    audioNode.input = player
    audioNode.output = gainNode.input
    audioNode.input.chain(soundtouchNode, audioNode.output)
    // @ts-expect-error
    effectNode = new Tone.ToneAudioNode()
    effectNode.input = player
    effectNode.output = gainNode.input
    effectNode.input.chain(effectNode.output)
    audioNode.toDestination()
}

if (typeof window !== "undefined") initialize()

const AudioPlayer: React.FunctionComponent = (props) => {
    const {
        reverse, pitch, speed, volume, muted, loop, abloop,
        loopStart, loopEnd, preservesPitch, duration, song, songName,
        songCover, songUrl, editCode, download, playHover,
        volumeHover, sampleRate, reverbMix, reverbDecay, delayMix, delayTime,
        delayFeedback, phaserMix, phaserFrequency, lowpassCutoff, highpassCutoff, filterResonance,
        filterSlope, highshelfCutoff, highshelfGain, lowshelfCutoff, lowshelfGain, midi,
        midiFile, midiDuration, bpm, wave, basicWave, waveType,
        attack, decay, sustain, release, poly, portamento,
        mouseFlag, savedLoop, pitchLFO, pitchLFORate, stepFlag, splitBands,
        splitBandFreq, previousVolume, paused, seekTo, secondsProgress, progress,
        dragProgress, dragging, abDragging
    } = usePlaybackSelector()
    const {
        setReverse, setPitch, setSpeed, setVolume, setMuted, setLoop, setABLoop,
        setLoopStart, setLoopEnd, setPreservesPitch, setDuration, setSong, setSongName,
        setSongCover, setSongUrl, setEditCode, setDownload, setPlayHover,
        setVolumeHover, setSampleRate, setReverbMix, setReverbDecay, setDelayMix, setDelayTime,
        setDelayFeedback, setPhaserMix, setPhaserFrequency, setLowpassCutoff, setHighpassCutoff, setFilterResonance,
        setFilterSlope, setHighshelfCutoff, setHighshelfGain, setLowshelfCutoff, setLowshelfGain, setMidi,
        setMidiFile, setMidiDuration, setBpm, setWave, setBasicWave, setWaveType,
        setAttack, setDecay, setSustain, setRelease, setPoly, setPortamento,
        setMouseFlag, setSavedLoop, setPitchLFO, setPitchLFORate, setStepFlag, setSplitBands,
        setSplitBandFreq, setPreviousVolume, setPaused, setSeekTo, setSecondsProgress, setProgress,
        setDragProgress, setDragging, setABDragging
    } = usePlaybackActions()
    const [effects, setEffects] = useState([] as {type: string, node: Tone.ToneAudioNode}[])
    const [showSpeedPopup, setShowSpeedPopup] = useState(false)
    const [showPitchPopup, setShowPitchPopup] = useState(false)

    const progressBar = useRef(null) as any
    const volumeBar = useRef(null) as any
    const speedBar = useRef(null) as any
    const pitchBar = useRef(null) as any
    const pitchLFOBar = useRef(null) as any
    const pitchBandBar = useRef(null) as any
    const abSlider = useRef(null) as React.RefObject<any>
    const speedPopup = useRef<HTMLDivElement>(null)
    const pitchPopup = useRef<HTMLDivElement>(null)

    useEffect(() => {
        progressBar.current?.resize()
        abSlider.current?.resize()
        volumeBar.current?.resize()
        speedBar.current?.resize()
        pitchBar.current?.resize()
        pitchLFOBar.current?.resize()
        pitchBandBar.current?.resize()
    })

    useEffect(() => {
        const getOpenedFile = async () => {
            const file = await window.ipcRenderer.invoke("get-opened-file")
            if (file) upload(file)
        }
        getOpenedFile()
        const openFile = (event: any, file: string) => {
            if (file) upload(file)
        }
        const invokePlay = (event: any, info: any) => {
            if (info.songUrl) {
                submit(info.songUrl)
            } else {
                upload(info.song)
            }
        }
        const triggerOpen = () => {
            upload()
        }
        const triggerSave = () => {
            downloadSong()
        }
        
        /* Close speed and pitch boxes */
        const onWindowClick = (event: any) => {
            if (speedPopup.current?.style.display === "flex") {
                if (!(speedPopup.current?.contains(event.target))) {
                    if (event.target !== speedPopup.current) setShowSpeedPopup(false)
                }
            }
            if (pitchPopup.current?.style.display === "flex") {
                if (!(pitchPopup.current?.contains(event.target))) {
                    if (event.target !== pitchPopup.current) setShowPitchPopup(false)
                }
            }
        }

        const onWindowMouseUp = (event: any) => {
            setDragging(false)
            setABDragging(false)
        }
        initState()
        abSlider.current.slider.style.display = "none"
        window.ipcRenderer.on("open-file", openFile)
        window.ipcRenderer.on("invoke-play", invokePlay)
        window.ipcRenderer.on("trigger-open", triggerOpen)
        window.ipcRenderer.on("trigger-save", triggerSave)
        window.addEventListener("click", onWindowClick)
        window.addEventListener("mouseup", onWindowMouseUp)
        return () => {
            window.ipcRenderer.removeListener("open-file", openFile)
            window.ipcRenderer.removeListener("invoke-play", invokePlay)
            window.ipcRenderer.removeListener("trigger-open", triggerOpen)
            window.ipcRenderer.removeListener("trigger-save", triggerSave)
            window.removeEventListener("click", onWindowClick)
            window.removeEventListener("mouseup", onWindowMouseUp)
        }
    }, [])

    useEffect(() => {
        const copyLoop = () => {
            if (abloop && loopEnd) {
                setSavedLoop([loopStart, loopEnd])
            }
        }
        const pasteLoop = () => {
            if (!abloop) toggleAB(true)
            updateABLoop(savedLoop)
        }
        window.ipcRenderer.on("copy-loop", copyLoop)
        window.ipcRenderer.on("paste-loop", pasteLoop)
        return () => {
            
            window.ipcRenderer.removeListener("copy-loop", copyLoop)
            window.ipcRenderer.removeListener("paste-loop", pasteLoop)
        }
    }, [abloop, loopStart, loopEnd])

    
    useEffect(() => {
        /*Update Progress*/
        const updateProgress = () => {
            let percent = (Tone.getTransport().seconds / duration)
            if (!Number.isFinite(percent)) return
            if (!dragging) {
                if (reverse) {
                    setProgress((1-percent) * 100)
                    setSecondsProgress(duration - Tone.getTransport().seconds)
                } else {
                    setProgress(percent * 100)
                    setSecondsProgress(Tone.getTransport().seconds)
                }
            }
            if (!loop) {
                if (Tone.getTransport().seconds > duration - 1) {
                    disposeSynths()
                    Tone.getTransport().pause()
                    Tone.getTransport().seconds = Math.round(duration) - 1
                    setPaused(true)
                }
                if (Tone.getTransport().seconds === Math.round(duration) - 1) Tone.getTransport().seconds = Math.round(duration)
            } else {
                if (midi && Math.floor(Tone.getTransport().seconds) === 0) playMIDI()
                if (Tone.getTransport().seconds > duration) {
                    Tone.getTransport().seconds = 0
                    if (midi) playMIDI()
                }
            }
        }
        const interval = window.setInterval(updateProgress, 1000)
        return () => {
            window.clearInterval(interval)
        }
    }, [reverse, dragging, loop, duration, midi, synths, midiFile, midiDuration, speed, pitch, preservesPitch,
        poly, attack, decay, sustain, release, portamento, wave
    ])

    useEffect(() => {
        /* Precision on shift click */
        const keyDown = (event: KeyboardEvent) => {
            if (event.shiftKey) {
                event.preventDefault()
                setStepFlag(false)
            }
            /* Play on Spacebar */
            if (event.code === "Space") {
                event.preventDefault()
                play()
            }
            /* Search on Enter */
            if (event.key === "Enter") {
                event.preventDefault()
                submit()
            }
            /* Arrow Key Shortcuts */
            if (event.key === "ArrowLeft") {
                event.preventDefault()
                rewind(1)
            }
            if (event.key === "ArrowRight") {
                event.preventDefault()
                fastforward(1)
            }
            if (event.key === "ArrowUp") {
                event.preventDefault()
                updateVolume(volume + 0.05)
            }
            if (event.key === "ArrowDown") {
                event.preventDefault()
                updateVolume(volume - 0.05)
            }
        }

        const keyUp = (event: KeyboardEvent) => {
            if (!event.shiftKey) {
                setStepFlag(true)
            }
        }

        const wheel = (event: WheelEvent) => {
            event.preventDefault()
            const delta = Math.sign(event.deltaY)
            updateVolume(volume - delta * 0.05)
        }

        const mouseDown = () => {
            if (stepFlag) {
                setStepFlag(false)
            }
        }

        window.addEventListener("keydown", keyDown, {passive: false})
        window.addEventListener("keyup", keyUp)
        window.addEventListener("wheel", wheel, {passive: false})
        window.addEventListener("mousedown", mouseDown)
        return () => {
            window.clearInterval(undefined)
            window.removeEventListener("keydown", keyDown)
            window.removeEventListener("keyup", keyUp)
            window.removeEventListener("wheel", wheel)
            window.removeEventListener("mousedown", mouseDown)
        }
    })

    const initState = async () => {
        const saved = await window.ipcRenderer.invoke("get-state")
        const synthSaved = await window.ipcRenderer.invoke("get-synth-state")
        if (saved.preservesPitch !== undefined) {
            setPreservesPitch(Boolean(saved.preservesPitch))
        }
        if (saved.pitchLFO !== undefined) {
            setPitchLFO(Boolean(saved.pitchLFO))
        }
        if (saved.pitchLFORate !== undefined) {
            setPitchLFORate(Number(saved.pitchLFORate))
        }
        if (saved.splitBands !== undefined) {
            setSplitBands(Boolean(saved.splitBands))
        }
        if (saved.splitBandFreq !== undefined) {
            setSplitBandFreq(Number(saved.splitBandFreq))
        }
        if (saved.speed !== undefined) {
            setSpeed(Number(saved.speed))
        }
        if (saved.pitch !== undefined) {
            setPitch(Number(saved.pitch))
        }
        if (saved.reverse !== undefined) {
            setReverse(Boolean(saved.reverse))
        }
        if (saved.loop !== undefined) {
            setLoop(Boolean(saved.loop))
        }
        if (synthSaved.wave !== undefined) setWave(synthSaved.wave)
        if (synthSaved.attack !== undefined) setAttack(Number(synthSaved.attack))
        if (synthSaved.decay !== undefined) setDecay(Number(synthSaved.decay))
        if (synthSaved.sustain !== undefined) setSustain(Number(synthSaved.sustain))
        if (synthSaved.release !== undefined) setRelease(Number(synthSaved.release))
        if (synthSaved.poly !== undefined) setPoly(Boolean(synthSaved.poly))
        if (synthSaved.portamento !== undefined) setPortamento(Number(synthSaved.portamento))
    }

    const refreshState = () => {
        const apply = {player}
        updatePreservesPitch(preservesPitch)
        updateSpeed(speed)
        updatePitch(pitch)
        updatePitchLFO(pitchLFO)
        pitchBands(splitBands)
        updateReverse(reverse, apply)
        updateLoop(loop)
        if (abloop) updateABLoop([loopStart, loopEnd])
    }

    const saveState = () => {
        window.ipcRenderer.invoke("save-state", {reverse, pitch, speed, preservesPitch, 
        pitchLFO, pitchLFORate, splitBands, splitBandFreq, loop, abloop, loopStart, loopEnd})
    }

    const removeEffect = (type: string) => {
        const index = effects.findIndex((e) => e?.type === type)
        if (index !== -1) {
            effects[index] = null as any
            setEffects(effects.filter(Boolean))
        }
    }

    const pushEffect = (type: string, node: Tone.ToneAudioNode) => {
        const obj = {type, node}
        const index = effects.findIndex((e) => e?.type === type)
        if (index !== -1) {
            effects[index] = obj
        } else {
            effects.push(obj)
        }
        setEffects(effects)
    }
    
    const applyEffects = () => {
        if (!soundtouchNode && !staticSoundtouchNode 
        && !staticSoundtouchNode2 && !lfoNode) return
        player?.disconnect()
        soundtouchNode?.disconnect()
        staticSoundtouchNode?.disconnect()
        staticSoundtouchNode2?.disconnect()
        lfoNode.disconnect()
        if (synths.length) synths.forEach((s) => s?.disconnect())
        const nodes = effects.map((e) => e?.node).filter(Boolean)
        if (nodes[0]) nodes.forEach((n) => n?.disconnect())
        if (midi) {
            if (synths.length) synths.forEach((s) => s.chain(...[...nodes, Tone.getDestination()]))
        } else {
            if (pitchLFO) {
                if (splitBands) {
                    const lowband = new Tone.Filter({type: "lowpass", frequency: splitBandFreq, Q: filterResonance, rolloff: getFilterSlope()})
                    const highband = new Tone.Filter({type: "highpass", frequency: splitBandFreq, Q: filterResonance, rolloff: getFilterSlope()})
                    const highbandEffect = new Tone.Filter({type: "highpass", frequency: splitBandFreq, Q: filterResonance, rolloff: getFilterSlope()})
                    audioNode.input = player
                    effectNode.input = player
                    audioNode.input.connect(lowband)
                    audioNode.input.connect(highband)
                    effectNode.input.connect(highbandEffect)

                    lowband.chain(...[staticSoundtouchNode2, ...nodes, audioNode.output])

                    highband.connect(staticSoundtouchNode)
                    highbandEffect.connect(soundtouchNode)
                    staticSoundtouchNode.connect(lfoNode, 0, 0)
                    soundtouchNode.connect(lfoNode, 0, 1)
                    let currentNode = lfoNode
                    for (let i = 0; i < nodes.length; i++) {
                        let node = nodes[i] instanceof Tone.ToneAudioNode ? nodes[i].input : nodes[i]
                        currentNode.connect(node)
                        currentNode = nodes[i]
                    }
                    currentNode.connect(audioNode.output)
                } else {
                    audioNode.input = player
                    effectNode.input = player
                    audioNode.input.connect(staticSoundtouchNode)
                    effectNode.input.connect(soundtouchNode)
                    staticSoundtouchNode.connect(lfoNode, 0, 0)
                    soundtouchNode.connect(lfoNode, 0, 1)
                    let currentNode = lfoNode
                    for (let i = 0; i < nodes.length; i++) {
                        let node = nodes[i] instanceof Tone.ToneAudioNode ? nodes[i].input : nodes[i]
                        currentNode.connect(node)
                        currentNode = nodes[i]
                    }
                    currentNode.connect(audioNode.output)
                }
            } else {
                if (splitBands) {
                    const lowband = new Tone.Filter({type: "lowpass", frequency: splitBandFreq, Q: filterResonance, rolloff: getFilterSlope()})
                    const highband = new Tone.Filter({type: "highpass", frequency: splitBandFreq, Q: filterResonance, rolloff: getFilterSlope()})
                    audioNode.input = player
                    audioNode.input.connect(lowband)
                    audioNode.input.connect(highband)
                    lowband.chain(...[staticSoundtouchNode, ...nodes, audioNode.output])
                    highband.chain(...[soundtouchNode, ...nodes, audioNode.output])
                } else {
                    audioNode.input = player
                    audioNode.input.chain(...[soundtouchNode, ...nodes, audioNode.output])
                }
            }
        }
    }

    const disposeSynths = (synthArray?: any[]) => {
        let array = synthArray ? synthArray : synths
        while (array.length) {
            const synth = array.shift()
            synth?.dispose()
        }
    }

    const switchState = () => {
        if (midi) {
            player.disconnect()
        } else {
            if (synths.length) disposeSynths()
        }
    }

    const updateDuration = (value?: number) => {
        if (!lfoNode) return
        if (value) {
            setDuration(value)
        } else {
            if (!midi) {
                setDuration(player.buffer.duration / player.playbackRate)
                functions.getBPM(player.buffer.get()!).then(({bpm}) => {
                    setBpm(bpm)
                    lfoNode.parameters.get("bpm").value = bpm
                })
            }
        }
    }

    const checkBuffer = () => {
        if (midi) return true
        return player.buffer.loaded
    }

    const play = async (alwaysPlay?: boolean) => {
        if (!checkBuffer()) return
        await Tone.start()
        updateDuration()
        if (Tone.getTransport().state === "started" && !alwaysPlay) {
            if (midi) disposeSynths()
            Tone.getTransport().pause()
            setPaused(true)
        } else {
            if (midi) await playMIDI()
            Tone.getTransport().start()
            setPaused(false)
        }
    }

    const stop = () => {
        if (!checkBuffer()) return
        Tone.getTransport().stop()
    }

    const mute = () => {
        if (muted) {
            setMuted(false)
            Tone.getDestination().mute = false
            if (volume === 0) setVolume(1)
            Tone.getDestination().volume.value = functions.logSlider(volume)
        } else {
            setMuted(true)
            Tone.getDestination().mute = true
        }
    }

    const updateVolume = (value: number) => {
        if (value > 1) value = 1
        if (value < 0) value = 0
        setVolume(value)
        Tone.getDestination().volume.value = functions.logSlider(value)
        if (value <= 0.01) {
            Tone.getDestination().mute = true
            setMuted(true)
        } else {
            Tone.getDestination().mute = false
            setMuted(false)
        }
    }

    const updateSpeed = async (value?: number | string, applyState?: any) => {
        if (!soundtouchNode) return
        let currentSpeed = value !== undefined ? Number(value) : speed
        let currentDuration = player.buffer.duration / currentSpeed
        if (midi) {
            await playMIDI()
        } else {
            let currentPlayer = player
            if (applyState) {
                currentPlayer = applyState.player
            }
            currentPlayer.playbackRate = currentSpeed
            const pitchCorrect = preservesPitch ? 1 / currentSpeed : 1
            soundtouchNode.parameters.get("pitch").value = functions.semitonesToScale(pitch) * pitchCorrect
            let percent = Tone.getTransport().seconds / currentDuration
            setDuration(currentDuration)
            let val = percent * currentDuration
            if (val < 0) val = 0
            if (val > currentDuration - 1) val = currentDuration - 1
            Tone.getTransport().seconds = val
        }
        if (abloop) {
            applyAB(currentDuration)
        } else {
            Tone.getTransport().loopEnd = currentDuration
        }
        saveState()
    }

    useEffect(() => {
        updateSpeed()
    }, [speed, preservesPitch])

    const updatePreservesPitch = (value?: boolean) => {
        setPreservesPitch(value !== undefined ? value : !preservesPitch)
        saveState()
    }

    const updatePitch = async (value?: number | string, applyState?: any) => {
        if (!soundtouchNode) return
        let currentPitch = value !== undefined ? Number(value) : pitch
        if (midi) {
            if (!applyState) await playMIDI()
        } else {
            const pitchCorrect = preservesPitch ? 1 / speed : 1
            soundtouchNode.parameters.get("pitch").value = functions.semitonesToScale(currentPitch) * pitchCorrect
        }
        saveState()
    }

    useEffect(() => {
        updatePitch()
    }, [pitch])

    const updatePitchLFO = (value?: boolean) => {
        setPitchLFO(value !== undefined ? value : !pitchLFO)
        saveState()
    }

    useEffect(() => {
        applyEffects()
    }, [pitch, pitchLFO, pitchLFORate, splitBands, splitBandFreq])

    const updatePitchLFORate = async (value?: number | string) => {
        if (!lfoNode) return
        let currentLFORate = value !== undefined ? Number(value) : pitchLFORate
        lfoNode.parameters.get("lfoRate").value = currentLFORate
        lfoNode.port.postMessage({lfoShape: wave})
        saveState()
    }

    useEffect(() => {
        updatePitchLFORate()
    }, [pitchLFORate, wave])

    const pitchBands = (value?: boolean) => {
        setSplitBands(value !== undefined ? value : !splitBands)
        saveState()
        applyEffects()
    }

    const pitchBandFreq = async (value?: number | string) => {
        setSplitBandFreq(value !== undefined ?  Number(value) : splitBandFreq)
        saveState()
        clearTimeout(timer)
        timer = setTimeout(() => {
            applyEffects()
            timer = null
        }, 100)
    }

    const updateReverse = async (value?: boolean, applyState?: any) => {
        let currentReverse = value !== undefined ? value : reverse
        let percent = Tone.getTransport().seconds / duration
        let val = (1-percent) * duration
        if (val < 0) val = 0
        if (val > duration - 1) val = duration - 1
        if (midi) {
            Tone.getTransport().seconds = val
            await playMIDI()
        } else {
            let currentPlayer = player
            if (applyState) {
                currentPlayer = applyState.player
            }
            if (!applyState) Tone.getTransport().seconds = val
            currentPlayer.reverse = currentReverse
        }
        applyAB(duration)
        saveState()
    }

    useEffect(() => {
        updateReverse()
    }, [reverse])

    const reset = async () => {
        if (!soundtouchNode && !lfoNode) return
        setReverse(false)
        setPitch(0)
        setSpeed(1)
        setVolume(1)
        setMuted(false)
        setLoop(false)
        setABLoop(false)
        setLoopStart(0)
        setLoopEnd(100)
        setPreservesPitch(false)
        setDuration(0)
        setEffects([])
        setPlayHover(false)
        setVolumeHover(false)
        setSampleRate(100)
        setReverbMix(0)
        setReverbDecay(1.5)
        setDelayMix(0)
        setDelayTime(0.25)
        setDelayFeedback(0.5)
        setPhaserMix(0)
        setPhaserFrequency(1)
        setLowpassCutoff(100)
        setHighpassCutoff(0)
        setFilterResonance(6)
        setFilterSlope(0)
        setHighshelfCutoff(70)
        setHighshelfGain(0)
        setLowshelfCutoff(30)
        setLowshelfGain(0)
        setMidiDuration(0)
        setBpm(0)
        setWave("square")
        setBasicWave("square")
        setWaveType("basic")
        setAttack(0.02)
        setDecay(0.5)
        setSustain(0.3)
        setRelease(0.5)
        setPoly(true)
        setPortamento(0)
        setMouseFlag(false)
        setSavedLoop([0, 100])
        setPitchLFO(false)
        setPitchLFORate(1)
        setStepFlag(false)
        setSplitBands(false)
        setSplitBandFreq(500)
        setPreviousVolume(0)
        setPaused(false)
        setSeekTo(null)
        setSecondsProgress(0)
        setProgress(0)
        setDragProgress(null)
        setDragging(false)
        setABDragging(false)

        player.playbackRate = 1
        soundtouchNode.parameters.get("pitch").value = 1
        lfoNode.parameters.get("lfoRate").value = 1
        lfoNode.port.postMessage({lfoShape: "square"})
        player.reverse = false
        Tone.getTransport().loop = false

        abSlider.current.slider.style.display = "none"
        updateDuration()
        stop()
        play()
        window.ipcRenderer.invoke("reset-effects")
        setTimeout(() => {
            applyEffects()
        }, 100)
        saveState()
    }

    const updateLoop = async (value?: boolean) => {
        let condition = value !== undefined ? value === false : loop === true
        if (condition) {
            setLoop(false)
            Tone.getTransport().loop = false
            if (abloop) toggleAB()
        } else {
            setLoop(true)
            Tone.getTransport().loop = true
            Tone.getTransport().loopStart = abloop ? (loopStart / 100) * duration : 0
            Tone.getTransport().loopEnd = abloop ? (loopEnd / 100) * duration : duration
        }
        saveState()
    }

    const seek = (value: number) => {
        setDragging(false)
        let percent = value / 100    
        Tone.getTransport().pause() 
        if (reverse) {
            let value = (1-percent) * duration
            if (value < 0) value = 0
            if (value > duration - 1) value = duration - 1
            Tone.getTransport().seconds = value
        } else {
            let value = percent * duration
            if (value < 0) value = 0
            if (value > duration - 1) value = duration - 1
            Tone.getTransport().seconds = value
        }
        Tone.getTransport().start()
        if (midi) playMIDI()
        let progress = (100 / duration) * Tone.getTransport().seconds
        if (reverse) progress = 100 - progress
        setProgress(progress)
        setSecondsProgress(Tone.getTransport().seconds)
    }

    const rewind = (value: number) => {
        const current = reverse ? duration - Tone.getTransport().seconds : Tone.getTransport().seconds
        const seconds = current - value
        const percent = seconds / duration * 100
        seek(percent)
    }

    const fastforward = (value: number) => {
        const current = reverse ? duration - Tone.getTransport().seconds : Tone.getTransport().seconds
        const seconds = current + value
        const percent = seconds / duration * 100
        seek(percent)
    }

    const updateProgressText = (value: number) => {
        let percent = value / 100
        if (reverse) {
            const secondsProgress = (1-percent) * duration
            setDragProgress(duration - secondsProgress)
        } else {
            const secondsProgress = percent * duration
            setDragProgress(secondsProgress)
        }
    }

    const updateProgressTextAB = (value: number[]) => {
        if (loopStart === value[0]) {
            updateProgressText(value[1])
        } else {
            updateProgressText(value[0])
        }
    }
    
    const updateSynth = () => {
        if (!lfoNode) return
        if (midi) playMIDI()
        lfoNode.port.postMessage({lfoShape: wave})
    }

    useEffect(() => {
        updateSynth()
        window.ipcRenderer.invoke("synth", {wave, basicWave, waveType, attack, 
        decay, sustain, release, poly, portamento})
    }, [wave, basicWave, waveType, attack, decay, 
        sustain, release, poly, portamento])

    const playMIDI = async (applyState?: any) => {
        const localState = applyState ? applyState.state : {midiFile, midiDuration, speed, reverse, pitch, preservesPitch}
        const synthArray = applyState ? applyState.synths : synths
        if (!localState.midiFile) return
        const midi = localState.midiFile as Midi
        disposeSynths(synthArray)
        midi.tracks.forEach((track: any) => {
            let synth = null as any
            if (poly) {
                synth = new Tone.PolySynth(Tone.Synth, {oscillator: {type: wave as any}, envelope: {attack: attack, decay: decay, 
                    sustain: sustain, release: release}, portamento: portamento, volume: -6}).sync()
            } else {
                synth = new Tone.Synth({oscillator: {type: wave as any}, envelope: {attack: attack, decay: decay, sustain: sustain, 
                    release: release}, portamento: portamento, volume: -6}).sync()
            }
            if (!applyState) synth.toDestination()
            synthArray.push(synth)
            if (localState.reverse) {
                const reverseNotes = track.notes.slice().reverse()
                const initialTime = reverseNotes[0].time
                reverseNotes.forEach((reverseNote: any) => {
                    let transposed = reverseNote.name
                    if (localState.preservesPitch) {
                        transposed = functions.transposeNote(reverseNote.name, localState.pitch)
                    } else {
                        transposed = functions.transposeNote(reverseNote.name, localState.pitch + functions.noteFactor(localState.speed))
                    }
                    synth.triggerAttackRelease(transposed, reverseNote.duration / localState.speed, 
                        Math.abs(reverseNote.time - initialTime) / localState.speed, reverseNote.velocity)
                })
            } else {
                track.notes.forEach((note: any) => {
                    let transposed = note.name
                    if (localState.preservesPitch) {
                        transposed = functions.transposeNote(note.name, localState.pitch)
                    } else {
                        transposed = functions.transposeNote(note.name, localState.pitch + functions.noteFactor(localState.speed))
                    }
                    synth.triggerAttackRelease(transposed, note.duration / localState.speed, note.time / localState.speed, note.velocity)
                })
            }
        })
        let totalDuration = midi.duration
        if (!applyState && speed !== 1) {
            let percent = Tone.getTransport().seconds / totalDuration
            totalDuration = (localState.midiDuration / localState.speed)
            let val = percent * totalDuration
            if (val < 0) val = 0
            if (val > totalDuration - 1) val = totalDuration - 1
            Tone.getTransport().seconds = val
        }
        updateDuration(totalDuration)
        applyEffects()
    }

    const uploadMIDI = async (file: string) => {
        setMidi(true)
        const midi = await Midi.fromUrl(file)
        let totalDuration = 0
        midi.tracks.forEach(track => {
            track.notes.forEach(note => {
                if (note.time + note.duration > totalDuration) totalDuration = note.time + note.duration
            })
        })
        setMidiDuration(totalDuration)
        setBpm(midi.header.tempos[0].bpm)
        setSongCover(midiPlaceholder)
        setSongName(path.basename(file).replace(".mid", ""))
        setSong(file)
        setSongUrl("")
        setMidiFile(midi)
        updateRecentFiles()
        switchState()
        stop()
        play(true)
    }

    const upload = async (file?: string) => {
        if (!file) file = await window.ipcRenderer.invoke("select-file")
        if (!file) return
        if (path.extname(file) === ".mid") return uploadMIDI(file)
        if (process.platform === "win32") if (!file.startsWith("file:///")) file = `file:///${file}`
        setMidi(false)
        const fileObject = await functions.getFile(file)
        const tagInfo = await new Promise((resolve, reject) => {
            new jsmediatags.Reader(fileObject).read({onSuccess: (tagInfo: any) => resolve(tagInfo), onError: (error: any) => reject(error)})   
        }).catch(() => null) as any
        const picture = tagInfo?.tags.picture
        if (picture) {
            let b64 = ""
            for (let i = 0; i < picture.data.length; i++) {
                b64 += String.fromCharCode(picture.data[i])
            }
            setSongCover(`data:${picture.format};base64,${btoa(b64)}`)
        } else {
            setSongCover(placeholder)
        }
        setSongName(path.basename(file).replace(".mp3", "").replace(".wav", "").replace(".flac", "").replace(".ogg", ""))
        setSong(file)
        setSongUrl("")
        player.load(file)
        await Tone.loaded()
        updateDuration()
        updateRecentFiles()
        switchState()
        stop()
        play(true)
        refreshState()
    }

    const applyAB = (duration: number, start?: number, end?: number) => {
        if (!abloop) return
        let startPos = start !== undefined ? start : loopStart
        let endPos = end !== undefined ? end : loopEnd
        let percent = duration / 100.0
        if (reverse) {
            Tone.getTransport().loopStart = (100 - endPos) * percent
            Tone.getTransport().loopEnd = (100 - startPos) * percent
        } else {
            Tone.getTransport().loopStart = startPos * percent
            Tone.getTransport().loopEnd = endPos * percent
        }
    }

    const updateABLoop = (value: number[]) => {
        setLoopStart(value[0])
        setLoopEnd(value[1])
        setDragging(false)
        setABDragging(false)
        Tone.getTransport().loop = true
        applyAB(duration, value[0], value[1])
        if (Tone.getTransport().state === "paused") {
            Tone.getTransport().start()
            setPaused(false)
        }
        if (Tone.getTransport().loopStart === Tone.getTransport().loopEnd) {
            Tone.getTransport().loopStart = (Tone.getTransport().loopEnd as number) - 1
        }
        if ((Tone.getTransport().seconds >= Number(Tone.getTransport().loopStart)) 
            && (Tone.getTransport().seconds <= Number(Tone.getTransport().loopEnd))) return
        let val = Number(Tone.getTransport().loopStart)
        if (val < 0) val = 0
        if (val > duration - 1) val = duration - 1
        Tone.getTransport().seconds = val
        if (midi) playMIDI()
        saveState()
    }

    const toggleAB = (value?: boolean) => {
        let condition = value !== undefined ? value === true : abSlider.current.slider.style.display === "none"
        if (condition) {
            abSlider.current.slider.style.display = "flex"
            setABLoop(true)
            setLoop(true)
            if (!loopEnd) setLoopEnd(100)
            Tone.getTransport().loop = true
            Tone.getTransport().loopStart = (loopStart / 100) * duration
            Tone.getTransport().loopEnd = (loopEnd / 100) * duration
        } else {
            abSlider.current.slider.style.display = "none"
            setABLoop(false)
            Tone.getTransport().loopStart = 0
            Tone.getTransport().loopEnd = duration
        }
        saveState()
    }

    const applyState = async (localState: any, player: Tone.Player) => {
        const apply = {state: localState, player}
        player.load(localState.song)
        await Tone.loaded()
        let editCode = ""
        if (localState.speed !== 1) {
            updateSpeed(undefined, apply)
            editCode += "-speed"
        }
        if (localState.reverse !== false) {
            updateReverse(undefined, apply)
            editCode += "-reverse"
        } 
        if (localState.pitch !== 0) {
            updatePitch(undefined, apply)
            editCode += "-pitch"
        }
        if (localState.abloop !== false) {
            editCode += "-loop"
        }
        let effectNodes = [] as any
        if (localState.sampleRate !== 44100) {
            const bit = await bitcrush(localState, true) as any
            effectNodes.push(bit)
            editCode += "-bitcrush"
        }
        if (localState.reverbMix !== 0) {
            const verb = await reverb(localState, true) as Tone.Reverb
            effectNodes.push(verb)
            editCode += "-reverb"
        }
        if (localState.delayMix !== 0) {
            const del = await delay(localState, true) as Tone.PingPongDelay
            effectNodes.push(del)
            editCode += "-delay"
        }
        if (localState.phaserMix !== 0) {
            const phas = await phaser(localState, true) as Tone.Phaser
            effectNodes.push(phas)
            editCode += "-phaser"
        }
        if (localState.lowpassCutoff !== 100) {
            const low = await lowpass(localState, true) as Tone.Filter
            effectNodes.push(low)
            editCode += "-lowpass"
        }
        if (localState.highpassCutoff !== 0) {
            const high = await highpass(localState, true) as Tone.Filter
            effectNodes.push(high)
            editCode += "-highpass"
        }
        if (localState.highshelfGain !== 0) {
            const high = await highshelf(localState, true) as Tone.Filter
            effectNodes.push(high)
            editCode += "-highshelf"
        }
        if (localState.lowshelfGain !== 0) {
            const low = await lowshelf(localState, true) as Tone.Filter
            effectNodes.push(low)
            editCode += "-lowshelf"
        }
        editCode = editCode
        const current = player
        return {current, effectNodes}
    }

    const applyMIDIState = async (localState: any, synths: Tone.PolySynth[]) => {
        const apply = {state: localState, synths}
        await playMIDI(apply)
        let editCode = ""
        if (localState.speed !== 1) {
            editCode += "-speed"
        }
        if (localState.reverse !== false) {
            editCode += "-reverse"
        } 
        if (localState.pitch !== 0) {
            editCode += "-pitch"
        }
        if (localState.abloop !== false) {
            editCode += "-loop"
        }
        let effectNodes = [] as any
        if (localState.sampleRate !== 100) {
            const bit = await bitcrush(localState, true) as any
            effectNodes.push(bit)
            editCode += "-bitcrush"
        }
        if (localState.reverbMix !== 0) {
            const verb = await reverb(localState, true) as Tone.Reverb
            effectNodes.push(verb)
            editCode += "-reverb"
        }
        if (localState.delayMix !== 0) {
            const del = await delay(localState, true) as Tone.PingPongDelay
            effectNodes.push(del)
            editCode += "-delay"
        }
        if (localState.phaserMix !== 0) {
            const phas = await phaser(localState, true) as Tone.Phaser
            effectNodes.push(phas)
            editCode += "-phaser"
        }
        if (localState.lowpassCutoff !== 100) {
            const low = await lowpass(localState, true) as Tone.Filter
            effectNodes.push(low)
            editCode += "-lowpass"
        }
        if (localState.highpassCutoff !== 0) {
            const high = await highpass(localState, true) as Tone.Filter
            effectNodes.push(high)
            editCode += "-highpass"
        }
        if (localState.highshelfGain !== 0) {
            const high = await highshelf(localState, true) as Tone.Filter
            effectNodes.push(high)
            editCode += "-highshelf"
        }
        if (localState.lowshelfGain !== 0) {
            const low = await lowshelf(localState, true) as Tone.Filter
            effectNodes.push(low)
            editCode += "-lowshelf"
        }
        editCode = editCode
        return {synthArray: synths, effectNodes}
    }

     /** Renders the same as online */
     const render = async (start: number, duration: number) => {
        if (!audioNode && !effectNode && !lfoNode) return
        return Tone.Offline(async (offlineContext) => {
            let player = new Tone.Player().sync()
            let synths = [] as Tone.PolySynth[]
            let state = {
                speed, reverse, pitch, abloop, sampleRate, reverbMix, 
                delayMix, phaserMix, lowpassCutoff, highpassCutoff, highshelfGain, lowshelfGain
            }
            if (midi) {
                const {synthArray, effectNodes} = await applyMIDIState(state, synths)
                synthArray.forEach((s) => s.chain(...[...effectNodes, offlineContext.destination]))
            } else {
                let {current, effectNodes} = await applyState(state, player)
                if (!effectNodes) effectNodes = []
                // @ts-expect-error
                const audioNode = new Tone.ToneAudioNode()
                gainNode = new Tone.Gain(1)
                audioNode.input = current
                audioNode.output = gainNode.input
                await offlineContext.addAudioWorkletModule(soundtouchURL, "soundtouch")
                const soundtouchNode = offlineContext.createAudioWorkletNode("soundtouch-processor") as any
                const staticSoundtouchNode = offlineContext.createAudioWorkletNode("soundtouch-processor") as any
                const staticSoundtouchNode2 = offlineContext.createAudioWorkletNode("soundtouch-processor") as any
                const pitchCorrect = preservesPitch ? 1 / speed : 1
                soundtouchNode.parameters.get("pitch").value = functions.semitonesToScale(pitch) * pitchCorrect
                
                if (pitchLFO) {
                    // @ts-expect-error
                    const effectNode = new Tone.ToneAudioNode()
                    effectNode.input = current
                    effectNode.output = gainNode.input
                    await offlineContext.addAudioWorkletModule(lfoURL, "lfo")
                    const lfoNode = offlineContext.createAudioWorkletNode("lfo-processor", {numberOfInputs: 2, outputChannelCount: [2]}) as any
                    lfoNode.parameters.get("bpm").value = bpm
                    lfoNode.parameters.get("lfoRate").value = pitchLFORate
                    lfoNode.port.postMessage({lfoShape: wave})

                    if (splitBands) {
                        const lowband = new Tone.Filter({type: "lowpass", frequency: splitBandFreq, Q: filterResonance, rolloff: getFilterSlope()})
                        const highband = new Tone.Filter({type: "highpass", frequency: splitBandFreq, Q: filterResonance, rolloff: getFilterSlope()})
                        const highbandEffect = new Tone.Filter({type: "highpass", frequency: splitBandFreq, Q: filterResonance, rolloff: getFilterSlope()})
                        audioNode.input = player
                        effectNode.input = player
                        audioNode.input.connect(lowband)
                        audioNode.input.connect(highband)
                        effectNode.input.connect(highbandEffect)
    
                        lowband.chain(...[staticSoundtouchNode2, ...effectNodes, audioNode.output, offlineContext.destination])
                        
                        highband.connect(staticSoundtouchNode)
                        highbandEffect.connect(soundtouchNode)
                        staticSoundtouchNode.connect(lfoNode, 0, 0)
                        soundtouchNode.connect(lfoNode, 0, 1)
                        let currentNode = lfoNode
                        for (let i = 0; i < effectNodes.length; i++) {
                            const node = effectNodes[i] instanceof Tone.ToneAudioNode ? effectNodes[i].input : effectNodes[i]
                            currentNode.connect(node)
                            currentNode = effectNodes[i]
                        }
                        currentNode.connect(audioNode.output)
                        audioNode.connect(offlineContext.destination)
                        audioNode.input.start()
                    } else {
                        audioNode.input.connect(staticSoundtouchNode)
                        effectNode.input.connect(soundtouchNode)
                        staticSoundtouchNode.connect(lfoNode, 0, 0)
                        soundtouchNode.connect(lfoNode, 0, 1)
                        let currentNode = lfoNode
                        for (let i = 0; i < effectNodes.length; i++) {
                            const node = effectNodes[i] instanceof Tone.ToneAudioNode ? effectNodes[i].input : effectNodes[i]
                            currentNode.connect(node)
                            currentNode = effectNodes[i]
                        }
                        currentNode.connect(audioNode.output)
                        audioNode.connect(offlineContext.destination)
                        audioNode.input.start()
                    }
                } else {
                    if (splitBands) {
                        const lowband = new Tone.Filter({type: "lowpass", frequency: splitBandFreq, Q: filterResonance, rolloff: getFilterSlope()})
                        const highband = new Tone.Filter({type: "highpass", frequency: splitBandFreq, Q: filterResonance, rolloff: getFilterSlope()})
                        audioNode.input = player
                        audioNode.input.connect(lowband)
                        audioNode.input.connect(highband)
                        lowband.chain(...[staticSoundtouchNode, ...effectNodes, audioNode.output, offlineContext.destination])
                        highband.chain(...[soundtouchNode, ...effectNodes, audioNode.output, offlineContext.destination])
                        audioNode.input.start()
                    } else {
                        audioNode.input.chain(...[soundtouchNode, ...effectNodes, audioNode.output, offlineContext.destination]).start()
                    }
                }
            }
            offlineContext.transport.start(start)
        }, duration, 2, 44100)
    }

    const downloadSong = async () => {
        if (!checkBuffer()) return
        const defaultPath = `${functions.decodeEntities(songName)}${editCode}`
        const savePath = await window.ipcRenderer.invoke("save-dialog", defaultPath)
        if (!savePath) return
        if (path.extname(savePath) === ".mid") {
            if (!midi) return
            const midiTrack = new Midi()
            midiTrack.header = midiFile.header
            midiFile.tracks.forEach((track: any) => {
                const newTrack = midiTrack.addTrack()
                if (reverse) {
                    const reverseNotes = track.notes.slice().reverse()
                    const initialTime = reverseNotes[0].time
                    reverseNotes.forEach((reverseNote: any) => {
                        let transposed = reverseNote.name
                        if (preservesPitch) {
                            transposed = functions.transposeNote(reverseNote.name, pitch)
                        } else {
                            transposed = functions.transposeNote(reverseNote.name, pitch + functions.noteFactor(speed))
                        }
                        reverseNote.name = transposed
                        reverseNote.duration = reverseNote.duration / speed
                        reverseNote.time = Math.abs(reverseNote.time - initialTime) / speed
                        newTrack.addNote(reverseNote)
                    })
                } else {
                    const notes = track.notes.slice()
                    notes.forEach((note: any) => {
                        let transposed = note.name
                        if (preservesPitch) {
                            transposed = functions.transposeNote(note.name, pitch)
                        } else {
                            transposed = functions.transposeNote(note.name, pitch + functions.noteFactor(speed))
                        }
                        note.name = transposed
                        note.duration = note.duration / speed
                        note.time = note.time / speed
                        newTrack.addNote(note)
                    })
                }
            })
            await window.ipcRenderer.invoke("save-file", savePath, Buffer.from(midiTrack.toArray()))
        } else {
            let currentDuration = duration
            let start = 0
            if (abloop) {
                start = loopStart
                currentDuration = ((loopEnd / 1000) * duration) - ((loopStart / 1000) * duration)
            }
            const audioBuffer = await render(start, currentDuration)
            if (!audioBuffer) return
            if (path.extname(savePath) === ".mp3") {
                audioEncoder(audioBuffer.get(), 320, null, async (blob: Blob) => {
                    let mp3 = await blob.arrayBuffer() as any
                    if (songCover) {
                        const imageBuffer = await fetch(songCover).then((r) => r.arrayBuffer())
                        const writer = new ID3Writer(mp3)
                        writer.setFrame("TIT2", songName)
                        .setFrame("TLEN", currentDuration)
                        .setFrame("APIC" as any, {type: 3, data: imageBuffer, description: "Song Cover", useUnicodeEncoding: false} as any)
                        writer.addTag()
                        mp3 = await fetch(writer.getURL()).then((r) => r.arrayBuffer())
                    }
                    await window.ipcRenderer.invoke("save-file", savePath, Buffer.from(mp3, "binary"))
                    window.ipcRenderer.invoke("show-in-folder", savePath)
                })
            } else {
                audioEncoder(audioBuffer.get(), null, null, async (blob: Blob) => {
                    const wav = await blob.arrayBuffer() as any
                    await window.ipcRenderer.invoke("save-file", savePath, Buffer.from(wav, "binary"))
                    window.ipcRenderer.invoke("show-in-folder", savePath)
                })
            }
        }
    }

    const submit = async (value?: string) => {
        if (!value) return
        const songBuffer = await window.ipcRenderer.invoke("get-song", value)
        if (songBuffer) {
            setMidi(false)
            const songName = await window.ipcRenderer.invoke("get-song-name", value)
            let artwork = await window.ipcRenderer.invoke("get-art", value)
            if (artwork.includes("ytimg")) artwork = await functions.cropToCenterSquare(artwork)
            window.URL.revokeObjectURL(song)
            const blob = new Blob([new DataView(songBuffer)], {type: "audio/mpeg"})
            setSongName(songName)
            setSong(window.URL.createObjectURL(blob))
            setSongCover(artwork)
            setSongUrl(value)
            player.load(window.URL.createObjectURL(blob))
            await Tone.loaded()
            updateDuration()
            updateRecentFiles()
            switchState()
            stop()
            play(true)
            refreshState()
        }
    }

    const updateRecentFiles = () => {
        window.ipcRenderer.invoke("update-recent", {
            songName: songName, 
            song: song,
            songCover: songCover,
            songUrl: songUrl,
            duration: midi ? midiDuration : player.buffer.duration,
            midi: midi,
            bpm: bpm
        })
    }

    const previous = () => {
        window.ipcRenderer.invoke("get-previous", {
            songName: songName, 
            song: song,
            songCover: songCover,
            songUrl: songUrl,
            duration: midi ? duration : player.buffer.duration
        })
    }

    const next = () => {
        window.ipcRenderer.invoke("get-next", {
            songName: songName, 
            song: song,
            songCover: songCover,
            songUrl: songUrl,
            duration: midi ? duration : player.buffer.duration
        })
    }

    const bitcrush = async (effect?: any, noApply?: boolean) => {
        if (sampleRate === 100) {
            removeEffect("bitcrush")
        } else {
            if (!bitcrusherNode) {
                const context = Tone.getContext()
                const bitcrusherSource = await window.ipcRenderer.invoke("get-bitcrusher-source")
                const bitcrusherBlob = new Blob([bitcrusherSource], {type: "text/javascript"})
                const bitcrusherURL = window.URL.createObjectURL(bitcrusherBlob)
                await context.addAudioWorkletModule(bitcrusherURL, "bitcrush")
                bitcrusherNode = context.createAudioWorkletNode("bitcrush-processor")
            }
            bitcrusherNode.parameters.get("sampleRate").value = functions.logSlider2(sampleRate, 100, 44100)
            if (noApply) return bitcrusherNode
            pushEffect("bitcrush", bitcrusherNode)
            applyEffects()
        }
    }

    useEffect(() => {
        bitcrush()
    }, [sampleRate])

    const reverb = async (effect?: any, noApply?: boolean) => {
        if (reverbMix === 0) {
            removeEffect("reverb")
        } else {
            const reverb = new Tone.Reverb({wet: reverbMix, decay: reverbDecay})
            if (noApply) return reverb
            pushEffect("reverb", reverb)
            applyEffects()
        }
    }

    useEffect(() => {
        reverb()
    }, [reverbMix, reverbDecay])

    const delay = async (effect?: any, noApply?: boolean) => {
        if (delayMix === 0) {
            removeEffect("delay")
        } else {
            const delay = new Tone.PingPongDelay({wet: delayMix, delayTime: delayTime, feedback: delayFeedback})
            if (noApply) return delay
            pushEffect("delay", delay)
            applyEffects()
        }
    }

    useEffect(() => {
        delay()
    }, [delayMix, delayTime, delayFeedback])

    const phaser = async (effect?: any, noApply?: boolean) => {
        if (phaserMix === 0) {
            removeEffect("phaser")
        } else {
            const phaser = new Tone.Phaser({wet: phaserMix, frequency: phaserFrequency})
            if (noApply) return phaser
            pushEffect("phaser", phaser)
            applyEffects()
        }
    }
    
    useEffect(() => {
        phaser()
    }, [phaserMix, phaserFrequency])

    const getFilterSlope = () => {
        if (filterSlope === 0) return -12
        if (filterSlope === 1) return -24
        if (filterSlope === 2) return -48
        if (filterSlope === 3) return -96
        return -12
    }

    const lowpass = async (effect?: any, noApply?: boolean) => {
        if (lowpassCutoff === 100) {
            removeEffect("lowpass")
        } else {
            const low = new Tone.Filter({type: "lowpass", frequency: functions.logSlider2(lowpassCutoff, 1, 20000), Q: filterResonance, rolloff: getFilterSlope()})
            if (noApply) return low
            pushEffect("lowpass", low)
            applyEffects()
        }
    }
    
    useEffect(() => {
        lowpass()
    }, [lowpassCutoff, filterResonance, filterSlope])

    const highpass = async (effect?: any, noApply?: boolean) => {
        if (highpassCutoff === 0) {
            removeEffect("highpass")
        } else {
            const high = new Tone.Filter({type: "highpass", frequency: functions.logSlider2(highpassCutoff, 1, 20000), Q: filterResonance, rolloff: getFilterSlope()})
            if (noApply) return high
            pushEffect("highpass", high)
            applyEffects()
        }
    }

    useEffect(() => {
        highpass()
    }, [highpassCutoff, filterResonance, filterSlope])

    const highshelf = async (effect?: any, noApply?: boolean) => {
        if (highshelfGain === 0) {
            removeEffect("highshelf")
        } else {
            const high = new Tone.Filter({type: "highshelf", frequency: functions.logSlider2(highshelfCutoff, 1, 20000), gain: highshelfGain, Q: filterResonance, rolloff: getFilterSlope()})
            if (noApply) return high
            pushEffect("highshelf", high)
            applyEffects()
        }
    }

    useEffect(() => {
        highshelf()
    }, [highshelfCutoff, highshelfGain, filterResonance, filterSlope])

    const lowshelf = async (effect?: any, noApply?: boolean) => {
        if (lowshelfGain === 0) {
            removeEffect("lowshelf")
        } else {
            const low = new Tone.Filter({type: "lowshelf", frequency: functions.logSlider2(lowshelfCutoff, 1, 20000), gain: lowshelfGain, Q: filterResonance, rolloff: getFilterSlope()})
            if (noApply) return low
            pushEffect("lowshelf", low)
            applyEffects()
        }
    }
    
    useEffect(() => {
        lowshelf()
    }, [lowshelfCutoff, lowshelfGain, filterResonance, filterSlope])

    const getLFORate = () => {
        if (pitchLFORate === 5) return "1/1"
        if (pitchLFORate === 4) return "1/2"
        if (pitchLFORate === 3) return "1/4"
        if (pitchLFORate === 2) return "1/8"
        if (pitchLFORate === 1) return "1/16"
        if (pitchLFORate === 0) return "1/32"
        return "1/16"
    }

    const togglePopup = (popup: "speed" | "pitch") => {
        if (popup === "speed") {
            setShowPitchPopup(false)
            setShowSpeedPopup((prev) => !prev)
        } else if (popup === "pitch") {
            setShowSpeedPopup(false)
            setShowPitchPopup((prev) => !prev)
        }
    }

    return (
        <main className="audio-player">
            <section className="player">
                <img className="player-img" src={songCover}/>
                <div className="player-container">
                    <div className="player-row">
                        <div className="player-text-container">
                            <h2 className="player-text">{songName}</h2>
                        </div>
                        <div className="play-button-container">
                            <PrevIcon className="player-button skip-button" onClick={() => previous()}/>
                            {paused ? <PlayIcon className="player-button play-button" onClick={() => play()}/> : 
                            <PauseIcon className="player-button play-button" onClick={() => play()}/>}
                            <NextIcon className="player-button skip-button" onClick={() => next()}/>
                        </div>
                        <div className="progress-text-container">
                            <p className="player-text">
                                <span>{dragging ? functions.formatSeconds(dragProgress || 0) : functions.formatSeconds(secondsProgress)}</span> 
                                <span>/</span> 
                                <span>{functions.formatSeconds(duration)}</span>
                            </p>
                        </div>
                        <div className="volume-container">
                            {volume <= 0.01 ?
                            <VolumeMuteIcon className="player-button volume-button" onClick={() => mute()}/> : 
                            volume <= 0.5 ?
                            <VolumeLowIcon className="player-button volume-button" onClick={() => mute()}/> : 
                            <VolumeIcon className="player-button volume-button" onClick={() => mute()}/>}
                            <Slider className="volume-slider" trackClassName="volume-slider-track" thumbClassName="volume-slider-handle" ref={volumeBar} 
                            onChange={(value: number) => updateVolume(value)} min={0} max={1} step={0.05} value={volume}/>
                        </div>
                    </div>
                    <div className="player-row">
                        <ReverseIcon className={`player-button ${reverse && "active-button"}`} onClick={() => setReverse(!reverse)}/>
                        {showSpeedPopup ? <div className="speed-popup-container" ref={speedPopup}>
                            <div className="speed-popup">
                                <div className="speed-popup-inner-container">
                                    <Slider className="speed-slider" trackClassName="speed-slider-track" thumbClassName="speed-slider-handle" ref={speedBar} 
                                    onChange={(value: number) => setSpeed(value)} min={0.5} max={4} step={0.5} value={speed}/>
                                    <span className="speed-popup-text">{speed}x</span>
                                </div>
                                <div className="speed-popup-inner-container">
                                    <span className="speed-popup-text">Pitch?</span>
                                    {!preservesPitch ?
                                    <CheckboxCheckedIcon className="speed-checkbox" onClick={() => updatePreservesPitch()}/> :
                                    <CheckboxIcon className="speed-checkbox" onClick={() => updatePreservesPitch()}/>}
                                </div>
                            </div>
                        </div> : null}
                        <SpeedIcon className={`player-button ${speed !== 1 && "active-button"}`} onClick={() => togglePopup("speed")}/>
                        {showPitchPopup ? <div className="pitch-popup-container" ref={pitchPopup}>
                            <div className="pitch-popup">
                                <div className="pitch-popup-inner-container">
                                    <Slider className="pitch-slider" trackClassName="pitch-slider-track" thumbClassName="pitch-slider-handle" ref={pitchBar} 
                                    onChange={(value) => setPitch(value)} min={-24} max={24} step={12} value={pitch}/>
                                    <span className="pitch-popup-text">{pitch < 0 ? "" : "+"}{pitch}</span>
                                </div>

                                <div className="pitch-popup-inner-container" style={{gap: "0.3rem"}}>
                                    <span className="pitch-popup-mini-text">LFO?</span>
                                    {pitchLFO ?
                                    <CheckboxCheckedIcon className="pitch-checkbox" onClick={() => updatePitchLFO()}/> : 
                                    <CheckboxIcon className="pitch-checkbox" onClick={() => updatePitchLFO()}/>}
                                    <Slider className="pitch-mini-slider" trackClassName="pitch-mini-slider-track" thumbClassName="pitch-mini-slider-handle" 
                                    ref={pitchLFOBar} onChange={(value: number) => setPitchLFORate(value)} min={0} max={5} step={1} value={pitchLFORate}/>
                                    <span className="pitch-popup-mini-text" style={{width: "40px"}}>{getLFORate()}</span>
                                </div>
                                
                                <div className="pitch-popup-inner-container" style={{gap: "0.3rem"}}>
                                    <span className="pitch-popup-mini-text">Multiband?</span>
                                    {splitBands ?
                                    <CheckboxCheckedIcon className="pitch-checkbox" onClick={() => pitchBands()}/> :
                                    <CheckboxIcon className="pitch-checkbox" onClick={() => pitchBands()}/>}
                                    <Slider className="pitch-mini-slider" trackClassName="pitch-mini-slider-track"
                                    thumbClassName="pitch-mini-slider-handle" ref={pitchBandBar} onChange={(value: number) => pitchBandFreq(value)} 
                                    min={0} max={1000} step={1} value={splitBandFreq}/>
                                    <span className="pitch-popup-mini-text" style={{width: "40px"}}>{splitBandFreq}Hz</span>
                                    
                                </div>
                            </div>
                        </div> : null}
                        <PitchIcon className={`player-button ${pitch !== 0 && "active-button"}`} onClick={() => togglePopup("pitch")}/>
                        <div className="progress-container">
                            <Slider className="progress-slider" trackClassName="progress-slider-track" thumbClassName="progress-slider-handle"
                            ref={progressBar} min={0} max={100} onBeforeChange={() => setDragging(true)} onChange={(value: number) => updateProgressText(value)} 
                            onAfterChange={(value: number) => seek(value)} value={dragging && !abDragging ? ((dragProgress || 0) / duration) * 100 : progress}/>

                            <Slider className="ab-slider" trackClassName="ab-slider-track" thumbClassName="ab-slider-thumb" ref={abSlider} min={0} max={100} 
                            value={[loopStart, loopEnd]} onBeforeChange={() => {setDragging(true); setABDragging(true)}} onChange={(value: number[]) => updateProgressTextAB(value)} 
                            onAfterChange={(value: number[]) => updateABLoop(value)} pearling minDistance={1}/>
                        </div>
                        <LoopIcon className={`player-button ${(loop || abloop) && "active-button"}`} onClick={() => updateLoop()}/>
                        <ABLoopIcon className={`player-button ${abloop && "active-button"}`} onClick={() => toggleAB()}/>
                        <RevertIcon className="player-button" onClick={() => reset()}/>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default AudioPlayer