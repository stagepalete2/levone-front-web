/**
 * Custom Hash Router
 * Drop-in replacement for @vkontakte/vk-mini-apps-router
 * Provides the same API: createHashRouter, RouterProvider, useActiveVkuiLocation,
 * useRouteNavigator, useSearchParams
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const RouterContext = createContext(null)

/**
 * Parse hash-based URL into route match
 * Format: #/path?param1=val1&param2=val2
 */
function parseHash(hash, routes) {
	const hashStr = hash || '#/'
	const withoutHash = hashStr.startsWith('#') ? hashStr.substring(1) : hashStr

	const [pathname, searchStr] = withoutHash.split('?')
	const cleanPath = pathname || '/'
	const search = new URLSearchParams(searchStr || '')

	// Find matching route
	const matched = routes.find((r) => r.path === cleanPath)

	return {
		pathname: cleanPath,
		search,
		route: matched || routes[0], // fallback to first route
	}
}

/**
 * Create a hash router configuration (matches VK API)
 */
export function createHashRouter(routeConfigs) {
	return { routes: routeConfigs }
}

/**
 * Router Provider component
 */
export function RouterProvider({ router, children }) {
	const [state, setState] = useState(() => {
		return parseHash(window.location.hash, router.routes)
	})

	useEffect(() => {
		const handleHashChange = () => {
			setState(parseHash(window.location.hash, router.routes))
		}
		window.addEventListener('hashchange', handleHashChange)
		return () => window.removeEventListener('hashchange', handleHashChange)
	}, [router.routes])

	const navigate = useCallback(
		({ pathname, search }) => {
			let newHash = `#${pathname}`
			if (search && typeof search === 'object') {
				const params = new URLSearchParams()
				Object.entries(search).forEach(([k, v]) => {
					if (v !== null && v !== undefined && v !== '') {
						params.set(k, v)
					}
				})
				const searchStr = params.toString()
				if (searchStr) {
					newHash += `?${searchStr}`
				}
			}
			window.location.hash = newHash
		},
		[]
	)

	const contextValue = useMemo(
		() => ({
			...state,
			navigate,
			routes: router.routes,
		}),
		[state, navigate, router.routes]
	)

	return <RouterContext.Provider value={contextValue}>{children}</RouterContext.Provider>
}

/**
 * Hook: useActiveVkuiLocation
 * Returns { root, view, panel } matching the current route
 */
export function useActiveVkuiLocation() {
	const ctx = useContext(RouterContext)
	if (!ctx) {
		return { root: 'default_root', view: 'default_view', panel: 'game' }
	}
	const { route } = ctx
	return {
		root: route?.root || 'default_root',
		view: route?.view || 'default_view',
		panel: route?.panel || 'game',
	}
}

/**
 * Hook: useRouteNavigator
 * Returns object with push() method
 */
export function useRouteNavigator() {
	const ctx = useContext(RouterContext)
	return {
		push: (args) => {
			if (typeof args === 'string') {
				ctx?.navigate({ pathname: args })
			} else {
				ctx?.navigate(args)
			}
		},
		back: () => window.history.back(),
		replace: (args) => {
			if (typeof args === 'string') {
				window.location.replace(`#${args}`)
			}
		},
	}
}

/**
 * Hook: useSearchParams
 * Returns [URLSearchParams, setSearchParams]
 */
export function useSearchParams() {
	const ctx = useContext(RouterContext)
	const params = ctx?.search || new URLSearchParams()

	const setParams = useCallback(
		(newParams) => {
			const current = window.location.hash || '#/'
			const [pathname] = current.replace('#', '').split('?')
			const search = new URLSearchParams(newParams)
			const searchStr = search.toString()
			window.location.hash = searchStr ? `${pathname}?${searchStr}` : pathname
		},
		[]
	)

	return [params, setParams]
}
