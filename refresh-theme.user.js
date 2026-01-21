// ==UserScript==
// @name         Theme Refresher (YT & Twitch)
// @namespace    http://tampermonkey.net/
// @version      0.1.1
// @description  Refreshes YouTube and Twitch when system theme changes, maintaining video timestamp
// @author       Matthias Harzer
// @match        *://www.youtube.com/*
// @match        *://www.twitch.tv/*
// @match        *://www.google.com/*
// @match        *://google.com/*
// @grant        none
// ==/UserScript==

(function () {
	'use strict';

	// 1. Detect a theme update of the system
	const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

	function formatTwitchTime(totalSeconds) {
		const h = Math.floor(totalSeconds / 3600);
		const m = Math.floor((totalSeconds % 3600) / 60);
		const s = Math.floor(totalSeconds % 60);
		return `${h}h${m}m${s}s`;
	}

	function restoreYouTubeProgress() {
		if (!window.location.hostname.includes('youtube.com')) return;

		const savedTime = sessionStorage.getItem('yt-theme-refresher-time');
		if (savedTime) {
			sessionStorage.removeItem('yt-theme-refresher-time');
			const savedPaused = sessionStorage.getItem('yt-theme-refresher-paused') === 'true';
			sessionStorage.removeItem('yt-theme-refresher-paused');
			const time = parseFloat(savedTime);

			const checkVideo = setInterval(() => {
				const video = document.querySelector('video');
				if (video && video.readyState >= 1) {
					console.log('Restoring video timestamp:', time, 'Paused:', savedPaused);
					video.currentTime = time;
					if (savedPaused) {
						video.pause();
						// Enforce pause if YouTube tries to auto-play shortly after
						const enforcePause = () => {
							if (!video.paused) {
								console.log('YouTube tried to autoplay, enforcing pause.');
								video.pause();
							}
						};
						video.addEventListener('play', enforcePause);
						// Remove enforcement after a few seconds so user can play
						setTimeout(() => {
							video.removeEventListener('play', enforcePause);
						}, 2000);
					} else {
						video.play().catch(e => console.error('Play failed or interrupted:', e));
					}
					clearInterval(checkVideo);

					// Remove timestamp from URL if present to keep it clean
					const url = new URL(window.location.href);
					if (url.searchParams.has('t')) {
						url.searchParams.delete('t');
						window.history.replaceState({}, '', url.toString());
					}
				}
			}, 200);

			// Stop checking after 15 seconds
			setTimeout(() => clearInterval(checkVideo), 15000);
		}
	}

	function handleYouTube() {
		console.log('Handling YouTube theme change...');

		const video = document.querySelector('video');
		if (video && !isNaN(video.currentTime) && video.currentTime > 0) {
			sessionStorage.setItem('yt-theme-refresher-time', video.currentTime);
			sessionStorage.setItem('yt-theme-refresher-paused', video.paused);
		}

		window.location.reload();
	}

	function handleTwitch() {
		console.log('Handling Twitch theme change...');

		const url = new URL(window.location.href);
		const isVod = url.pathname.startsWith('/videos/');

		if (!isVod) {
			window.location.reload();
			return;
		}

		// Handle VOD
		const video = document.querySelector('video');
		let currentTime = 0;
		if (video && !isNaN(video.currentTime)) {
			currentTime = video.currentTime;
		}

		if (currentTime > 0) {
			const timeStr = formatTwitchTime(currentTime);
			url.searchParams.set('t', timeStr);
			window.location.href = url.toString();
		} else {
			window.location.reload();
		}
	}

	function handleThemeChange(e) {
		console.log('System theme changed. Refreshing page...');
		const hostname = window.location.hostname;

		if (hostname.includes('youtube.com')) {
			handleYouTube();
		} else if (hostname.includes('twitch.tv')) {
			handleTwitch();
		} else if (hostname.includes('google.com')) {
			window.location.reload();
		} else {
			// Fallback for other sites if added later
			window.location.reload();
		}
	}

	// Check for pending restore actions
	restoreYouTubeProgress();

	// Listen for changes
	mediaQuery.addEventListener('change', handleThemeChange);
})();