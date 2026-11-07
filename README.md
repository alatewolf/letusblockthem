# Let Us Block Them

A Chrome extension that hides everyone in an FL group you pick, on your own screen.

- Their posts, comments, notifications and messages disappear for you.
- Nobody is blocked, and nobody is told.
- Nothing is sent anywhere except normal page visits to FL.

## What it hides

Once you hide a group, these disappear for every member of it:

- posts and discussions
- comments, and the replies under them
- notifications, loves and mentions
- message threads in your inbox
- cards in member lists and search results

If you open the hidden group, or the profile of someone in it, a full-page cover says so. Choose "Go back" to leave, or "Show the page" to see it anyway.

## Why hide, and not block?

Some of the groups people most want gone have over 69,000 members. Blocking all of them is a bad idea.

1. It would hammer FL's servers. Every block is a separate request, so one group means at least 69,000 requests from your account. Even at one block every second, without a break, that takes 19 hours. If 1,000 people did it, FL would receive 69 million block requests. That is the kind of load that crashes a website.
2. It would almost certainly get your account banned. No person blocks 69,000 people by hand, so FL would see a bot, and it would be right. Most sites forbid mass automated actions in their terms of use, and a suspended account is the usual result.
3. You could not take it back. Unblocking them all means another 69,000 requests.

Hiding is a different kind of job. It reads the group's member list, the same pages anyone can open from the group's "Members" tab, 20 names at a time with a pause between pages. It changes nothing on FL. All the hiding happens on your own screen.

For a group of 69,000 members:

| | Block everyone | Hide with this extension |
| --- | --- | --- |
| Requests to FL | at least 69,000 | about 3,450, then the same once a day to catch new members |
| What each request does | blocks a real person | reads one page |
| Time | 19 hours at one block a second | at least 23 minutes |
| To undo | another 69,000 requests | one button, nothing sent |

## How to use it

1. Open the group on FL.
2. Press "Mass Hide Members" in the bottom-right corner.
3. Keep the tab open while it reads the member list. It takes at least 20 seconds per 1,000 members, so a group of 69,000 takes over 20 minutes.

To undo, open the group and press "Show this group's members". Everyone from that group shows again at once.

## Your data

### What it reads

- The FL pages you open. Any extension that works on a website can see that site's pages. This one looks only at usernames and links, to decide what to hide. It never saves or sends the text of posts, comments or messages.
- The group's member list, when you press the button and once a day after that.

### What it stores

Everything stays on your own computer, in Chrome's storage for this extension:

- the name of each group you hide
- the usernames of its members
- the time it last read the list
- one time stamp, so two open tabs do not read the same list at once

Nothing else. Not your username, your password, your messages or your browsing history.

### What it sends

- To the developer, or anyone else: nothing. There is no server, no analytics, no tracking and no ads.
- To FL: only requests for the group's member pages. These are the pages you see when you click "Members" on a group. Your browser asks for them with your normal FL login, so FL can see that your account opened them, as with any page you open.

### What Chrome lets it do

- Storage, to keep the member lists on your computer.
- Access to FL pages only. It cannot see other websites, your other tabs or your history.

## How it works

1. It reads the list. It asks for the group's member pages one at a time and writes down every username.
2. It remembers the list on your computer, so hiding continues on every page and after Chrome restarts.
3. It hides as you browse. On every FL page, it checks who wrote each post, comment, notification, inbox row and member card, and makes the ones from the list invisible. FL adds content as you scroll, so it checks again each time the page changes. Nothing is deleted, so undo is instant.
4. It covers hidden pages. The group's own pages and its members' profiles get a full-page cover.
5. It stays up to date. Once a day it reads the list again and adds anyone who joined. People who leave the group stay hidden.

## The code

| File | What it is |
| --- | --- |
| `manifest.json` | The extension's ID card: its name, its icon, the one permission it asks for and the one site it runs on. |
| `content.js` | All the code that runs. About 250 lines, with a comment above each part. |
| `icons/` | The icon, in three sizes. |
| `PRIVACY.md` | The privacy policy. |
| `store/` | The Chrome Web Store text and pictures. The names in the pictures are invented. |
| `scripts/` | `make-icons.py` draws the icon. `verify.sh` checks the extension before a release. |
| `LICENSE` | The MIT license: you can use, copy and change this code freely. |

### Inside content.js

The file runs top to bottom in these parts:

1. The hiding rule: one line of style that makes anything marked "hidden" invisible.
2. `authorsOf` finds the username behind each post, comment, inbox row or member card.
3. `hideName` takes one name out of a list like "A, B and C" and tidies the commas.
4. `hideNotifications` removes hidden names from a notification, and the whole notification if everyone in it is hidden.
5. A page watcher runs the check again whenever FL adds new content.
6. `readMembers` requests the member pages. This is the only part that uses the internet.
7. `refreshOldest` reads a list again when it is more than a day old.
8. `coverFor` and `renderOverlay` build the full-page cover.
9. `render` and `toggle` show the button on group pages and turn hiding on or off.

### Check it yourself

You do not need to trust this page. Open `content.js` and search for these words:

- `fetch` appears once, in `readMembers`. Its address starts with `/groups/`, so the request can only go to the site you are on.
- `http`, `XMLHttpRequest`, `sendBeacon` and `WebSocket` appear zero times. The code has no other way to send anything out.

## Install it from this code

1. On this page, press "Code", then "Download ZIP", and unzip it.
2. In Chrome, open `chrome://extensions` and turn on "Developer mode" in the top-right corner.
3. Press "Load unpacked" and pick the unzipped folder.

## Limits

- It hides only in this Chrome browser. Your phone, the FL app and other browsers still show everyone.
- It depends on how FL builds its pages. If FL changes its design, some items can show again until the extension is updated.
- Name lists are tidied for English only.
- You cannot unhide one person yet, only the whole group.
- If FL refuses a page while it reads a large group, nothing is hidden. Wait a few minutes and press the button again.

## License

MIT. See `LICENSE`.
