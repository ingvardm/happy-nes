export type DemoMetaData = {
	romName: string
	initialState: string
}

export type DemoFrame = {
	frameNumber: number
	input: {
		idx: number
		value: number
	}[]
}

export type DemoRaw = {
	initialFrame: DemoFrame
	meta: DemoMetaData
	frames: DemoFrame[]
}

export default class Demo {
	static fromRawData(data: DemoRaw){
		return new Demo(
			data.initialFrame,
			data.meta,
			data.frames,
		)
	}

	private playBackReadCursor = 0

	constructor(
		public initialFrame: DemoFrame,
		public meta: DemoMetaData,
		public frames: DemoFrame[] = []
	){
		this.setFrame(initialFrame)
	}

	save = () => {
		// save to disk
	}

	setFrame = (frame: DemoFrame) => {
		this.frames.push(frame)
	}

	readNextFrame = (idx: number) => {
		const frame = this.frames[this.playBackReadCursor]
		if (frame && idx == frame.frameNumber){
			this.playBackReadCursor++
	
			return frame
		}

		return null
	}

	resetPlayback = () => {
		this.playBackReadCursor = 0
	}

	getRawData = (): DemoRaw => {
		return {
			initialFrame: this.initialFrame,
			meta: this.meta,
			frames: this.frames,
		}
	}
}
