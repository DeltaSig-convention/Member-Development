# Delta Sigma Phi · Member Development Dashboard

Proof of concept for the gamification platform launching at Convention 2027. Reads member data in the Salesforce shape, runs the badge and XP rules, and shows the dashboard. Hosted on GitHub Pages for now; moves to Delta Tech (Laravel) for the full release.

---

## Put it online (one time, about 15 minutes, no installs)

GitHub builds and publishes the site for you. You don't need Node on your computer.

### 1. Create the repository
1. Go to **github.com** and sign in.
2. Click **+** (top right) → **New repository**.
3. Name it `dsp-member-development`. Leave it **Public**. Don't add a README.
4. Click **Create repository**.

### 2. Upload the files
1. Unzip `dsp-member-development.zip` on your computer.
2. On the new repo page, click **uploading an existing file**.
3. Open the unzipped folder, select **everything inside it** (not the folder itself), and drag it onto the page.
4. Scroll down and click **Commit changes**.

> **The `.github` folder won't upload by dragging** — your computer hides folders that start with a dot. Do step 3 to add it.

### 3. Add the publish instructions
1. In the repo, click **Add file → Create new file**.
2. In the name box, type exactly: `.github/workflows/deploy.yml`
   (typing the `/` creates the folders).
3. Open `deploy.yml` from the unzipped folder in any text editor (on a Mac, also in `_github-workflow-copy/deploy.yml`, which isn't hidden), copy all of it, and paste it in.
4. Click **Commit changes**.

### 4. Turn on GitHub Pages
1. In the repo, go to **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.

### 5. Wait for it to build
1. Click the **Actions** tab. You'll see "Deploy to GitHub Pages" running.
2. When it shows a green check (2–3 minutes), go back to **Settings → Pages**. Your link is at the top:
   `https://YOUR-USERNAME.github.io/dsp-member-development/`

From now on, any file you change and commit in GitHub republishes the site automatically.

---

## Using the dashboard

The **Testing** panel (bottom of the sidebar, or the bar at the top on a phone) controls what you're looking at:

- **Member:** the demo member, Quincy Elliott or Andrew Thomas (real Salesforce snapshots).
- **Pretend today is…:** pick a date to see featured programs and challenges rotate, for example April 12, 2027 for CTW Week.
- **Count staff attendance:** counts staff and facilitator registrations (testing only; members never see this).
- **Program attendance XP (proposal):** awards XP for attending programs, separate from badges.
- **Show content sources:** labels each card Personal, Org-wide or Targeted.

Every option is saved in the address, so you can share an exact view. For example:
`?member=quincy&date=2027-04-12&progxp=1&sources=1`

See `docs/CONTENT_MODEL.md` for what updates itself and what HQ schedules.

## What's real and what's sample data

| Real (from Salesforce) | Sample until built |
|---|---|
| Name, chapter, school, initiation and alumni dates | Chapter leaderboard roster (your row is real) |
| Program attendance (CA, CEI, LI, Convention, Day of Service, C&C, retreats) | Badge rarity percentages |
| Officer terms and XP | Self-reported actions (Formstack, December) |
| Chapter awards during membership | Rewards catalog |
| Foundation giving (yes/no only) | Friends (Phase 2) |

## Where things live

| To change… | Edit |
|---|---|
| Badges, actions, XP values, tiers, achievements, rewards | `src/config/program.js` |
| Featured programs, challenges, audiences and dates | `src/config/program.js` (bottom section) |
| How data becomes badges and XP | `src/lib/engine.js` |
| Where member data comes from | `src/lib/loadMember.js` |
| Salesforce snapshots | `src/data/andrew-thomas.snapshot.js`, `src/data/quincy-elliott.snapshot.js` |
| Screens and layout | `src/App.jsx` |
| What Tyler builds toward | `docs/DATA_CONTRACT.md`, `docs/CONTENT_MODEL.md` |

## Checks

Every publish runs `npm test`, which checks that the demo member still earns the expected five badges and 1,050 XP, that Quincy is a Three-Peater, and that featured content targets correctly. If a rule change breaks that, the publish stops and the live site stays as it was.

## For developers

```
npm install
npm run dev      # local preview
npm test         # rules engine checks
npm run build    # production build in dist/
```
