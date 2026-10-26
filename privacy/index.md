# Privacy and browser storage

The countdown runs in your browser. When you choose a departure date, the site stores that value under the skiDate key in localStorage so the same browser can remember it on a later visit. Clearing the date removes that saved value; you can also delete it through your browser's site-data settings. The countdown does not require a user account or a server-side trip database.

The departure date is also included in the date query parameter of the page URL. Anyone who receives that link can read the date. URLs can appear in browser history, hosting request logs and tools used to share links, so do not treat a departure link as confidential. A link does not carry a timezone offset: visitors interpret its date and time locally.

The page loads the Space Mono font from Google Fonts, which makes requests to Google's font services. The hosting provider also receives ordinary connection information when serving the site, such as an IP address and request details; retention and handling depend on that provider. The checked-in countdown code contains no analytics or advertising scripts. Native sharing or clipboard access occurs when you use the share button. External GitHub and portfolio links have their own privacy practices. For questions, use the contact page.

[Countdown](https://skaljegpaski.dk/) | [Contact](https://skaljegpaski.dk/contact/) | [Source and issues](https://github.com/lucasfth/skaljegpaski.dk) | [Creator portfolio](https://lucashanson.dk)
