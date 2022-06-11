import { FC, useMemo } from 'react'

import GameScreen from '../components/GameScreen'
import MainMenu from '../widgets/MainMenu'
import GameViewModelCtx, { GameViewModel } from './GameViewModel'

const GameView: FC<{}> = () => {
	const gameViewModel = useMemo(() => {
		const model = new GameViewModel()

		return model
	}, [])

	return <GameViewModelCtx.Provider value={gameViewModel}>
		<div id='game-view'>
			<MainMenu/>
			<GameScreen/>
		</div>
	</GameViewModelCtx.Provider>
	
}

export default GameView
