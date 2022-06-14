import { FC, MouseEvent, MouseEventHandler, useCallback } from "react"

export enum MenuAction {
	LOAD_ROM,
	SAVE_STATE,
	LOAD_STATE,
	REC_DEMO,
	STOP_REC_DEMO,
}

export type MainMenuButtonData = {
	name: string
	action: () => void
}

export type MainMenuButtonProps = MainMenuButtonData & {
	onPress: (
		btnData: MainMenuButtonData,
		e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>,
	) => void
}

const MainMenuButton: FC<MainMenuButtonProps> = ({
	name,
	action,
	onPress,
}) => {
	const _onPress = useCallback<MouseEventHandler<HTMLDivElement>>((e) => {
		onPress({name, action}, e)
	}, [action, name, onPress])

	return <div onClick={_onPress} className='main-menu-button'>
		<p className='main-menu-button-text'>{name}</p>
	</div>
}

export default MainMenuButton
