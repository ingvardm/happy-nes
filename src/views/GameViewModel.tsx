import { createContext } from 'react'
import { Model } from 'react-better-model'
import Demo, { DemoRaw } from '../services/Demo'
import LocalStorage from '../services/LocalStorage'
import NesEmu from '../services/NesEmu'

const gameViewModelInitialState = {
	rom: null as string | null,
}

export class GameViewModel extends Model<typeof gameViewModelInitialState> {
	public emulatorRef: NesEmu | null = null

	constructor(state = gameViewModelInitialState) {
		super(state)
	}

	loadRom = async () => {
		const fileInput = document.createElement('input')

		fileInput.setAttribute('type', 'file')
		fileInput.setAttribute('accept', '.nes')

		fileInput.onchange = async (event) => {
			if (fileInput.files?.length) {
				const rom = fileInput.files[0]
				const reader = new FileReader()

				reader.onload = (ev: ProgressEvent<FileReader>) => {
					if (reader.result) {
						console.log(`ROM loaded ${ev.loaded / 1000}KB`)
						this.setState({rom: reader.result.toString()})
					}

					return {} as any
				}

				reader.readAsBinaryString(rom)

			}
		}

		fileInput.click()
	}

	saveState = () => {
		const state = this.emulatorRef?.getState()

		if (state) {
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
		const fileInput = document.createElement('input')

		fileInput.setAttribute('type', 'file')
		fileInput.setAttribute('accept', '.hnd')

		fileInput.onchange = async (event) => {
			if (fileInput.files?.length) {
				const demoFile = fileInput.files[0]

				const reader = new FileReader()

				reader.onload = (ev: ProgressEvent<FileReader>) => {
					if (reader.result) {
						const demoData: DemoRaw = JSON.parse(reader.result.toString())

						const demo = new Demo(
							demoData.meta,
							demoData.frames,
						)

						this.emulatorRef?.loadDemo(demo)

						console.log(JSON.parse(reader.result.toString()))
					}


					return {} as any
				}

				reader.readAsBinaryString(demoFile)
			}
		}

		fileInput.click()
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

		if (!demo) return

		const a = document.createElement('a')
		const file = new Blob([JSON.stringify(demo.getRawData(), null, 2)], { type: 'text/plain' })

		a.href = URL.createObjectURL(file)
		a.download = 'demo.hnd'
		a.click()
	}
}

const GameViewModelCtx = createContext(new GameViewModel(gameViewModelInitialState))

export default GameViewModelCtx
