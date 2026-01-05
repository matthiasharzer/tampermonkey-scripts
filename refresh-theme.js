// ==UserScript==
// @name         Theme Refresher (YT & Twitch)
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Refreshes YouTube and Twitch when system theme changes, maintaining video timestamp
// @author       Matthias Harzer
// @match        *://www.youtube.com/*
// @match        *://www.twitch.tv/*
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

	function handleYouTube() {
		console.log('Handling YouTube theme change...');

		// Retrieve URL and current timestamp
		let currentTime = 0;
		const video = document.querySelector('video');
		if (video && !isNaN(video.currentTime)) {
			currentTime = Math.floor(video.currentTime);
		}

		const url = new URL(window.location.href);

		// If we are watching a video, update/add the timestamp 't' parameter
		if (url.pathname === '/watch' && currentTime > 0) {
			url.searchParams.set('t', currentTime + 's');
		}

		window.location.href = url.toString();
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
		} else {
			// Fallback for other sites if added later
			window.location.reload();
		}
	}

	// Listen for changes
	mediaQuery.addEventListener('change', handleThemeChange);
})();