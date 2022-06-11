import { createContext } from 'react'
import {Model} from 'react-better-model'

const gameViewModelInitialState = {
	rom: null as string | null,
}

type GameViewModelEvents = {
	'load-state': undefined
	'save-state': undefined
}

export class GameViewModel extends Model<typeof gameViewModelInitialState, GameViewModelEvents> {
	constructor(state = gameViewModelInitialState){
		super(state)
	}

	loadRom = async (rom: string) => {
		this.setValue('rom', rom)
	}
}

const GameViewModelCtx = createContext(new GameViewModel(gameViewModelInitialState))

export default GameViewModelCtx
