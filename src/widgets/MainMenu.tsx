import '../styles/main-menu.css'

import { useCallback } from "react"
import { useRef } from "react"
import { FC, useMemo } from "react"
import { useModelCtx } from "react-better-model"
import MainMenuButton, { MainMenuButtonData, MainMenuButtonProps, MenuAction } from "../components/MainMenuButton"
import GameViewModelCtx from "../views/GameViewModel"
import FileSelector from "./FileSelector"



const MainMenu: FC = () => {
	const fileSelectorRef = useRef<HTMLInputElement>(null)

	const gameViewModel = useModelCtx(GameViewModelCtx)

	const mainMenuButtons = useMemo(() => {
		return [
			{
				name: 'Open rom',
				action: () => {
					fileSelectorRef.current && fileSelectorRef.current.click()
				},
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
		]
	}, [fileSelectorRef.current])

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
		<FileSelector ref={fileSelectorRef}/>
		{buttons}
	</div>
}

export default MainMenu
