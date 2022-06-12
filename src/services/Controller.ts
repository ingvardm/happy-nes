import { ControllerInput } from "../types/controller";

type KeyMap = Map<string, ControllerInput>

const DEFAULT_KEY_MAP: Record<string, ControllerInput> = {
	w: ControllerInput.UP,
	s: ControllerInput.DOWN,
	a: ControllerInput.LEFT,
	d: ControllerInput.RIGHT,
	k: ControllerInput.A,
	j: ControllerInput.B,
	l: ControllerInput.SELECT,
	o: ControllerInput.START,
}

export const GAMEPAD_KEY_MAP: Record<number, ControllerInput> = {
	12: ControllerInput.UP,
	13: ControllerInput.DOWN,
	14: ControllerInput.LEFT,
	15: ControllerInput.RIGHT,
	0: ControllerInput.A,
	2: ControllerInput.B,
	3: ControllerInput.A, // BB
	1: ControllerInput.B, // AA
	8: ControllerInput.SELECT,
	9: ControllerInput.START,
}

class Controller {
	private keyMap: KeyMap = new Map(Object.entries(DEFAULT_KEY_MAP))

	private onKeyDown = (event: KeyboardEvent) => {
		const btn = this.keyMap.get(event.key)

		if(btn !== undefined){
			this.emu.buttonDown(this.player, btn)
		}
	}

	private onKeyUp = (event: KeyboardEvent) => {
		const btn = this.keyMap.get(event.key)

		if (btn !== undefined) {
			this.emu.buttonUp(this.player, btn)
		}
	}

	private attachListeners = () => {
		document.addEventListener('keydown', this.onKeyDown)
		document.addEventListener('keyup', this.onKeyUp)
	}

	private detachListeners = () => {
		document.removeEventListener('keydown', this.onKeyDown)
		document.removeEventListener('keyup', this.onKeyUp)
	}

	constructor(
		private emu: any,
		public player: number,
		keyMap?: KeyMap,
	){
		this.keyMap = keyMap || this.keyMap
	}

	init = () => {
		this.attachListeners()
	}

	destroy = () => {
		this.detachListeners()
	}

	setKeyMap = (km: KeyMap) => {
		this.keyMap = km
	}
}

export default Controller