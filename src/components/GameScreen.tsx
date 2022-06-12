import { FC, useCallback, useEffect, useMemo, useRef } from 'react'
import { useModelCtx, useModelCtxEvent, useModelCtxState, useModelInstanceState } from 'react-better-model'
import LocalStorage from '../services/LocalStorage'
import NesEmu from '../services/NesEmu'
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../services/NesEmuConfig'
import GameViewModelCtx from '../views/GameViewModel'

const GameScreen: FC<{}> = () => {
	const gameViewModel = useModelCtx(GameViewModelCtx)

	const [rom] = useModelInstanceState(gameViewModel, 'rom')

	const emuInitialized = useRef<boolean>()

	const emu = useMemo(() => {
		return new NesEmu()
	}, [])

	const initializeEmu = useCallback(() => {
		if (!emuInitialized.current){
			emuInitialized.current = true
			gameViewModel.emulatorRef = emu
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
