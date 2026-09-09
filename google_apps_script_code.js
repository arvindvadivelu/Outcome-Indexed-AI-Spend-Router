// ==============================================================================
// 📋 Google Apps Script — OutcomeRouter User Database Table
// Spreadsheet: https://docs.google.com/spreadsheets/d/1F6wOcNxgnQF8X2VXgVxXImFst8sC_wwMdOt95hFe1J8/edit
//
// Features:
// 1. Strict 1-User = 1-Row Architecture (Zero duplicate rows).
// 2. Real-Time Automatic In-Place Updates for Name, Email, Workspace, Plan, Quota.
// 3. Delete Account -> DELETES the user's specific row from the sheet entirely.
// 4. doGet() -> Returns all active users & emails in JSON format.
// 5. CLEAR_ALL -> Clears entire sheet keeping only the 8 formatted table headers.
// ==============================================================================

var SPREADSHEET_ID = "1F6wOcNxgnQF8X2VXgVxXImFst8sC_wwMdOt95hFe1J8";

function getTargetSheet() {
  try {
    if (SPREADSHEET_ID && SPREADSHEET_ID.length > 10) {
      var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      var sheets = ss.getSheets();
      return sheets[0];
    }
  } catch (e) {
    Logger.log("openById fallback: " + e);
  }
  return SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
}

function doPost(e) {
  try {
    var sheet = getTargetSheet();
    var contents = e.postData ? e.postData.contents : "{}";
    var data = JSON.parse(contents);

    var action = (data.action || "UPSERT").toUpperCase();
    var email = (data.email || "").trim().toLowerCase();

    // 1. Ensure Table Headers exist
    ensureHeaders(sheet);

    // 2. Handle CLEAR ALL (Wipe Database)
    if (action === "CLEAR_ALL" || action === "PURGE_ALL") {
      sheet.clear();
      ensureHeaders(sheet);
      return createJsonResponse({
        status: "success",
        action: "CLEARED_ALL",
        message: "Google Sheet wiped clean. Only table headers remain."
      });
    }

    // 3. Handle ACCOUNT DELETION -> Delete the specific user row
    if (action === "DELETE" || action === "DELETE_ACCOUNT" || action === "DELETE_USER") {
      if (!email) {
        return createJsonResponse({ status: "error", message: "Email required for deletion" });
      }

      var deleted = deleteUserRowByEmail(sheet, email);
      return createJsonResponse({
        status: "success",
        action: "DELETED",
        email: email,
        deleted: deleted,
        message: deleted ? "User row deleted successfully from Google Sheet." : "User row not found in sheet."
      });
    }

    // 4. Handle BULK SYNC / DATABASE REFRESH
    if (action === "SYNC_ALL" && Array.isArray(data.users)) {
      syncAllUsers(sheet, data.users);
      return createJsonResponse({
        status: "success",
        action: "SYNCED_ALL",
        total: data.users.length,
        message: "Database synchronized cleanly with Google Sheet."
      });
    }

    // 5. Handle USER REGISTRATION / UPSERT / PLAN UPDATE / PROFILE CHANGE
    if (!email) {
      return createJsonResponse({ status: "error", message: "Email is required" });
    }

    var result = upsertUserRow(sheet, data);
    return createJsonResponse({
      status: "success",
      action: result.action,
      email: email,
      rowIndex: result.rowIndex,
      message: result.action === "UPDATED" ? "User row updated in-place." : "New user row added to sheet."
    });

  } catch (error) {
    return createJsonResponse({
      status: "error",
      error: error.toString()
    });
  }
}

function doGet(e) {
  try {
    var sheet = getTargetSheet();
    ensureHeaders(sheet);
    var lastRow = sheet.getLastRow();
    var emails = [];
    var users = [];

    if (lastRow >= 2) {
      var data = sheet.getRange(2, 1, lastRow - 1, 8).getValues();
      for (var i = 0; i < data.length; i++) {
        var rowEmail = (data[i][1] || "").toString().trim().toLowerCase();
        if (rowEmail && rowEmail !== "work email") {
          emails.push(rowEmail);
          users.push({
            name: data[i][0],
            email: rowEmail,
            workspace: data[i][2],
            plan_tier: data[i][3],
            monthly_token_quota: data[i][4],
            currency: data[i][5],
            registered_at: data[i][6],
            last_active: data[i][7]
          });
        }
      }
    }

    return createJsonResponse({
      status: "success",
      total: emails.length,
      emails: emails,
      users: users,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return createJsonResponse({
      status: "error",
      error: err.toString()
    });
  }
}

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

function ensureHeaders(sheet) {
  var headers = [
    "Full Name",
    "Work Email",
    "Workspace / Organization",
    "Plan Tier",
    "Monthly Token Quota",
    "Currency",
    "Registered At",
    "Last Active / Updated"
  ];

  if (sheet.getLastRow() < 1) {
    sheet.appendRow(headers);
    formatHeaderRow(sheet);
    return;
  }

  var firstCell = sheet.getRange(1, 1).getValue().toString().trim();
  if (firstCell !== "Full Name") {
    sheet.insertRowBefore(1);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    formatHeaderRow(sheet);
  }
}

function formatHeaderRow(sheet) {
  var headerRange = sheet.getRange(1, 1, 1, 8);
  headerRange.setFontWeight("bold");
  headerRange.setBackground("#0050FF");
  headerRange.setFontColor("#FFFFFF");
  sheet.setFrozenRows(1);
}

function findUserRowIndex(sheet, email) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;

  var data = sheet.getRange(2, 1, lastRow - 1, 8).getValues();
  var target = email.trim().toLowerCase();

  for (var i = 0; i < data.length; i++) {
    // Smart search across column 2 first, then all columns
    if ((data[i][1] || "").toString().trim().toLowerCase() === target) {
      return i + 2;
    }
    for (var c = 0; c < data[i].length; c++) {
      if ((data[i][c] || "").toString().trim().toLowerCase() === target) {
        return i + 2;
      }
    }
  }
  return -1;
}

function deleteUserRowByEmail(sheet, email) {
  var rowIndex = findUserRowIndex(sheet, email);
  var deletedAny = false;

  // Clean up all instances of this email
  while (rowIndex !== -1) {
    sheet.deleteRow(rowIndex);
    deletedAny = true;
    rowIndex = findUserRowIndex(sheet, email);
  }

  return deletedAny;
}

function upsertUserRow(sheet, data) {
  ensureHeaders(sheet);
  var email = (data.email || "").trim().toLowerCase();
  var rowIndex = findUserRowIndex(sheet, email);
  var nowFormatted = new Date().toLocaleString();
  var registeredAt = data.created_at || data.timestamp || nowFormatted;

  var rowData = [
    data.name || "User",
    email,
    data.workspace || "Acme AI Lab",
    data.plan_tier || "free",
    Number(data.monthly_token_quota || 10000),
    data.currency || "USD",
    registeredAt,
    nowFormatted
  ];

  if (rowIndex !== -1) {
    var existingRegDate = sheet.getRange(rowIndex, 7).getValue();
    if (existingRegDate && existingRegDate.toString().length > 4) {
      rowData[6] = existingRegDate;
    }
    sheet.getRange(rowIndex, 1, 1, 8).setValues([rowData]);
    
    // Purge any accidental duplicate rows that might have existed below it
    var nextDuplicate = findUserRowIndex(sheet, email);
    while (nextDuplicate !== -1 && nextDuplicate !== rowIndex) {
      sheet.deleteRow(nextDuplicate);
      nextDuplicate = findUserRowIndex(sheet, email);
    }

    return { action: "UPDATED", rowIndex: rowIndex };
  } else {
    sheet.appendRow(rowData);
    return { action: "INSERTED", rowIndex: sheet.getLastRow() };
  }
}

function syncAllUsers(sheet, users) {
  sheet.clear();
  ensureHeaders(sheet);

  if (!users || users.length === 0) return;

  var rows = [];
  var nowFormatted = new Date().toLocaleString();

  for (var i = 0; i < users.length; i++) {
    var u = users[i];
    rows.push([
      u.name || "User",
      (u.email || "").trim().toLowerCase(),
      u.workspace || "Acme AI Lab",
      u.plan_tier || "free",
      Number(u.monthly_token_quota || 10000),
      u.currency || "USD",
      u.created_at || nowFormatted,
      nowFormatted
    ]);
  }

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, 8).setValues(rows);
  }
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
