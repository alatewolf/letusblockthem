// Hides everyone in the groups you pick: their posts, comments, notifications, inbox rows and member cards.
// It only hides things on your screen. The only requests it sends are reads of each group's member list.

const HIDE = 'data-fl-hidden';
const REFRESH_MS = 7 * 24 * 3600e3; // re-read each hidden group's member list once a week, to catch new members
let groups = {}; // { [groupId]: { name, nicks: [], updatedAt } }, saved in chrome.storage.local
let hidden = new Set();
let reading = false;
let shownAnyway = null; // the group or person whose page the viewer chose to see anyway

const style = document.createElement('style');
style.textContent = `[${HIDE}]{display:none!important}`;
document.documentElement.append(style);

const nickOf = (href) => (href && /^\/[^/?#]+$/.test(href) ? href.slice(1) : null);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const groupId = () => location.pathname.match(/^\/groups\/(\d+)/)?.[1];

// Every element type that has one author, and how to read that author.
const TARGETS = '[data-comment-item-author-nickname-value], [data-conversation-card], [onclick^="openLink(event, \'/"], article';

function authorsOf(el) {
  const commenter = el.getAttribute('data-comment-item-author-nickname-value');
  if (commenter) return [commenter];
  const nicks = [...el.querySelectorAll('a[href]')].map((a) => nickOf(a.getAttribute('href')));
  if (el.hasAttribute('data-conversation-card')) return nicks; // the inbox row links to the other person
  // member cards and notification rows open a page of theirs; posts and stories link the poster first
  const opens = el.getAttribute('onclick')?.match(/openLink\(event, '\/([^/?#']+)/)?.[1];
  return [opens, nicks.find(Boolean), nickOf(el.getAttribute('data-dwell-author-path'))];
}

// Removes one name from a list like "A, B, and C" with its comma, so no stray ", ," is left.
function hideName(a) {
  a.setAttribute(HIDE, '');
  // shortcut: knows the English "and" only; add other words if FetLife runs in another language
  const isSep = (n) => (n?.nodeType === 3 || n?.hasAttribute?.('data-fl-sep')) && n.textContent.trim() && /^\s*,?\s*(and\s*)?$/.test(n.textContent);
  let sep = isSep(a.nextSibling) ? a.nextSibling : isSep(a.previousSibling) ? a.previousSibling : null;
  if (sep?.nodeType === 3) {
    const span = document.createElement('span');
    span.setAttribute('data-fl-sep', '');
    sep.replaceWith(span);
    span.append(sep);
    sep = span;
  }
  sep?.setAttribute(HIDE, '');
}

// A notification block shows your post at the top (header) and the people who acted below it.
function hideNotifications() {
  for (const section of document.querySelectorAll('#notifications-stories section')) {
    const names = [...section.querySelectorAll('a[href]')].filter((a) => nickOf(a.getAttribute('href')) && !a.closest('header, [data-comment-item-author-nickname-value]'));
    names.filter((a) => !a.hasAttribute(HIDE) && hidden.has(nickOf(a.getAttribute('href')))).forEach(hideName);
    const actors = [...names, ...section.querySelectorAll('[data-comment-item-author-nickname-value]')];
    if (actors.length && actors.every((el) => el.closest(`[${HIDE}]`))) section.setAttribute(HIDE, '');
  }
}

function hideAll() {
  if (!hidden.size) return;
  for (const el of document.querySelectorAll(TARGETS)) {
    if (!el.hasAttribute(HIDE) && authorsOf(el).some((n) => hidden.has(n))) el.setAttribute(HIDE, '');
  }
  hideNotifications();
}

function load(next) {
  groups = next || {};
  hidden = new Set(Object.values(groups).flatMap((g) => g.nicks));
  document.querySelectorAll(`[${HIDE}]`).forEach((el) => el.removeAttribute(HIDE));
  hideAll();
  render();
}

let queued = false;
new MutationObserver(() => {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => { queued = false; hideAll(); });
}).observe(document.documentElement, { childList: true, subtree: true });

chrome.storage.onChanged.addListener((changes) => { if (changes.groups) load(changes.groups.newValue); });
chrome.storage.local.get('groups').then(({ groups }) => { load(groups); refreshOldest(); });

// The member list is plain pages of 20: /groups/:id/members?page=N
async function readMembers(id, onPage = () => {}) {
  const nicks = new Set();
  let last = 1;
  for (let page = 1; page <= last; page++) {
    onPage(page, last);
    const res = await fetch(`/groups/${id}/members?page=${page}`);
    if (!res.ok) throw new Error(`FL answered ${res.status} on page ${page}. Try again in a few minutes.`);
    const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
    doc.querySelectorAll('main a.font-bold[href^="/"]').forEach((a) => {
      const n = nickOf(a.getAttribute('href'));
      if (n) nicks.add(n);
    });
    if (page === 1) {
      const pages = [...doc.querySelectorAll('a[href*="members?page="]')]
        .map((a) => Number(new URL(a.getAttribute('href'), location.origin).searchParams.get('page')));
      last = Math.max(1, ...pages);
    }
    await sleep(400); // one page every half second or so, like a person clicking through
  }
  return [...nicks];
}

// Once a week, while you use FetLife, re-read one hidden group and add its new members.
// People who leave the group stay hidden.
async function refreshOldest() {
  const now = Date.now();
  const id = Object.keys(groups).find((g) => now - (groups[g].updatedAt || 0) > REFRESH_MS);
  const { refreshing = 0 } = await chrome.storage.local.get('refreshing');
  if (!id || reading || now - refreshing < 10 * 60e3) return; // another tab is reading it now
  await chrome.storage.local.set({ refreshing: now });
  try {
    const nicks = await readMembers(id);
    const { groups: saved = {} } = await chrome.storage.local.get('groups');
    if (saved[id]) {
      const merged = { ...saved[id], nicks: [...new Set([...saved[id].nicks, ...nicks])], updatedAt: Date.now() };
      await chrome.storage.local.set({ groups: { ...saved, [id]: merged } });
    }
  } catch {
    // FetLife refused a page; the next page load after the 10-minute lock tries again
  }
  await chrome.storage.local.set({ refreshing: 0 });
}

function ago(t) {
  const hours = Math.round((t - Date.now()) / 3600e3);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  return Math.abs(hours) < 24 ? rtf.format(hours, 'hour') : rtf.format(Math.round(hours / 24), 'day');
}

// A full-page cover on a hidden group's pages and on a hidden person's profile.
let overlay;

function coverFor() {
  const id = groupId();
  if (id && groups[id]) {
    const { nicks, updatedAt } = groups[id];
    const when = updatedAt ? ` The member list updated ${ago(updatedAt)}.` : '';
    return { key: `g${id}`, title: 'You hid this group', body: `Its ${nicks.length.toLocaleString()} members stay hidden on every page.${when}` };
  }
  const nick = location.pathname.split('/')[1];
  if (hidden.has(nick)) {
    const group = Object.values(groups).find((g) => g.nicks.includes(nick));
    return { key: `u${nick}`, title: 'You hid this person', body: `${nick} is a member of ${group.name}.` };
  }
  return null;
}

function renderOverlay() {
  const cover = coverFor();
  const show = !!cover && cover.key !== shownAnyway;
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'fl-cover-title');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483646;display:none;align-items:center;justify-content:center;padding:16px;background:#1c1c1c;color:#e5e5e5;font:16px/1.5 system-ui,sans-serif';
    const button = 'display:block;width:100%;min-height:44px;margin-top:8px;padding:0 16px;border:0;border-radius:4px;font:inherit;font-weight:600;cursor:pointer';
    overlay.innerHTML = `
      <div style="width:100%;max-width:340px;text-align:center">
        <h2 id="fl-cover-title" style="margin:0 0 8px;font-size:22px;line-height:1.3;text-wrap:balance"></h2>
        <p style="margin:0 0 24px;text-wrap:pretty"></p>
        <button type="button" data-back style="${button};background:#b91c1c;color:#e5e5e5">Go back</button>
        <button type="button" data-show style="${button};background:#333;color:#e5e5e5">Show the page</button>
      </div>`;
    overlay.querySelector('[data-back]').addEventListener('click', () => (history.length > 1 ? history.back() : location.assign('/home')));
    overlay.querySelector('[data-show]').addEventListener('click', showAnyway);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay.style.display === 'flex') showAnyway(); });
  }
  if (!overlay.isConnected) document.documentElement.append(overlay);
  const wasShown = overlay.style.display === 'flex';
  overlay.style.display = show ? 'flex' : 'none';
  if (show) {
    overlay.querySelector('h2').textContent = cover.title;
    overlay.querySelector('p').textContent = cover.body;
    if (!wasShown) overlay.querySelector('[data-back]').focus();
  }
  return show;
}

function showAnyway() {
  shownAnyway = coverFor()?.key ?? null;
  render();
}

// A small panel on group pages: one button to hide or show that group's members.
let panel, panelButton, note;

function render(message) {
  if (!document.body) return;
  const covered = renderOverlay();
  if (!panel) {
    panel = document.createElement('div');
    panel.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:2147483647;max-width:280px;padding:12px;border-radius:6px;background:#333;color:#e5e5e5;font:14px/1.45 system-ui,sans-serif;text-wrap:pretty';
    panelButton = document.createElement('button');
    panelButton.type = 'button';
    panelButton.style.cssText = 'display:block;width:100%;min-height:44px;padding:0 14px;border:0;border-radius:4px;background:#b91c1c;color:#e5e5e5;font:inherit;font-weight:600;cursor:pointer';
    note = document.createElement('p');
    note.style.cssText = 'margin:8px 0 0';
    note.setAttribute('aria-live', 'polite');
    panel.append(panelButton, note);
    panelButton.addEventListener('click', toggle);
  }
  if (!panel.isConnected) document.documentElement.append(panel);
  const id = groupId();
  panel.style.display = (id || reading) && !covered ? 'block' : 'none';
  if (reading) return;
  const group = groups[id];
  panelButton.disabled = false;
  panelButton.textContent = group ? "Show this group's members" : 'Mass Hide Members';
  note.textContent = message ?? (group
    ? `Hiding ${group.nicks.length.toLocaleString()} members: their posts, comments, notifications and messages.`
    : 'Hides their posts, comments, notifications and messages on your screen. Nobody is blocked or told.');
}

async function toggle() {
  const id = groupId();
  if (!id || reading) return;
  if (groups[id]) {
    const { [id]: _, ...rest } = groups;
    await chrome.storage.local.set({ groups: rest });
    return;
  }
  reading = true;
  panelButton.disabled = true;
  panelButton.textContent = 'Reading the member list';
  try {
    const nicks = await readMembers(id, (page, last) => {
      note.textContent = `Page ${page.toLocaleString()} of ${last.toLocaleString()}. Keep this tab open.`;
    });
    const name = document.querySelector('h1')?.textContent.trim() || `Group ${id}`;
    reading = false;
    shownAnyway = `g${id}`; // they are on the page already; the cover shows on the next visit
    await chrome.storage.local.set({ groups: { ...groups, [id]: { name, nicks, updatedAt: Date.now() } } });
  } catch (err) {
    reading = false;
    render(`Nothing hidden. ${err.message}`);
  }
}

document.addEventListener('turbo:load', () => render());
document.addEventListener('DOMContentLoaded', () => render());
