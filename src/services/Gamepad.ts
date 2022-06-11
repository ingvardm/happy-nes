import Suby from 'suby'

type GamepadEvents = {
	'state-change': []
}

export default class GamepadService {
	private static eb = new Suby<GamepadEvents>()
	private static gamepads: (Gamepad | null)[] = []
	private static buttonsState: number[][]

	private static getGamepads(){
		GamepadService.gamepads = navigator.getGamepads()
	}

	private static onGamepadConnected(event: GamepadEvent){
		GamepadService.gamepads.push(event.gamepad)
	}

	private static onGamepadDisconnected(event: GamepadEvent){
		const rIdx = GamepadService.gamepads.indexOf(event.gamepad)

		GamepadService.gamepads.splice(rIdx, 1)
	}

	private static attachListeners(){
		window.addEventListener('gamepadconnected', GamepadService.onGamepadConnected)
		window.addEventListener('gamepaddisconnected', GamepadService.onGamepadDisconnected)
	}

	private static detachListeners() {
		window.removeEventListener('gamepadconnected', GamepadService.onGamepadConnected)
		window.removeEventListener('gamepaddisconnected', GamepadService.onGamepadDisconnected)
	}

	static init(){
		GamepadService.getGamepads()
		GamepadService.attachListeners()
	}

	static destroy(){
		GamepadService.detachListeners()
	}

	static clock(cb: (gid: number, bid: number, v: number) => void){
		for (let gIdx = 0; gIdx < GamepadService.gamepads.length; gIdx++){
			const buttons = GamepadService.gamepads[gIdx]?.buttons

			if(buttons?.length){
				for(let bIdx = 0; bIdx < buttons.length; bIdx++){
					const value = buttons[bIdx].value

					if (GamepadService.buttonsState[gIdx][bIdx] !== value){
						cb(gIdx, bIdx, value)
						GamepadService.buttonsState[gIdx][bIdx] = value
					}
				}
			}

			console.log(GamepadService.gamepads[gIdx]?.mapping)
		}
	}

	static poll(int: number){

	}
}
