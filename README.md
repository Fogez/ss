# Meeting Cost Meter

A compact, static web app that tracks a meeting's cost as attendees join and leave. No server, database, accounts, or build step is required.

## Run locally

From this directory, start any static file server:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Change salary estimates

Edit `data/employees.js`. Salary estimates live separately from the visible interface and are never rendered individually. Because this is a static app, someone inspecting downloaded source files can still find them; use a backend if the estimates must be secret rather than merely hidden from the screen.

## Deploy

The app is static, so it can be deployed directly from GitHub.

- **Render:** create a **Static Site**, connect the repository, leave the build command blank, and set the publish directory to `.`.
- **Railway:** connect the repository and use `python3 -m http.server $PORT` as the start command.
- **Azure Static Web Apps:** create a Static Web App from the repository, set the app location to `/`, leave the API location empty, and use `.` as the output location.
- **GitHub Pages:** in repository **Settings → Pages**, choose **Deploy from a branch**, then select the branch and `/ (root)`.

## Test

```bash
npm test
```

The tests use Node's built-in test runner, so there are no packages to install.
