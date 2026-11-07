// Hides everyone in the groups you pick: their posts, comments, inbox rows and member cards.
// It only hides things on your screen. The one request it sends is a read of the group's member list.

const HIDE = 'data-fl-hidden';
let groups = {}; // { [groupId]: { name, nicks: [] } }, saved in chrome.storage.local
let hidden = new Set();
let reading = false;

const style = document.createElement('style');
style.textContent = `[${HIDE}]{display:none!important}`;
document.documentElement.append(style);

const nickOf = (href) => (href && /^\/[^/?#]+$/.test(href) ? href.slice(1) : null);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Every element type that has one author, and how to read that author.
const TARGETS = '[data-comment-item-author-nickname-value], [data-conversation-card], [onclick^="openLink(event, \'/"], article';

function authorsOf(el) {
  const commenter = el.getAttribute('data-comment-item-author-nickname-value');
  if (commenter) return [commenter];
  const hrefs = [...el.querySelectorAll('a[href]')].map((a) => nickOf(a.getAttribute('href')));
  if (el.hasAttribute('data-conversation-card')) return hrefs; // the inbox row links to the other person
  const card = el.getAttribute('onclick')?.match(/openLink\(event, '([^']+)'\)/);
  if (card) return [nickOf(card[1])];
  // posts and feed stories: the first profile link is the poster; feed stories also name the author
  return [hrefs.find(Boolean), nickOf(el.getAttribute('data-dwell-author-path'))];
}

function hideAll() {
  if (!hidden.size) return;
  for (const el of document.querySelectorAll(TARGETS)) {
    if (!el.hasAttribute(HIDE) && authorsOf(el).some((n) => hidden.has(n))) el.setAttribute(HIDE, '');
  }
}

function load(next) {
  groups = next || {};
  hidden = new Set(Object.values(groups).flatMap((g) => g.nicks));
  document.querySelectorAll(`[${HIDE}]`).forEach((el) => el.removeAttribute(HIDE));
  hideAll();
  renderPanel();
}

let queued = false;
new MutationObserver(() => {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => { queued = false; hideAll(); });
}).observe(document.documentElement, { childList: true, subtree: true });

chrome.storage.onChanged.addListener((changes) => { if (changes.groups) load(changes.groups.newValue); });
chrome.storage.local.get('groups').then(({ groups }) => load(groups));

// The member list is plain pages of 20: /groups/:id/members?page=N
async function readMembers(id, onPage) {
  const nicks = new Set();
  let last = 1;
  for (let page = 1; page <= last; page++) {
    onPage(page, last);
    const res = await fetch(`/groups/${id}/members?page=${page}`);
    if (!res.ok) throw new Error(`FetLife answered ${res.status} on page ${page}. Try again in a few minutes.`);
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

// A small panel on group pages: one button to hide or show that group's members.
let panel, button, note;

function groupId() {
  return location.pathname.match(/^\/groups\/(\d+)/)?.[1];
}

function renderPanel(message) {
  if (!document.body) return;
  if (!panel) {
    panel = document.createElement('div');
    panel.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:2147483647;max-width:280px;padding:12px;border-radius:6px;background:#262626;color:#d4d4d4;font:14px/1.45 system-ui,sans-serif;box-shadow:0 4px 16px rgb(0 0 0/.5);text-wrap:pretty';
    button = document.createElement('button');
    button.type = 'button';
    button.style.cssText = 'display:block;width:100%;min-height:44px;padding:0 14px;border:0;border-radius:4px;background:#b91c1c;color:#fff;font:inherit;font-weight:600;cursor:pointer';
    note = document.createElement('p');
    note.style.cssText = 'margin:8px 0 0';
    note.setAttribute('aria-live', 'polite');
    panel.append(button, note);
    button.addEventListener('click', toggle);
  }
  if (!panel.isConnected) document.documentElement.append(panel);
  const id = groupId();
  panel.style.display = id || reading ? 'block' : 'none';
  if (reading) return;
  const group = groups[id];
  button.disabled = false;
  button.textContent = group ? "Show this group's members" : "Hide this group's members";
  note.textContent = message ?? (group
    ? `Hiding ${group.nicks.length.toLocaleString()} members: their posts, comments and messages.`
    : 'Hides their posts, comments and messages on your screen. Nobody is blocked or told.');
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
  button.disabled = true;
  button.textContent = 'Reading the member list';
  try {
    const nicks = await readMembers(id, (page, last) => {
      note.textContent = `Page ${page.toLocaleString()} of ${last.toLocaleString()}. Keep this tab open.`;
    });
    const name = document.querySelector('h1')?.textContent.trim() || `Group ${id}`;
    reading = false;
    await chrome.storage.local.set({ groups: { ...groups, [id]: { name, nicks } } });
  } catch (err) {
    reading = false;
    renderPanel(`Nothing hidden. ${err.message}`);
  }
}

document.addEventListener('turbo:load', () => renderPanel());
document.addEventListener('DOMContentLoaded', () => renderPanel());
