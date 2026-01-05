# Tampermonkey Scripts

A collection of useful Tampermonkey scripts.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Scripts

### Theme Refresher (YT & Twitch) (`refresh-theme.user.js`)

Refreshes YouTube and Twitch pages when the system theme changes (e.g., from Light to Dark mode), ensuring that the site matches the system preference immediately, since these sites do not support updating the theme dynamically.

*   **YouTube**: Reloads the page and maintains the playback position if watching a video.
*   **Twitch**: Reloads the page. If watching a VOD, it preserves the timestamp and reloads at the correct position.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
