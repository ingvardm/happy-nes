import { FC, useCallback, useEffect, useMemo, useRef } from 'react'
import { useModelCtxEvent, useModelCtxState } from 'react-better-model'
import LocalStorage from '../services/LocalStorage'
import NesEmu from '../services/NesEmu'
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../services/NesEmuConfig'
import GameViewModelCtx from '../views/GameViewModel'

const GameScreen: FC<{}> = () => {
	const [rom] = useModelCtxState(GameViewModelCtx, 'rom')
	const emuInitialized = useRef<boolean>()

	const emu = useMemo(() => {
		return new NesEmu()
	}, [])

	useModelCtxEvent(GameViewModelCtx, 'save-state', () => {
		const state = emu.getState()

		LocalStorage.set('savedStates', {
			'rom-name': state,
		})
	})

	useModelCtxEvent(GameViewModelCtx, 'load-state', () => {
		const states = LocalStorage.get('savedStates')

		if(states){
			emu.loadState(states['rom-name'])
		}
	})

	const initializeEmu = useCallback(() => {
		if (!emuInitialized.current){
			emuInitialized.current = true
			emu.init()
		}
	}, [emuInitialized.current, rom])

	useEffect(() => {
		// emu.init()

		return () => {
			emu.destroy()
		}
	}, [])

	useEffect(() => {
		if (rom){
			initializeEmu()
			emu.loadROM(rom)
		}
	}, [rom])

	return <div className='canvas-wrapper'>
		<canvas
			id='nes-canvas'
			className='scaled'
			width={SCREEN_WIDTH}
			height={SCREEN_HEIGHT}/>
	</div>
}

export default GameScreen
