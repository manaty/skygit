# SkyGit

<img src="images/skygit_logo.png" alt="SkyGit Logo" width="150"/>

A skype replacement for devs working on github repositories.

This messaging app is a client that requires no server beside your github repositories.

Messages exchanged in conversations linked to a repo are committed to the repo for persistence.

Real-time peer-to-peer connections are established using PeerJS infrastructure.

Call and video recording can be saved to S3 or drive.

[Documentation](doc/README.md)

## Running skygit locally 

Run-time prerequisites
    • Node ≥ 18 (comes with npm 9 +)
    • Git (only for cloning this repo)

    Step-by-step

        1. Clone or download the project
           git clone <your-fork-or-repo>
           cd skygit      # folder that contains package.json
        2. Install JS dependencies
           npm install    # resolves @tailwindcss, vite, svelte …

           # (pnpm i or yarn can be used instead if you prefer)
        3. Start the Vite dev server
           npm run dev

           ├─ Vite will compile the Svelte SPA and print something like
           │  ➜  Local:   http://localhost:5173/
           └─ The browser should open automatically; if not, visit that URL.
        4. First-use flow inside the browser
           • Paste a GitHub Personal-Access-Token (PAT) when prompted.
           • SkyGit will automatically create/private-initialise
             a repo named skygit-config in your GitHub account.
           • You’re ready to add a real repo, start a conversation, etc.

    Useful extra scripts
    • npm run build        → production build in dist/
    • npm run preview      → serve that build locally
    • npm run build:debug  → production build that keeps source-maps, used by
                             npm run deploy (publishes to GitHub Pages).

    That’s all that is required to get SkyGit running locally.