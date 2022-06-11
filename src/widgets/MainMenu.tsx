import '../styles/main-menu.css'

import { useCallback } from "react"
import { useRef } from "react"
import { FC, useMemo } from "react"
import { useModelCtx } from "react-better-model"
import MainMenuButton, { MainMenuButtonData, MainMenuButtonProps, MenuAction } from "../components/MainMenuButton"
import GameViewModelCtx from "../views/GameViewModel"
import FileSelector from "./FileSelector"

const mainMenuButtons: MainMenuButtonData[] = [
	{
		name: 'Open rom',
		action: MenuAction.LOAD_ROM,
	},
	{
		name: 'Save state',
		action: MenuAction.SAVE_STATE,
	},
	{
		name: 'Load state',
		action: MenuAction.LOAD_STATE,
	},
]

const MainMenu: FC = () => {
	const fileSelectorRef = useRef<HTMLInputElement>(null)

	const gameViewModel = useModelCtx(GameViewModelCtx)

	const onButtonPress = useCallback<MainMenuButtonProps['onPress']>((btnData, e) => {
		switch (btnData.action) {
			case MenuAction.LOAD_ROM:
				fileSelectorRef.current && fileSelectorRef.current.click()
				break
			case MenuAction.SAVE_STATE:
				gameViewModel.dispatch('save-state')
				break
			case MenuAction.LOAD_STATE:
				gameViewModel.dispatch('load-state')
				break
		}
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
