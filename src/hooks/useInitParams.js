

import { useSearchParams } from '../lib/router'
import { useEffect, useMemo } from 'react'

const PARAMS_STORAGE_KEY = 'levone_init_params'

/**
 * Сохраняет параметры в localStorage (переживает OAuth-редирект и VK WebView)
 */
function saveParams(params) {
	try {
		localStorage.setItem(PARAMS_STORAGE_KEY, JSON.stringify(params))
	} catch (e) { /* ignore */ }
}

function loadSavedParams() {
	try {
		const raw = localStorage.getItem(PARAMS_STORAGE_KEY)
		return raw ? JSON.parse(raw) : null
	} catch (e) {
		return null
	}
}

const useInitParams = () => {
	const [params, setParams] = useSearchParams();

	// Читаем из URL, а если нет — fallback из localStorage
	const saved = useMemo(() => loadSavedParams(), [])

	const company = useMemo(() => {
		const value = params.get('company')
		return value && value !== 'null' ? value : (saved?.company || undefined)
	}, [params, saved])

	const branch = useMemo(() => {
		const value = params.get('branch')
		return value && value !== 'null' ? value : (saved?.branch || undefined)
	}, [params, saved])

	const table = useMemo(() => {
		const value = params.get('table')
		return value && value !== 'null' ? value : (saved?.table || undefined)
	}, [params, saved])

	const is_referral = useMemo(() => {
		const value = params.get('is_referral')
		return value && value !== 'null' ? value : undefined
	}, [params])

	const delivery = useMemo(() => {
        const value = params.get('delivery')
        if (!value || value === 'null') return undefined
        
        // Явно проверяем строку на равенство 'true'
        return value === 'true' 
    }, [params])

	const from = useMemo(() => {
		const value = params.get('from')
		return value && value !== 'null' ? value : undefined
	}, [params])

	const birthday = useMemo(() => {
		const value = params.get('birthday')
		return value === 'true'
	}, [params])

	// Сохраняем параметры, если они есть в URL (для восстановления после OAuth)
	useEffect(() => {
		if (company && branch) {
			saveParams({ company, branch, table })
		}
	}, [company, branch, table])

	return { company, branch, table, is_referral, delivery, from, birthday }
}

export default useInitParams