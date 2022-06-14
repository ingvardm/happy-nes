import { ControllerInput } from "../types/controller"

type ClockCallback = (
	gid: number,
	bid: number,
	v: number,
) => void

export const DEFAULT_KEY_MAP: Record<number, ControllerInput> = {
	87: ControllerInput.UP, // w
	83: ControllerInput.DOWN, // s
	65: ControllerInput.LEFT, // a
	68: ControllerInput.RIGHT, // d
	75: ControllerInput.A, // k
	74: ControllerInput.B, // j
	76: ControllerInput.SELECT, // l
	69: ControllerInput.START, // e
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

export default class GamepadService {
	private static gamepads: (Gamepad | null)[] = []
	private static buttonsState: number[][] = []

	private static keysStateLast: Map<number, number> = new Map()
	private static keysStateNext: Map<number, number> = new Map()

	private static getGamepads(){
		const gamepads = navigator.getGamepads()

		GamepadService.gamepads = gamepads

		gamepads.forEach((_, index) => {
			GamepadService.buttonsState[index] = []
		})
	}

	private static onKeyDown = (event: KeyboardEvent) => {
		GamepadService.keysStateNext.set(event.keyCode, 1)
	}

	private static onKeyUp = (event: KeyboardEvent) => {
		GamepadService.keysStateNext.set(event.keyCode, 0)
	}

	private static onGamepadConnected(event: GamepadEvent){
		GamepadService.gamepads[event.gamepad.index] = event.gamepad
	}

	private static onGamepadDisconnected(event: GamepadEvent){
		GamepadService.gamepads.splice(event.gamepad.index, 1)
	}

	private static attachListeners(){
		window.addEventListener('gamepadconnected', GamepadService.onGamepadConnected)
		window.addEventListener('gamepaddisconnected', GamepadService.onGamepadDisconnected)
		document.addEventListener('keydown', GamepadService.onKeyDown)
		document.addEventListener('keyup', GamepadService.onKeyUp)
	}

	private static detachListeners() {
		window.removeEventListener('gamepadconnected', GamepadService.onGamepadConnected)
		window.removeEventListener('gamepaddisconnected', GamepadService.onGamepadDisconnected)
		document.removeEventListener('keydown', GamepadService.onKeyDown)
		document.removeEventListener('keyup', GamepadService.onKeyUp)
	}

	static init(){
		GamepadService.getGamepads()
		GamepadService.attachListeners()
	}

	static destroy(){
		GamepadService.detachListeners()
	}

	static clock(cb: ClockCallback){
		GamepadService.keysStateNext.forEach((value, key) => {
			if (GamepadService.keysStateLast.get(key) !== value) {
				cb(0, key, value)
				GamepadService.keysStateLast.set(key, value)
			}
		})

		for (let gIdx = 0; gIdx < GamepadService.gamepads.length; gIdx++){
			const buttons = navigator.getGamepads()[gIdx]?.buttons

			if(buttons?.length){
				for(let bIdx = 0; bIdx < buttons.length; bIdx++){
					const value = buttons[bIdx].value

					if (GamepadService.buttonsState[gIdx][bIdx] !== value){
						cb(gIdx + 1, bIdx, value)
						GamepadService.buttonsState[gIdx][bIdx] = value
					}
				}
			}
		}
	}
}
