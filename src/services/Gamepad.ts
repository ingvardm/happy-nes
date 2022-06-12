export default class GamepadService {
	private static gamepads: (Gamepad | null)[] = []
	private static buttonsState: number[][] = []

	private static getGamepads(){
		const gamepads = navigator.getGamepads()

		GamepadService.gamepads = gamepads

		gamepads.forEach((_, index) => {
			GamepadService.buttonsState[index] = []
		})
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
			const buttons = navigator.getGamepads()[gIdx]?.buttons

			if(buttons?.length){
				for(let bIdx = 0; bIdx < buttons.length; bIdx++){
					const value = buttons[bIdx].value

					if (GamepadService.buttonsState[gIdx][bIdx] !== value){
						cb(gIdx, bIdx, value)
						GamepadService.buttonsState[gIdx][bIdx] = value
					}

				}
			}
		}
	}
}
