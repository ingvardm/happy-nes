export type DemoMetaData = {
	romName: string
}

export type DemoFrame = {
	frameNumber: number
	input: {
		idx: number
		value: number
	}[]
}

export type DemoRaw = {
	meta: DemoMetaData
	frames: DemoFrame[]
}

export default class Demo {
	static fromRawData(data: DemoRaw){
		return new Demo(
			data.meta,
			data.frames,
		)
	}

	private playBackReadCursor = 0

	constructor(
		public meta: DemoMetaData,
		public frames: DemoFrame[] = []
	){ }

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
			meta: this.meta,
			frames: this.frames,
		}
	}
}
