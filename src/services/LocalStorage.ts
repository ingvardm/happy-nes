import { EmulatorData } from "jsnes"

type StorageItems = {
	savedStates: Record<string, EmulatorData>
}

export default class LocalStorage {
	static get<K extends keyof StorageItems>(key: K) {
		const data = localStorage.getItem(key)

		if(data){
			return JSON.parse(data) as StorageItems[K]
		}

		return null
	}

	static set<K extends keyof StorageItems, D extends StorageItems[K]>(
		key: K,
		data: D,
	){
		localStorage.setItem(key, JSON.stringify(data))
	}

	static remove<K extends keyof StorageItems>(key: K) {
		localStorage.removeItem(key)
	}

	static clear(){
		localStorage.clear()
	}
}
