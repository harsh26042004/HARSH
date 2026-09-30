# Harsh Kumar Portfolio

Frontend: HTML, CSS, vanilla JS, Three.js (CDN). Backend: Node + Express.

## Run
    npm install
    npm start                    # http://localhost:3000
    ADMIN_KEY=secret npm start   # protects the messages endpoint

## Where to edit
- `public/js/data.js`    all text, roles, skills, contact details
- `public/css/styles.css`    colours and fonts (top `:root` block)
- `public/js/scene.js`   3D city (CONFIG at the top)
- `public/js/main.js`    one function per feature (typing, stats, tabs, timeline, tilt, form)
- `server.js`            API: POST /api/contact, GET /api/messages (header x-admin-key)
- Contact messages are saved in `data/messages.json`.

## Notes
- The contact form needs the Node server running.
- To add a section (e.g. Media On Stake work samples): add data in data.js, a container in index.html, a render function in main.js.
