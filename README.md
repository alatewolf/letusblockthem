# Let Us Block Them

A Chrome extension that hides every member of an FL group you pick. Their posts, comments, notifications and messages leave your screen. Nobody is blocked and nobody is told.

## What it does

Open a group on FL and press **Mass Hide Members**. From then on, everyone in that group disappears from your screen:

- their posts and discussions
- their comments, and the replies under them
- their notifications, loves and mentions
- their message threads in your inbox
- their cards in member lists and search results

If you open the hidden group, or the profile of someone in it, a full-page cover tells you so. Press "Go back" to leave, or "Show the page" to see it anyway.

What it does not do:

- It does not block anyone on FL. Your FL account and your block list stay exactly as they are.
- It does not tell anyone. The people you hide can still see your profile and your posts.
- It does not post, report, message or change anything on FL.

## How to use it

1. Open the group on FL.
2. Press **Mass Hide Members** in the bottom-right corner.
3. Keep the tab open while it reads the member list. It reads 20 members per page and waits 0.4 seconds between pages, so a group of 2,000 members takes at least 40 seconds.

To undo, open the group again and press **Show this group's members**. Everything from that group shows again at once.

## Your data

### What it reads

- **The FL pages you open.** Any extension that works on a website can see that website's pages. This one looks only at usernames and links, to decide what to hide. It does not save or send the text of posts, comments or messages.
- **The group's member list.** When you press the button, it opens the group's member pages in the background and collects the usernames.

### What it stores

Everything stays on your own computer, in Chrome's storage for this extension. For each group you hide, it keeps:

- the group's name
- the usernames of its members
- the time it last read the list

It also keeps one time stamp, so two open tabs do not read the same list at once. It stores nothing else. Not your username, not your password, not your messages, not your browsing history.

### What it sends

- **To the developer, or anyone else: nothing.** There is no server, no analytics, no tracking and no ads.
- **To FL: only requests for the group's member pages.** These are the same pages you see when you click "Members" on a group and go through the pages. Your browser asks for them with your normal FL login, so FL can see that your account opened them, as it can with any page you open. They go out when you press the button, and after that about once a day for each hidden group, while you use FL.

### What Chrome lets it do

When you install it, Chrome shows its two permissions:

- **Storage**, to save the member lists on your computer.
- **Access to FL pages only.** It cannot see other websites, your other tabs or your history.

## How it works, in plain words

1. **It reads the list.** It requests the group's member pages one at a time and writes down every username.
2. **It remembers the list.** It saves the usernames on your computer, so the hiding continues on every page and after Chrome restarts.
3. **It hides as you browse.** On every FL page, it checks who wrote each post, comment, notification, inbox row and member card. If the writer is on the list, it makes that piece invisible. FL adds more content as you scroll, so it checks again each time the page changes. The pieces are hidden, not deleted, so undo is instant.
4. **It covers hidden pages.** On the hidden group's pages, and on the profile of a hidden person, it shows a full-page cover with "Go back" and "Show the page".
5. **It keeps the list up to date.** Once a day it reads the member list again and adds anyone who joined. People who leave the group stay hidden.

## The code, file by file

| File | What it is |
| --- | --- |
| `manifest.json` | The extension's ID card: its name, its icon, the one permission it asks for, and the one site it runs on. |
| `content.js` | All the code that runs. About 250 lines, with a comment above each part. |
| `icons/` | The icon, in three sizes. |
| `PRIVACY.md` | The privacy policy. |
| `store/` | The Chrome Web Store text and pictures. `mock.html` and `tile.html` are the pages used to make the pictures; the names on them are invented. |
| `scripts/make-icons.py` | Draws the icon. |
| `scripts/verify.sh` | Checks the extension before a release. |
| `LICENSE` | The MIT license: you can use, copy and change this code freely. |

### Inside content.js

The file runs top to bottom in these parts:

1. **The hiding rule.** One line of style that makes anything marked "hidden" invisible.
2. **Who wrote this?** `authorsOf` finds the username behind each post, comment, inbox row or member card.
3. **Name lists.** `hideName` takes one name out of a list like "A, B and C" and tidies the commas.
4. **Notifications.** `hideNotifications` removes hidden names from a notification, and the whole notification if everyone in it is hidden.
5. **Watching the page.** A page watcher runs the check again whenever FL adds new content.
6. **Reading the member list.** `readMembers` requests the member pages. This is the only part that uses the internet.
7. **The daily update.** `refreshOldest` reads a list again when it is more than a day old.
8. **The cover.** `coverFor` and `renderOverlay` build the full-page cover.
9. **The panel.** `render` and `toggle` show the button on group pages and turn hiding on or off.

### Check it yourself

You do not need to trust this page. Open `content.js` and search for these words:

- `fetch` appears once, in `readMembers`. Its address starts with `/groups/`, which means the request can only go to the site you are on.
- `http`, `XMLHttpRequest`, `sendBeacon` and `WebSocket` appear zero times. There is no other way for the code to send anything out.

## Install from this code

1. On this page, press **Code**, then **Download ZIP**, and unzip it.
2. In Chrome, open `chrome://extensions` and turn on **Developer mode** (top right).
3. Press **Load unpacked** and pick the unzipped folder.

## Limits

- It hides only in this Chrome browser. Your phone, the FL app and other browsers still show everyone.
- It depends on how FL builds its pages. If FL changes its design, some items can show again until the extension is updated.
- Name lists are tidied for English only.
- To hide fewer people, unhide the whole group. There is no way to unhide one person yet.
- If FL refuses a page while it reads a large group, nothing is hidden. Wait a few minutes and press the button again.

## License

MIT. See `LICENSE`.
