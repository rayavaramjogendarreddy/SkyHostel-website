# Google Sheets & Google Drive Integration Setup Guide (with File Uploads)

This guide will help you set up the hostel admission form to submit data directly to Google Sheets and upload Aadhaar and Photo files to Google Drive.

## Step 1: Prepare Google Drive Folders

- **Aadhaar Uploads Folder:**
  - [Aadhaar Uploads](https://drive.google.com/drive/folders/1MBt_d00dCwv2Dh5dS2ns8EYr4y3l27UP)
- **Photo Uploads Folder:**
  - [Photo Uploads](https://drive.google.com/drive/folders/1uCYP_aRlsA6WiDRFEIXu91Niu4YkMkO3)

Make sure you have access to these folders and note their IDs (the long string in the URL).

## Step 2: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "Sky Hostels - Admissions"
4. Copy the spreadsheet ID from the URL (the long string between /d/ and /edit)

> **Note:** You do NOT need to manually add or manage columns. The script will always check and update the header row automatically.

## Step 3: Set Up Google Apps Script

1. Go to [Google Apps Script](https://script.google.com)
2. Click "New Project"
3. Replace the default code with the content from `google-apps-script.js` in your project
4. Replace `'YOUR_SPREADSHEET_ID_HERE'` with your actual spreadsheet ID
5. Make sure the folder IDs for Aadhaar and Photo match the ones above
6. Save the project with a name like "Hostel Admission Form Handler"

## Step 4: Deploy as Web App

1. Click "Deploy" → "New deployment"
2. Choose "Web app" as the type
3. Set the following options:
   - **Execute as**: "Me" (your Google account)
   - **Who has access**: "Anyone"
4. Click "Deploy"
5. Copy the Web App URL that's generated

## Step 5: Update the Admission Form

1. Open `admission.html`
2. Find this line in the JavaScript section:
   ```javascript
   const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
   ```
3. Replace `'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE'` with your actual Web App URL

## Step 6: Test the Integration

1. Open the admission form in your browser
2. Fill out the form and upload test files for Aadhaar and Photo
3. Submit the form
4. Check your Google Sheet for a new row with file links
5. Check the Google Drive folders for the uploaded files
6. Click the links in the sheet to verify file access

## File Upload Rules

- **Aadhaar Upload:** PDF, JPG, JPEG, PNG; max 10MB
- **Photo Upload:** JPG, JPEG, PNG; max 10MB
- Files are stored in their respective Drive folders and links are saved in the sheet

## Troubleshooting

### Common Issues:

1. **"Script not found" or 404 error**
   - Make sure the Web App URL is correct
   - Ensure the script is deployed as a web app
   - Check that "Who has access" is set to "Anyone"

2. **CORS or upload errors**
   - Make sure the form uses `FormData` and does not set a custom `Content-Type`
   - Check browser console for errors

3. **Files not appearing in Drive**
   - Check folder IDs in the Apps Script
   - Ensure your Google account has access to the folders

4. **Files too large or wrong type**
   - Aadhaar: must be PDF, JPG, or PNG and <10MB
   - Photo: must be JPG or PNG and <10MB

5. **Data not appearing in sheet**
   - Check the spreadsheet ID in the Apps Script
   - Ensure the script has permission to access the sheet
   - Check Apps Script execution logs

6. **Email not sending**
   - Make sure the email address is valid
   - Check Apps Script execution logs for email errors

## Data Structure

> **Note:** The script will always check and update the header row in the "Admissions" sheet automatically. You never need to manually add or fix columns.

The form will create a sheet named "Admissions" with the following columns:

1. Timestamp (added automatically for each submission)
2. First Name
3. Last Name
4. Date of Birth
5. Gender
6. Email
7. Mobile
8. Address
9. Institution
10. Course
11. Year of Study
12. Student ID
13. Meal Plan
14. Check-in Date
15. Duration
16. Aadhaar Upload Link (Google Drive link)
17. Photo Upload Link (Google Drive link)
18. Floor Number
19. Room Number
20. Emergency Contact Name
21. Emergency Contact Phone
22. Medical Conditions
23. Special Requirements

## Additional Features

- Automatic timestamp for each submission
- Automatic sheet creation if it doesn't exist
- **Automatic header row update on every submission**
- Confirmation email to applicants (from skyhostels2023@gmail.com)
- Error handling and user feedback
- File links are public (Anyone with the link can view)

## Customization

You can modify the `google-apps-script.js` file to:
- Add more validation
- Change the email template
- Add additional data processing
- Integrate with other Google services
- Add admin notifications

## Support

If you encounter issues:
1. Check the Apps Script execution logs
2. Verify all URLs and IDs are correct
3. Test with a simple form submission first
4. Check browser console for JavaScript errors 

Logger.log('Event: ' + JSON.stringify(e)); 