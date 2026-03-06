import { createHashRouter } from './lib/router'

export const router = createHashRouter([
	{
		path: '/',
		panel: 'game',
		view: 'default_view',
		root: 'default_root'
	},
	{
		path: '/profile',
		panel: 'profile',
		view: 'default_view',
		root: 'default_root'
	},
	{
		path: '/transactions',
		panel: 'transactions',
		view: 'default_view',
		root: 'default_root'
	},
	{
		path: '/inventory',
		panel: 'inventory',
		view: 'default_view',
		root: 'default_root'
	},
	{
		path: '/catalog',
		panel: 'catalog',
		view: 'default_view',
		root: 'default_root'
	},
	{
		path: '/quest',
		panel: 'quest',
		view: 'default_view',
		root: 'default_root'
	},
	{
		path: '/coupon',
		panel: 'coupon',
		view: 'default_view',
		root: 'default_root'
	},
	{
		path: '/review',
		panel: 'review',
		view: 'default_view',
		root: 'default_root'
	},
]);