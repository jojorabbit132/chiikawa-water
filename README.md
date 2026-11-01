# Little Sips — monthly reports

## Files
- index.html: complete app, layout, styles and water/mood/notes logic
- monthly.js: complete monthly summary and CSV export logic
- chiikawa.png: supplied reference image
- .nojekyll: optional GitHub Pages marker

## Publish on GitHub
1. Unzip this folder.
2. In your existing GitHub repository choose Add file > Upload files.
3. Upload index.html, monthly.js and chiikawa.png at the repository root, replacing the older versions. Commit changes. Do not upload the ZIP itself.
4. Settings > Pages: Source = Deploy from a branch; Branch = main; Folder = / (root); Save.
5. Wait for the Pages deployment to finish. Open Visit site. If old content remains, reload the page.

For a new repository, create a public repository first, then follow the same upload steps. Do not include .gitlab-ci.yml; it is not needed for GitHub.

## Monthly reports
Choose a month under Monthly water summary. The report includes total logged water, average per calendar day, days with logs and a row for each date. The current month average includes days through today; past months include every day. Unlogged days contribute zero to the average but are labelled as no entries, not confirmed zero water intake. Future dates are excluded from averages.

Download month CSV saves little-sips-YYYY-MM.csv. It includes Date, Total_ml, Entries and Status. Days without logs have a blank Total_ml value. No notes or mood data are exported. She can send you this CSV and you can open it in Excel or Google Sheets.

## Existing records
The storage key remains little-sips-v1. Updating the app at the same website origin preserves existing browser records. Local file data does not move to GitHub, and records do not sync across browsers or devices. Clearing browser storage removes logs. Export regularly to keep a copy. This app does not backfill days that were not logged.

## Local preview
Keep all files in the same folder. For a reliable local preview run python3 -m http.server 8000 in that folder, then visit http://localhost:8000. The published GitHub HTTPS URL is the intended address for regular use.
