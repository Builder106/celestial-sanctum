# Editing the parish website

This guide is for whoever updates content on `celestialsanctumparish.org`
— announcements, blog posts, the shepherd's bio, service times, page
copy. No code is involved; everything is done from a browser through
the parish CMS.

## How to log in

1. Open https://admin.celestialsanctumparish.org
2. Sign in with the Google account you were invited with. (If you
   haven't been invited, ask whoever set up the website to add you at
   https://www.sanity.io/manage/project/jsf7d3td/members.)
3. You'll see a list on the left — that's the parish's content. Clicking
   any item opens it for editing on the right.

## What's in here

| Item | What it controls |
|---|---|
| **Site Settings** | Parish address, phone number, email, social links, footer text — anything shared across every page. |
| **Homepage** | Everything on `celestialsanctumparish.org/` — hero headline, welcome paragraph, the "A Sunday at Sanctum" section, the shepherd's letter preview, the bible verse box. |
| **Visit Page** | The first-time-visitor doorway at `/visit` — what to expect, dress, parking, children. |
| **Shepherd** | Bio and portrait shown on the homepage and the About page. |
| **About Page Sections** | Seven sections that make up `/about` — Story, Mission, Shepherd, Doctrine, Mode of Worship, Ministries, Choir. Each is a separate document so you can edit one without disturbing the others. |
| **Blog Posts** | Items shown on `/watch`. Each post is a teaser with a title, summary, date, and a link out to the full article. |

## How to make an edit

1. Click the item you want to change in the left-hand list.
2. Make your changes in the form on the right. The Studio saves your
   work as a **draft** automatically every few seconds — you won't lose
   it if you close the tab.
3. When you're happy, click **Publish** at the bottom right.
4. Within about **60-90 seconds**, the change is live on the public
   site. (The site has to rebuild itself; that's what the wait is.)
5. Open `celestialsanctumparish.org` in a new tab to check the result.

If you want to step away and come back later, just close the tab. Your
draft will still be there when you return. Drafts don't affect the
public site — only **Publish** does that.

## Working with images

- Drag-and-drop a photo into any image field, or click the field to
  browse your computer.
- After uploading, you can **crop** by clicking the crop icon. Adjust
  the focal point — that's the part of the photo that stays visible
  when the image gets cropped at different sizes (mobile vs desktop).
- Always fill the **alt text** field. It's read aloud by screen readers
  and shows up if the image fails to load. One short sentence
  describing what's in the photo is enough.

## Writing with the rich-text editor

Several fields use a rich-text editor (the shepherd's bio, blog post
content, the about-page sections). It works like a simplified word
processor:

- **Bold**, *italic*, links — toolbar at the top of the field.
- **Headings** — use the "Normal" dropdown to mark paragraphs as H2 or
  H3 if you need sub-sections. (H1 is the page title; you don't need to
  set it.)
- **Lists** — bullet or numbered, from the toolbar.
- **Block quotes** — the "Quote" style for pulled-out scripture or
  testimony.

A few things the editor won't let you do (on purpose):
- No font/color changes. The site's typography is set globally so every
  page looks consistent.
- No raw HTML. If you want something the editor doesn't support, ask
  whoever maintains the website — it's almost always better to extend
  the schema than to embed HTML.

## Adding a new blog post

1. Click **Blog Posts** in the left list.
2. Click the green **+** button at the top.
3. Fill in:
   - **Title** — what shows on the `/watch` page card.
   - **Summary** — one or two sentences. Shown on the card under the
     title.
   - **External URL** — if the full post lives on WordPress (or
     anywhere else), paste the link here. Visitors who click the card
     are sent to that URL.
   - **Publish date** — sets the order on `/watch` (most recent first).
4. Click **Publish**.

## Things you can't accidentally break

The Studio is set up to **prevent destructive mistakes**:

- You can't delete Site Settings, the Homepage, the Visit Page, or the
  Shepherd record. Those are "singletons" — there's only one of each,
  and the public site reads from them. Deleting one would leave a blank
  section. The delete button is hidden for these.
- You can't duplicate singletons either, for the same reason.
- Drafts only affect what *you* see in the Studio. The public site
  always shows the last published version.

You **can** delete blog posts and individual About-page sections — both
are collections, not singletons. Be careful: a deleted About section
disappears from `/about` immediately on next publish.

## Common edits, with where to find them

| I want to change... | Where |
|---|---|
| The parish address shown in the footer | Site Settings → Address |
| The phone number on the contact page | Site Settings → Phone |
| The Sunday service time | Visit Page → Service Times |
| The shepherd's photo | Shepherd → Portrait |
| The homepage hero headline | Homepage → Hero → Headline |
| Add a new blog post | Blog Posts → + (top-right) |
| Edit "What to expect" on the Visit page | Visit Page → What to Expect |
| Change a single section on /about | About Page Sections → click the section name |

## Getting help

- **Something looks wrong on the public site after I published** — give
  it 90 seconds, then hard-refresh (`Cmd+Shift+R` on Mac, `Ctrl+F5`
  on Windows). If it's still wrong, screenshot the Studio field and
  the public page and send both to the maintainer.
- **I clicked the wrong button and lost something** — open the
  document and click the clock icon (top-right). That shows the full
  history; pick any version and restore it. The Studio keeps every
  revision for free.
- **The Studio won't load** — try logging out and back in, or open in
  a private/incognito window. If that doesn't work, the maintainer can
  check whether something's down.
