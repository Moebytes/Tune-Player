## Tune Player
   
<img src="assets/images/readme.png">

A cute music player!

### Features:
- Play audio (MP3, WAV, OGG, FLAC) and MIDI files
- Reverse playback
- Speed adjustment (can either preserve or affect the pitch)
- Pitch shifting (and LFO pitch effect)
- Looping from point A to point B
- Audio filters and effects (lowpass, highpass, reverb, delay, bitcrush)
- Support for YouTube videos, Soundcloud tracks, and Bandcamp tracks
- Render and download audio/midi with effects
- Stores your recent plays for easy access
- Customize the controls of the MIDI synthesizer

### Keyboard Shortcuts
- Space: Play/Pause
- Left Arrow: Rewind
- Right Arrow: Fast forward
- Up Arrow: Increase volume
- Down Arrow: Decrease volume
- Mouse Wheel: Increase/decrease volume
- Ctrl O: Upload file
- Ctrl S: Download file
- Drag and drop: Upload file

### Node.js

Downloading some YouTube tracks will require Node.js. You must install it separately: https://nodejs.org/en

### Design

Our design is available here: https://www.figma.com/design/CTEs64SQjKg7M1SXzGx0Kh/Tune-Player

### Installation

Download from [releases](https://github.com/Moebytes/Tune-Player/releases). 

### MacOS

On MacOS unsigned applications won't open, run this to remove the quarantine flag.
```
xattr -d com.apple.quarantine "/Applications/Tune Player.app"
```

### See Also

- [Pic Viewer](https://github.com/Moebytes/Pic-Viewer)
- [Motion Player](https://github.com/Moebytes/Motion-Player)

