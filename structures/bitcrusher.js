/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Tune Player - A cute music player ❤                       *
 * Copyright © 2026 Moebytes <moebytes.com>                  *
 * Licensed under CC BY-NC 4.0. See license.txt for details. *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

class BitCrushProcessor extends AudioWorkletProcessor {
    static get parameterDescriptors() {
        return [
            {name: "bitDepth", defaultValue: 32, minValue: 1, maxValue: 32}, 
            {name: "sampleRate", defaultValue: 44100, minValue: 100, maxValue: 44100}
        ]
    }
  
    constructor() {
        super()
        this.phase = 0
        this.bitSample = 0
    }
  
    process(inputs, outputs, parameters) {
        const input = inputs[0]
        const output = outputs[0]
  
        const newBitDepth = parameters.bitDepth[0]
        const newSampleRate = parameters.sampleRate[0]
        let frequencyReduction = newSampleRate / sampleRate
        if (Number.isNaN(frequencyReduction)) frequencyReduction = 1
  
        for (let channel = 0; channel < input.length; channel++) {
            const samples = input[channel]
            const newSamples = output[channel]
            let step = Math.pow(0.5, newBitDepth)
  
            for (let i = 0; i < samples.length; ++i) {
                if (parameters.bitDepth.length > 1) step = Math.pow(0.5, parameters.bitDepth[i])
                this.phase += frequencyReduction
                if (this.phase >= 1.0) {
                    this.phase -= 1.0
                    this.bitSample = step * Math.floor(samples[i] / step + 0.5)
                }
                newSamples[i] = this.bitSample
            }
        }
        return true
    }
  }
  
  registerProcessor("bitcrush-processor", BitCrushProcessor)