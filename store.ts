import {configureStore} from "@reduxjs/toolkit"
import themeReducer, {useThemeSelector, useThemeActions} from "./reducers/themeReducer"
import playbackReducer, {usePlaybackSelector, usePlaybackActions} from "./reducers/playbackReducer"

const store = configureStore({
    reducer: {
        theme: themeReducer,
        playback: playbackReducer
    },
})

export type StoreState = ReturnType<typeof store.getState>
export type StoreDispatch = typeof store.dispatch

export {
    useThemeSelector, useThemeActions
}

export default store