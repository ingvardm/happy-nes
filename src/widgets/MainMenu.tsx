import '../styles/main-menu.css'

import { useCallback } from "react"
import { FC, useMemo } from "react"
import { useModelCtx } from "react-better-model"
import MainMenuButton, { MainMenuButtonProps } from "../components/MainMenuButton"
import GameViewModelCtx from "../views/GameViewModel"



const MainMenu: FC = () => {
	const gameViewModel = useModelCtx(GameViewModelCtx)

	const mainMenuButtons = useMemo(() => {
		return [
			{
				name: 'Open rom',
				action: gameViewModel.loadRom,
			},
			{
				name: 'Save state',
				action: gameViewModel.saveState,
			},
			{
				name: 'Load state',
				action: gameViewModel.loadState,
			},
			{
				name: 'Record demo',
				action: gameViewModel.recordDemo,
			},
			{
				name: 'Stop recording',
				action: gameViewModel.stopRecordingDemo,
			},
			{
				name: 'Play demo',
				action: gameViewModel.playDemo,
			},
			{
				name: 'Stop demo',
				action: gameViewModel.stopDemo,
			},
			{
				name: 'Load demo',
				action: gameViewModel.loadDemo,
			},
			{
				name: 'Reset',
				action: gameViewModel.reset,
			},
			{
				name: 'fullscreen',
				action: gameViewModel.goFullscreen,
			},
		]
	}, [])

	const onButtonPress = useCallback<MainMenuButtonProps['onPress']>((btnData, e) => {
		btnData.action()
	}, [])

	const buttons = useMemo(() => {
		return mainMenuButtons.map((btn) => {
			return <MainMenuButton
				key={btn.name}
				{...btn}
				onPress={onButtonPress}/>
		})
	}, [])

	return <div className='main-menu'>
		{buttons}
	</div>
}

export default MainMenu
