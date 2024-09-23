'use client';

import { useEffect } from 'react';

export function LocalStorageTools() {
	useEffect(() => {
		const hasCleared = localStorage.getItem('localStorageCleared');
		if (!hasCleared) {
			localStorage.clear();
			localStorage.setItem('localStorageCleared', 'true');
		}
	}, []);

	return null;
}
