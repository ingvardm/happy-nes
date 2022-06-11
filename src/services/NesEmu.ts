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
	private audio_samples_L = new Float32Array(SAMPLE_COUNT)
	private audio_samples_R = new Float32Array(SAMPLE_COUNT)
	private audio_write_cursor = 0
	private audio_read_cursor = 0
	//#endregion audio

	//#region video
	private canvas_ctx: CanvasRenderingContext2D | null = null
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
		this.audio_samples_L[this.audio_write_cursor] = l
		this.audio_samples_R[this.audio_write_cursor] = r
		this.audio_write_cursor = (this.audio_write_cursor + 1) & SAMPLE_MASK
	}

	private renderFrame = () => {
		const frameStart = Date.now()
		this.emu.frame()
		this.frame.data.set(this.framebuffer_u8)
		this.canvas_ctx?.putImageData(this.frame, 0, 0)

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

	//#region controller
	private controllers: Controller[] = [
		new Controller(this.emu, 1)
	]
	//#endregion controller

	init = () => {
		const canvas = document.getElementById('nes-canvas')! as HTMLCanvasElement

		this.canvas_ctx = canvas.getContext("2d")!
		this.frame = this.canvas_ctx.getImageData(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT)
		this.canvas_ctx.fillStyle = "black"
		this.canvas_ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT)
		const buffer = new ArrayBuffer(this.frame.data.length)
		this.framebuffer_u8 = new Uint8ClampedArray(buffer)
		this.framebuffer_u32 = new Uint32Array(buffer)

		// sound
		const audio_ctx = new window.AudioContext()
		const script_processor = audio_ctx.createScriptProcessor(AUDIO_BUFFERING, 0, 2)
		script_processor.addEventListener('audioprocess', (event) => {
			var dst = event.outputBuffer;
			var len = dst.length;

			var dst_l = dst.getChannelData(0);
			var dst_r = dst.getChannelData(1);
			for (var i = 0; i < len; i++) {
				var src_idx = (this.audio_read_cursor + i) & SAMPLE_MASK;
				dst_l[i] = this.audio_samples_L[src_idx];
				dst_r[i] = this.audio_samples_R[src_idx];
			}

			this.audio_read_cursor = (this.audio_read_cursor + len) & SAMPLE_MASK;
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
