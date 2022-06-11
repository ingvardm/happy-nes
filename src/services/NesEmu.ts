import { EmulatorData, NES } from 'jsnes'

import Controller from './Controller'
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

	private lastSavedState: EmulatorData | null = null

	private isRunning = false

	private onNesFrame = (framebuffer_24: Buffer) => {
		for (let i = 0; i < FRAMEBUFFER_SIZE; i++){
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

		if(this.isRunning){
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

	init = () => {
		const canvas = document.getElementById('nes-canvas')! as HTMLCanvasElement

		this.canvasCtx = canvas.getContext("2d")!
		this.frame = this.canvasCtx.getImageData(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT)
		this.canvasCtx.fillStyle = "black"
		this.canvasCtx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT)
		const buffer = new ArrayBuffer(this.frame.data.length)
		this.framebuffer_u8 = new Uint8ClampedArray(buffer)
		this.framebuffer_u32 = new Uint32Array(buffer)

		// sound
		const audio_ctx = new window.AudioContext()
		const script_processor = audio_ctx.createScriptProcessor(AUDIO_BUFFERING, 0, 2)
		script_processor.addEventListener('audioprocess', (event) => {
			const dst = event.outputBuffer
			const len = dst.length

			if (this.isSoundPlaying() && this.isRunning){
				this.emu.frame()
			}

			const dst_l = dst.getChannelData(0)
			const dst_r = dst.getChannelData(1)

			for (let i = 0; i < len; i++) {
				const src_idx = (this.audioReadCursor + i) & SAMPLE_MASK
				dst_l[i] = this.audioSamplesLeft[src_idx]
				dst_r[i] = this.audioSamplesRight[src_idx]
			}

			this.audioReadCursor = (this.audioReadCursor + len) & SAMPLE_MASK
		})

		script_processor.connect(audio_ctx.destination)

		// controllers
		this.controllers.forEach((controller) => {
			controller.init()
		})
	}

	destroy = () => {
		this.isRunning = false
		this.controllers.forEach((controller) => {
			controller.destroy()
		})
	}

	loadROM = async (rom: string) => {
		this.emu.loadROM(rom)
		this.run()
	}

	run = () => {
		this.isRunning = true
		this.renderFrame()
	}

	stop = () => {
		this.isRunning = false
	}

	getState = () => {
		return this.emu.toJSON()
	}

	loadState = (state: EmulatorData) => {
		this.emu.fromJSON(state)
	}
}

export default NesEmu
