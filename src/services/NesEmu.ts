import { ButtonKey, EmulatorData, NES } from 'jsnes'

import Controller, { GAMEPAD_KEY_MAP } from './Controller'
import Demo, { DemoFrame } from './Demo'
import GamepadService from './Gamepad'
import {
	AUDIO_BUFFERING,
	FRAMEBUFFER_SIZE,
	SAMPLE_COUNT,
	SAMPLE_MASK,
	SCREEN_HEIGHT,
	SCREEN_WIDTH,
	TARGET_FRAME_TIME,
} from './NesEmuConfig'

class NesEmu {
	//#region audio
	private audioSamplesLeft = new Float32Array(SAMPLE_COUNT)
	private audioSamplesRight = new Float32Array(SAMPLE_COUNT)
	private audioWriteCursor = 0
	private audioReadCursor = 0
	//#endregion audio

	//#region video
	private canvasCtx: CanvasRenderingContext2D | null = null
	private frame: ImageData = new ImageData(SCREEN_WIDTH, SCREEN_HEIGHT)
	private framebuffer_u8: Uint8ClampedArray = new Uint8ClampedArray()
	private framebuffer_u32: Uint32Array = new Uint32Array()
	//#endregion video

	private frameCounter = 0

	private isRunning = false

	private onNesFrame = (framebuffer_24: Buffer) => {
		for (let i = 0; i < FRAMEBUFFER_SIZE; i++) {
			this.framebuffer_u32[i] = 0xFF000000 | framebuffer_24[i]
		}
	}

	private onNesAudioSample = (l: number, r: number) => {
		this.audioSamplesLeft[this.audioWriteCursor] = l
		this.audioSamplesRight[this.audioWriteCursor] = r
		this.audioWriteCursor = (this.audioWriteCursor + 1) & SAMPLE_MASK
	}

	private renderFrame = () => {
		const frameStart = Date.now()
		// this.emu.frame()
		this.frame.data.set(this.framebuffer_u8)
		this.canvasCtx?.putImageData(this.frame, 0, 0)

		const frameEnd = Date.now()

		if (this.isRunning) {
			const nextFrameDelay = TARGET_FRAME_TIME - (frameEnd - frameStart)
			setTimeout(this.renderFrame, nextFrameDelay)
		}
	}

	private emu = new NES({
		onFrame: this.onNesFrame,
		onAudioSample: this.onNesAudioSample,
	})

	private isSoundPlaying = () =>
		((this.audioWriteCursor - this.audioReadCursor) & SAMPLE_MASK) < AUDIO_BUFFERING

	//#region controller
	private controllers: Controller[] = [
		new Controller(this.emu, 1)
	]
	//#endregion controller

	private advanceEmuFrame = () => {
		if (this.playingDemo) {
			const demoFrame = this.demo?.readNextFrame(this.frameCounter)

			if (demoFrame) {
				const inputs = demoFrame.input

				for (let bIdx = 0; bIdx < demoFrame.input.length; bIdx++) {
					if (inputs[bIdx].value) {
						this.emu.buttonDown(1, inputs[bIdx].idx as ButtonKey)
					} else {
						this.emu.buttonUp(1, inputs[bIdx].idx as ButtonKey)
					}
				}
			}
		} else {
			const demoInputs: DemoFrame['input'] = []

			GamepadService.clock((gid, bid, v) => {
				if (v === 1) {
					this.emu.buttonDown(1, GAMEPAD_KEY_MAP[bid] as ButtonKey)
				} else {
					this.emu.buttonUp(1, GAMEPAD_KEY_MAP[bid] as ButtonKey)
				}

				if (this.recordingDemo) {
					demoInputs.push({
						idx: GAMEPAD_KEY_MAP[bid],
						value: v,
					})
				}
			})

			if (demoInputs.length && this.recordingDemo) {
				this.demo?.setFrame({
					frameNumber: this.frameCounter,
					input: demoInputs,
				})
			}
		}

		this.frameCounter++

		this.emu.frame()
	}

	private recordingDemo = false
	private playingDemo = false

	demo: Demo | null = null

	init = () => {
		const canvas = document.getElementById('nes-canvas')! as HTMLCanvasElement

		this.canvasCtx = canvas.getContext("2d")!
		this.frame = this.canvasCtx.getImageData(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT)
		this.canvasCtx.fillStyle = "black"
		this.canvasCtx.imageSmoothingEnabled = false
		this.canvasCtx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT)
		const buffer = new ArrayBuffer(this.frame.data.length)
		this.framebuffer_u8 = new Uint8ClampedArray(buffer)
		this.framebuffer_u32 = new Uint32Array(buffer)

		// sound
		const audioCtx = new window.AudioContext()
		const scriptProcessor = audioCtx.createScriptProcessor(AUDIO_BUFFERING, 0, 2)
		scriptProcessor.addEventListener('audioprocess', (event) => {
			const dstBuffer = event.outputBuffer
			const len = dstBuffer.length

			if (this.isSoundPlaying() && this.isRunning) {
				this.advanceEmuFrame()
			}

			const dstBufferLeft = dstBuffer.getChannelData(0)
			const dstBufferRight = dstBuffer.getChannelData(1)

			for (let i = 0; i < len; i++) {
				const srcIdx = (this.audioReadCursor + i) & SAMPLE_MASK
				dstBufferLeft[i] = this.audioSamplesLeft[srcIdx]
				dstBufferRight[i] = this.audioSamplesRight[srcIdx]
			}

			this.audioReadCursor = (this.audioReadCursor + len) & SAMPLE_MASK
		})

		scriptProcessor.connect(audioCtx.destination)

		// controllers
		GamepadService.init()

		this.controllers.forEach((controller) => {
			controller.init()
		})
	}

	destroy = () => {
		this.isRunning = false
		GamepadService.destroy()
		this.controllers.forEach((controller) => {
			controller.destroy()
		})
	}

	loadROM = async (rom: string) => {
		this.emu.loadROM(rom)
		this.run()
	}

	run = () => {
		this.frameCounter = 0
		this.isRunning = true
		this.renderFrame()
	}

	stop = () => {
		this.isRunning = false
		this.playingDemo = false
	}

	getState = () => {
		return this.emu.toJSON()
	}

	loadState = (state: EmulatorData) => {
		this.emu.fromJSON(state)
	}

	recordDemo = () => {
		this.demo = new Demo(
			{
				frameNumber: this.frameCounter,
				input: [],
			},
			{
				initialState: JSON.stringify(this.emu.toJSON()),
				romName: 'some name'
			},
		)

		this.recordingDemo = true
	}

	stopRecordingDemo = () => {
		this.recordingDemo = false

		return this.demo
	}

	loadDemo = (demo: Demo) => {
		this.demo = demo
	}

	playDemo = () => {
		if (!this.demo) {
			alert('no demo loaded!')
			return
		}

		this.stop()
		this.stopRecordingDemo()

		requestAnimationFrame(() => {
			this.demo!.resetPlayback()

			this.playingDemo = true
			this.frameCounter = this.demo!.frames[0].frameNumber

			this.emu.fromJSON(JSON.parse(this.demo!.meta.initialState))

			this.isRunning = true

			this.renderFrame()
		})
	}

	reset = () => {
		this.stop()
		this.stopRecordingDemo()

		return new Promise<void>((resolve) => {
			requestAnimationFrame(() => {
				this.emu.reset()
				resolve()
			})
		})
	}
}

export default NesEmu
