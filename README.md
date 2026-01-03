# Skal jeg på ski?

A tiny, single-page site that answers "Should I go skiing?" and shows a countdown to the selected ski date.

## Features

Can show if you should go skiing based on:

1. That you of course want to go skiing.
2. Your friends want to go skiing.
3. The weather is good for skiing.

Based on these conditions it will show a "Yes!" or "No." answer.

Also has a countdown timer to the ski date, which gets stored as URL parameters, so you can share it with friends.

### Persistence behaviour


### Sharing

  - Use the native sharing dialog on devices that support the Web Share API (mobile browsers).
  - Otherwise, copy the shareable URL (including the `date` parameter) to the clipboard.
  - The button shows a brief confirmation message when the URL is copied or shared.

Tip: if the favicon or icons don't show, try opening `http://localhost:8000/public/favicon.ico` directly to verify the file is served, and do a hard refresh (Cmd+Shift+R) or clear site data/cache in your browser.
