import { FC, MouseEvent, MouseEventHandler, useCallback } from "react"

export enum MenuAction {
	LOAD_ROM,
	SAVE_STATE,
	LOAD_STATE,
}

export type MainMenuButtonData = {
	name: string
	action: MenuAction
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

	return <div onClick={_onPress}>
		<p className='main-menu-button'>{name}</p>
	</div>
}

export default MainMenuButton
