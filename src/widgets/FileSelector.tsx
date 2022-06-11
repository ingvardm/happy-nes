import { forwardRef } from 'react'
import { ChangeEventHandler, FC, useCallback } from 'react'

import { useModelCtx } from 'react-better-model'
import GameViewModelCtx from '../views/GameViewModel'

const FileSelector = forwardRef<HTMLInputElement>((_, ref) => {
	const gameViewModel = useModelCtx(GameViewModelCtx)

	const onFileInputChange = useCallback<ChangeEventHandler<HTMLInputElement>>(async (event) => {
		if (event.target.files && event.target.files[0]){
			const rom = await event.target.files[0]

			const reader = new FileReader()

			reader.onload = (ev: ProgressEvent<FileReader>) => {
				if (reader.result){
					console.log(`ROM loaded ${ev.loaded / 1000}KB`)
					gameViewModel.loadRom(reader.result.toString())
				}

				return {} as any
			}

			reader.readAsBinaryString(rom)
		}
	}, [])

	return <input
		id='rom-file-input'
		ref={ref}
		type="file"
		accept='.nes'
		onChange={onFileInputChange}/>
})

export default FileSelector
