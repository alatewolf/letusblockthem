# Let Us Block Them

Let Us Block Them is a free extension (an add-on) for the Chrome and Firefox web browsers. It hides everyone in an FL group you pick, so you stop seeing them.

- Their posts, comments, notifications and messages disappear from your screen.
- Nobody is blocked, and nobody is told.
- Your list of hidden people stays on your computer. Nobody else gets it, not even the people who made this extension.

## What it hides

Pick a group, and everyone in it disappears from what you see on FL:

- their posts and discussions
- their comments, and the replies under them
- their notifications, loves and mentions
- their conversations in your inbox
- their cards in member lists and search results

If you open the hidden group, or the profile of someone in it, a dark page covers it and tells you why. Press "Go back" to leave, or "Show the page" to see it anyway.

## Why hide, and not block?

Some of the groups people most want gone have over 69,000 members. Blocking all of them is a bad idea. To see why, it helps to know one thing about how websites work.

Every time you open a page or press a button on FL, your browser sends one message to FL's computers. This message is called a request. FL's computers can only deal with so many requests at once. When too many arrive together, the site slows down or stops working for everyone.

1. Blocking would flood FL with requests. Each block is one request, and it makes FL change its records, which is more work for FL than showing a page. Blocking a group of 69,000 people means 69,000 of these from your account. If 1,000 people did the same, FL would get 69 million block requests. That is the kind of flood that crashes a website.
2. It would almost certainly get your account banned. No person blocks 69,000 people by hand, so FL would see a robot at work, and it would be right. Almost all online businesses ban this in the rules you agree to when you sign up, and the usual result is a banned account.
3. You could not take it back. Unblocking everyone means another 69,000 requests.

This extension never asks FL to change anything. It only looks at the group's member list: the same pages you can open yourself from the group's "Members" tab. It looks at one page of 20 names at a time, with a short pause between pages, and keeps the names on your computer. All the hiding happens on your own screen.

For a group of 69,000 members:

| | Block everyone | Hide with this extension |
| --- | --- | --- |
| Requests to FL | 69,000 or more | about 3,450, then the same once a week to catch new members |
| What each request does | blocks one person | looks at one page of 20 names |
| What changes on FL | 69,000 blocks | nothing |
| To undo | 69,000 more requests | one button, no requests |

## How to use it

1. Install the extension. The steps are in "Install it" below.
2. Open the group on FL.
3. Press "Mass Hide Members" in the bottom-right corner.
4. Keep the tab open while it reads the member list. It takes at least 20 seconds for every 1,000 members, so a group of 69,000 takes over 20 minutes.

To bring everyone back, open the group again and press "Show this group's members".

## Your data

### What it looks at

- The FL pages you open. Any extension that works on a website can see that website's pages. This one only looks at the usernames on each page, to decide what to hide. It never keeps or sends what anyone wrote.
- The group's member list, when you press the button, and once a week after that to catch new members.

### What it keeps

Your browser gives each extension a small private space on your computer. Websites cannot read it, and the browser does not copy it to Google, Mozilla or your other devices. This extension keeps only:

- the name of each group you hide
- the usernames of its members
- when it last looked at the member list
- one time note, so two open FL tabs do not read the same list at once

Nothing else. Not your username, your password, your messages or the sites you visit.

### What it sends

- To the people who made it, or anyone else: nothing. There is no company server, no tracking and no ads.
- To FL: only requests to see the group's member pages. Your browser sends them with your normal FL login, so FL can see that your account looked at those pages, the same as when you open any page yourself.

### What your browser allows it to do

When you install it, Chrome warns that the extension can "read and change your data" on FL, and Firefox says it can "access your data" for FL. Both show this warning for every extension that changes what a website shows. Here it means the extension can hide things on FL pages. It cannot see any other website, your other tabs or your history.

## How it works

1. It makes a list. It opens the group's member pages one by one and writes down every username.
2. It keeps the list on your computer, so hiding still works on every page and after you restart your browser.
3. It hides as you browse. On every FL page, it checks who wrote each post, comment, notification, conversation and member card. If that person is on the list, it hides that item. FL keeps adding things as you scroll, so it checks again each time.
4. It covers hidden pages. If you open the hidden group or one of its members' profiles, a dark page covers it.
5. It stays up to date. Once a week, it looks at the member list again and adds anyone who joined. People who leave the group stay hidden.

Nothing is deleted, only hidden. That is why bringing everyone back is instant.

## The code

You do not need to read any code to use this extension. This part is for anyone who wants to check what it does.

| File | What it is |
| --- | --- |
| `manifest.json` | The extension's ID card: its name, its icon, what the browser allows it to do and the one website it works on. |
| `content.js` | All the instructions the extension follows. About 250 lines, with a note in plain English above each part. |
| `icons/` | The icon, in three sizes. |
| `PRIVACY.md` | The privacy policy. |
| `store/` | The text and pictures for the Chrome Web Store. The names in the pictures are made up. |
| `scripts/` | Two tools for the developer: one draws the icon, one checks the extension before a release. |
| `web-ext-config.mjs` | Settings for Mozilla's tool that checks and packs the Firefox file. |
| `LICENSE` | The license: anyone can use, copy and change this code for free. |

### Inside content.js

The instructions are split into parts. Each part has a name and does one job:

1. The hiding rule tells the browser to make anything marked "hidden" invisible.
2. `authorsOf` works out who wrote each post, comment, conversation or member card.
3. `hideName` takes one name out of a list like "A, B and C" and tidies the commas.
4. `hideNotifications` takes hidden names out of your notifications, and hides a notification completely if everyone in it is hidden.
5. A watcher runs the check again each time FL adds new things to the page.
6. `readMembers` looks at the group's member pages. This is the only part that talks to FL.
7. `refreshOldest` looks at a member list again when it is more than a week old.
8. `coverFor` and `renderOverlay` make the dark page that covers a hidden group or profile.
9. `render` and `toggle` show the button on group pages and turn hiding on or off.

### Check it yourself

You do not need to trust this page. Open `content.js` above, press Ctrl+F (Cmd+F on a Mac) and search for these:

- `http` and `.com`: 0 results. To send anything to another website, the code would have to contain that website's address. It contains none.
- `fetch`: 1 result, in `readMembers`. This is the line that asks FL for the member pages. Its address starts with `/groups/`, with no website name in front, so it can only go to FL.

## Install it

### Firefox, on a computer or an Android phone

1. Open [Let Us Block Them on Firefox Add-ons](https://addons.mozilla.org/firefox/addon/let-us-block-them/) in Firefox.
2. Press "Add to Firefox", then "Add".
3. Open FL. The "Mass Hide Members" button shows on group pages.

Firefox updates it by itself when a new version comes out.

### Chrome

1. Press the green "Code" button near the top of this page, then "Download ZIP". Open the downloaded file to unzip it.
2. In Chrome, type `chrome://extensions` in the address bar and press Enter.
3. Turn on "Developer mode" in the top-right corner. This is the normal Chrome setting for installing an extension from a folder.
4. Press "Load unpacked" and pick the unzipped folder.
5. Open FL. The "Mass Hide Members" button shows on group pages.

## Limits

- It only hides things in the browser where you installed it. The FL app and your other browsers still show everyone.
- It depends on how FL's pages are built. If FL changes its design, some things can show again until this extension is updated.
- People who join a hidden group can stay visible for up to a week, until the next weekly check.
- You cannot bring back one person on their own yet, only the whole group.
- If FL stops answering while it reads a large group, nothing is hidden. Wait a few minutes and try again.
- If you use FL in a language other than English, a list of names like "A, B and C" can show a stray comma.

## License

MIT: anyone can use, copy and change this code for free. See `LICENSE`.
