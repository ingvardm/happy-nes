import { createContext } from 'react'
import {Model} from 'react-better-model'
import Demo from '../services/Demo'
import LocalStorage from '../services/LocalStorage'
import NesEmu from '../services/NesEmu'

const gameViewModelInitialState = {
	rom: null as string | null,
}

export class GameViewModel extends Model<typeof gameViewModelInitialState> {
	public emulatorRef: NesEmu | null = null

	constructor(state = gameViewModelInitialState){
		super(state)
	}

	loadRom = async (rom: string) => {
		this.setValue('rom', rom)
	}

	saveState = () => {
		const state = this.emulatorRef?.getState()

		if(state){
			LocalStorage.set('savedStates', {
				'rom-name': state,
			})
		}
	}

	loadState = () => {
		const states = LocalStorage.get('savedStates')

		if (states) {
			this.emulatorRef?.loadState(states['rom-name'])
		}
	}

	loadDemo = () => {

	}

	playDemo = async () => {
		await this.emulatorRef?.reset()
		this.emulatorRef?.playDemo()
	}

	stopDemo = () => {
		this.emulatorRef?.stop()
	}

	recordDemo = () => {
		this.emulatorRef?.recordDemo()
	}

	stopRecordingDemo = () => {
		const demo = this.emulatorRef?.stopRecordingDemo()

		if(!demo) return

		const a = document.createElement('a')
		const file = new Blob([JSON.stringify(demo.getRawData(), null, 2)], { type: 'text/plain' })
		a.href = URL.createObjectURL(file)
		a.download = 'demo.hnd'
		a.click()
	}
}

const GameViewModelCtx = createContext(new GameViewModel(gameViewModelInitialState))

export default GameViewModelCtx
