/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Tune Player - A cute music player ❤                       *
 * Copyright © 2026 Moebytes <moebytes.com>                  *
 * Licensed under CC BY-NC 4.0. See license.txt for details. *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

class LFOProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
      return [
          {name: "lfoRate", defaultValue: 1, minValue: 0, maxValue: 100}, 
          {name: "bpm", defaultValue: 150, minValue: 0, maxValue: 1000}
      ]
  }

  constructor() {
    super()
    this.phase = 0
    this.lfoRate = 1
    this.bpm = 150
    this.lfoShape = "square"
    this.port.onmessage = (event) => {
      let {lfoShape} = event.data
      this.lfoShape = lfoShape
    }
  }

  process(inputs, outputs, parameters) {
    const input1 = inputs[0]
    const input2 = inputs[1]
    const output = outputs[0]

    if (!input1?.[0]) return true

    const lfoRate = parameters.lfoRate[0]
    const bpm = parameters.bpm[0]
    if (!Number.isNaN(lfoRate)) this.lfoRate = lfoRate
    if (!Number.isNaN(bpm)) this.bpm = bpm

    const inputLength = input1[0]?.length || 128

    const samplesPerCycle = Math.round(Math.ceil(60/this.bpm * sampleRate) * (2**this.lfoRate/8))

    for (let i = 0; i < inputLength; i++) {
      let lfoValue = this.phase < samplesPerCycle / 2 ? 0 : 1
      if (this.lfoShape === "sine") {
          lfoValue = Math.sin((2 * Math.PI * this.phase) / samplesPerCycle)
      } else if (this.lfoShape === "triangle") {
          const phaseNorm = (2 * this.phase) / samplesPerCycle
          lfoValue = 2 * (phaseNorm - Math.floor(phaseNorm + 0.5))
      } else if (this.lfoShape === "sawtooth") {
          const phaseNorm = this.phase / samplesPerCycle
          lfoValue = 2 * (phaseNorm - Math.floor(phaseNorm + 0.5))
      }

      for (let channel = 0; channel < output.length; channel++) {
        const inputValue1 = input1?.[channel]?.[i] ? input1[channel][i] : 0
        const inputValue2 = input2?.[channel]?.[i] ? input2[channel][i] : 0
        output[channel][i] = lfoValue > 0 ? inputValue1 : inputValue2
      }

      this.phase++
      if (this.phase >= samplesPerCycle) {
        this.phase -= samplesPerCycle
      }
    }
    return true
  }
}

registerProcessor("lfo-processor", LFOProcessor)