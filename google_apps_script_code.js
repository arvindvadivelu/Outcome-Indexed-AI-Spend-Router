// ==============================================================================
// 📋 Google Apps Script — Auto-Append User Signups & Auth to Google Sheet
// Instructions:
// 1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1F6wOcNxgnQF8X2VXgVxXImFst8sC_wwMdOt95hFe1J8/edit
// 2. Click "Extensions" menu -> "Apps Script"
// 3. Paste this code into the editor and click "Save" (Ctrl+S)
// 4. Click "Deploy" -> "New deployment" -> Select type "Web app"
//    - Execute as: "Me"
//    - Who has access: "Anyone"
// 5. Click "Deploy", authorize access, and copy the Web App URL (starts with https://script.google.com/macros/s/...)
// 6. Paste the URL into .env or your terminal:
//    GOOGLE_SHEETS_WEBHOOK_URL="https://script.google.com/macros/s/..."
// ==============================================================================

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Set headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp (ISO)",
        "Local Time",
        "Action",
        "Full Name",
        "Work Email",
        "Workspace / Org",
        "Plan Tier",
        "Monthly Token Quota",
        "Currency",
        "Auth Method"
      ]);
      // Format header row with bold blue style
      var headerRange = sheet.getRange(1, 1, 1, 10);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#0050FF");
      headerRange.setFontColor("#FFFFFF");
    }
    
    var data = JSON.parse(e.postData.contents);
    
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.localTime || new Date().toLocaleString(),
      data.action || "SIGNUP",
      data.name || "User",
      data.email || "",
      data.workspace || "Acme AI Lab",
      data.plan_tier || "Free",
      data.monthly_token_quota || 10000,
      data.currency || "USD",
      data.auth_method || "PIN_PASSWORD"
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Row appended successfully to Google Sheet."
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    message: "OutcomeRouter Google Apps Script Webhook is active and listening for POST requests."
  })).setMimeType(ContentService.MimeType.JSON);
}
