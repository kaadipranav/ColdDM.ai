"use client";

import { useEffect } from "react";

export function useHotkeys(onNew?: () => void) {
	useEffect(() => {
		function onKey(e: KeyboardEvent) {
			if (e.key.toLowerCase() === "n" && !e.metaKey && !e.ctrlKey && !e.altKey) {
				onNew?.();
			}
		}
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [onNew]);
} 