const SPREADSHEET_ID = '1NwL0JOInE4GabbFOHir3A4nGbY6qNJGubuJ-eQFcaRM';
// Replace these with your actual Drive folder IDs
const AADHAAR_FOLDER_ID = '1MBt_d00dCwv2Dh5dS2ns8EYr4y3l27UP';
const PHOTO_FOLDER_ID = '1uCYP_aRlsA6WiDRFEIXu91Niu4YkMkO3';

function doPost(e) {
    try {
        // Enable CORS
        const headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        };

        // Parse the incoming data
        const data = e.parameter;

        // File upload handling
        let aadhaarUrl = '';
        let photoUrl = '';

        // Handle Aadhaar upload
        if (data.aadhaarData && data.aadhaarName && data.aadhaarMimeType) {
            aadhaarUrl = uploadFileToDrive(
                data.aadhaarData,
                data.aadhaarName,
                data.aadhaarMimeType,
                AADHAAR_FOLDER_ID
            );
        }

        // Handle Photo upload
        if (data.photoData && data.photoName && data.photoMimeType) {
            photoUrl = uploadFileToDrive(
                data.photoData,
                data.photoName,
                data.photoMimeType,
                PHOTO_FOLDER_ID
            );
        }

        // Process form data and save to sheet
        const rowData = [
            new Date(), // Timestamp
            data.firstName || '',
            data.lastName || '',
            data.dob || '',
            data.gender || '',
            data.email || '',
            data.mobile || '',
            data.address || '',
            data.institution || '',
            data.course || '',
            data.yearOfStudy || '',
            data.studentId || '',
            data.mealPlan || '',
            data.checkInDate || '',
            data.duration || '',
            aadhaarUrl, // Link to uploaded Aadhaar
            photoUrl,   // Link to uploaded Photo
            data.floor || '',
            data.room || '',
            data.emergencyContactName || '',
            data.emergencyContactPhone || '',
            data.medicalConditions || '',
            data.specialRequirements || ''
        ];

        // Append to sheet
        saveToSheet(rowData);

        // Send confirmation email if email is provided
        if (data.email) {
            sendConfirmationEmail(data.email, data.firstName);
        }

        // Return success response
        return ContentService.createTextOutput(JSON.stringify({
            status: 'success',
            message: 'Application submitted successfully',
            files: { aadhaar: aadhaarUrl, photo: photoUrl }
        })).setMimeType(ContentService.MimeType.JSON).setHeaders(headers);

    } catch (error) {
        // Log error and return failure response
        Logger.log('Error: ' + error.toString());
        return ContentService.createTextOutput(JSON.stringify({
            status: 'error',
            message: error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

// Handle OPTIONS requests for CORS
function doOptions(e) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };
    return ContentService.createTextOutput('')
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders(headers);
}

// Function to upload base64 data to Google Drive
function uploadFileToDrive(base64Data, filename, mimeType, folderId) {
    try {
        const folder = DriveApp.getFolderById(folderId);

        // Decode base64 string
        // Remove the data URL prefix if it exists (e.g., "data:image/jpeg;base64,")
        const base64String = base64Data.split(',').pop();
        const decodedFile = Utilities.base64Decode(base64String);

        // Create blob and save as file
        const blob = Utilities.newBlob(decodedFile, mimeType, filename);
        const file = folder.createFile(blob);

        // Ensure anyone with the link can view the file
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

        return file.getUrl();
    } catch (e) {
        Logger.log('File upload error: ' + e.toString());
        return 'Upload failed: ' + e.toString();
    }
}

// Function to save row data to the spreadsheet
function saveToSheet(rowData) {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    // Try to get the "Admissions" sheet, or create it if it doesn't exist
    let sheet = ss.getSheetByName("Admissions");
    if (!sheet) {
        sheet = ss.insertSheet("Admissions");
    }

    // Define the headers
    const headers = [
        "Timestamp", "First Name", "Last Name", "Date of Birth", "Gender",
        "Email", "Mobile", "Address", "Institution", "Course",
        "Year of Study", "Student ID", "Meal Plan", "Check-in Date", "Duration",
        "Aadhaar Upload Link", "Photo Upload Link", "Floor Number", "Room Number",
        "Emergency Contact Name", "Emergency Contact Phone", "Medical Conditions", "Special Requirements"
    ];

    // Always verify and set headers if the first row is empty
    const range = sheet.getRange(1, 1, 1, headers.length);
    if (!range.getValue()) {
        range.setValues([headers]);
        range.setFontWeight("bold");
        sheet.setFrozenRows(1);

        // Auto-resize columns for better readability
        sheet.autoResizeColumns(1, headers.length);
    }

    // Append the new row
    sheet.appendRow(rowData);
}

// Function to send confirmation email
function sendConfirmationEmail(email, firstName) {
    try {
        const subject = "Sky Hostels - Admission Application Received";
        const body = `Dear ${firstName},\n\nThank you for choosing Sky Hostels! We have received your admission application and uploaded documents.\n\nOur team will review your application and contact you shortly with the next steps.\n\nBest regards,\nSky Hostels Administration\nPhone: +91-9094444115 / +91-9094444116\nEmail: skyhostels2023@gmail.com`;

        MailApp.sendEmail({
            to: email,
            subject: subject,
            body: body,
            name: "Sky Hostels"
        });
    } catch (e) {
        Logger.log('Email error: ' + e.toString());
    }
}
