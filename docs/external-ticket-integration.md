# External Ticket Integration Guide

This guide describes how to integrate the Support / Feedback button in other applications (such as Yoda `myyodaai.mygoapps.com`, DocSync `mydocsyncai.mygoapps.com`, Resume `resume.mygo-ops.com`, etc.) to automatically submit support tickets to the **Mygo Tickets** platform.

---

## 1. Authentication

External applications authenticate using an API Key. This allows backend services or client-side widgets to raise tickets without requiring the user to authenticate separately in the ticketing system.

### Header Format

Add the `X-API-Key` header to your HTTP requests:

```http
X-API-Key: <your-external-support-api-key>
```

> [!NOTE]
> The default API key in development is `mygo-external-support-key`. This can be configured in production by setting the `EXTERNAL_API_KEY` environment variable on the Ticketing Server.

---

## 2. API Endpoint

* **URL**: `http://ec2-54-221-31-53.compute-1.amazonaws.com/api/tickets`
* **Method**: `POST`
* **Content-Type**: `application/json`

---

## 3. Request Payload Schema

The JSON request body supports the following fields:

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `title` | `string` | **Yes** | A brief summary of the issue. |
| `category` | `string` | **Yes** | The core category. Must match one of the valid options (see list below). |
| `subcategory` | `string` | **Yes** | The subcategory under the chosen category. |
| `priority` | `string` | **Yes** | The severity: `Low`, `Medium`, `High`, or `Critical`. |
| `description` | `string` | No | Detailed description of the error or user request. |
| `tenantId` | `string` | No | The unique identifier of the tenant/organization raising the issue. |
| `source` | `string` | No | The domain or app name from which the issue originates (e.g. `myyodaai.mygoapps.com`). |
| `logs` | `string[]` or `string` | No | The last 5 console/application log lines detailing the environment state or exceptions. **Only captured and stored if the team is IT Support (Category: "IT Operations").** |
| `requestorEmail` | `string` | **Yes** | The email address of the user raising the ticket. If they do not exist in the Ticketing system, a user profile is created automatically. |
| `requestorName` | `string` | No | The name of the user. (Defaults to the email prefix if not supplied). |

### Valid Categories and Subcategories

You must select from the following hierarchy:

* **IT Operations**
  * `Asset Requests`
  * `Software Issues`
  * `Infrastructure Issues`
* **Access Management**
  * `SAP Access`
  * `Non-SAP Access`
  * `Role Changes`
* **HR & Payroll**
  * `Payroll Queries`
  * `Benefits`
  * `Leave Issues`
* **Employee Lifecycle**
  * `Company Onboarding`
  * `Project Onboarding`
  * `Project Offboarding`
  * `Company Offboarding`
* **Recruitment**
  * `Candidate Onboarding Support`
* **Immigration**
  * `Visa / Documentation`

---

## 4. Example Integration Code (JavaScript/React)

Here is a helper function you can integrate into your frontend support widget/modal to automatically capture logs and raise a ticket:

```javascript
// A simple global in-memory log buffer to keep track of the last 5 logs in your application
const logBuffer = [];
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

function addToBuffer(level, args) {
  const logMessage = `[${level}] ${new Date().toISOString()} - ${args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ')}`;
  logBuffer.push(logMessage);
  if (logBuffer.length > 5) {
    logBuffer.shift(); // Keep only the last 5 logs
  }
}

// Override console methods to capture logs
console.log = (...args) => {
  addToBuffer('INFO', args);
  originalLog.apply(console, args);
};
console.warn = (...args) => {
  addToBuffer('WARN', args);
  originalWarn.apply(console, args);
};
console.error = (...args) => {
  addToBuffer('ERROR', args);
  originalError.apply(console, args);
};

/**
 * Submits a support ticket to the ticketing server
 * @param {Object} ticketData
 * @param {string} ticketData.title - Summary of the issue
 * @param {string} ticketData.description - Detailed description
 * @param {string} ticketData.category - e.g. "IT Operations"
 * @param {string} ticketData.subcategory - e.g. "Software Issues"
 * @param {string} ticketData.priority - e.g. "High"
 * @param {string} ticketData.tenantId - e.g. "my-tenant-id"
 * @param {string} ticketData.userEmail - Email of the active logged-in user
 * @param {string} ticketData.userName - Name of the active logged-in user
 */
async function submitSupportTicket({ title, description, category, subcategory, priority, tenantId, userEmail, userName }) {
  const TICKETING_API_URL = "http://ec2-54-221-31-53.compute-1.amazonaws.com/api/tickets";
  const EXTERNAL_API_KEY = "mygo-external-support-key"; // Retrieve from a secure config

  const payload = {
    title,
    description,
    category,
    subcategory,
    priority,
    tenantId,
    source: window.location.hostname, // Automatically captures e.g. 'myyodaai.mygoapps.com'
    logs: category === "IT Operations" ? logBuffer : undefined, // Sends captured console logs only for IT Support/Operations tickets
    requestorEmail: userEmail,
    requestorName: userName
  };

  try {
    const response = await fetch(TICKETING_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": EXTERNAL_API_KEY
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create support ticket");
    }

    const createdTicket = await response.json();
    originalLog("Support ticket successfully raised:", createdTicket.id);
    return createdTicket;
  } catch (error) {
    originalError("Failed to submit support ticket to helpdesk:", error.message);
    throw error;
  }
}
```

---

## 5. What Else Needs to be Implemented in Your App?

To ensure a seamless user experience when users click the support button, follow these design and implementation steps:

1. **Trigger Component**: Add a floating support button (e.g. at the bottom-right of the screen) or a "Help & Support" option in your application sidebar.
2. **Modal Form**: When clicked, open a modal displaying:
   * **Subject / Title**: Brief description of the problem.
   * **Description**: Textarea for detail.
   * **Category**: Dropdown (usually mapped in the background to simplify for the user, or let them select standard choices).
   * **Severity / Priority**: Let users select `Low`, `Medium`, or `High` (usually mapped dynamically based on context, or default to `Medium`).
3. **SSO / User Profile Context**: Automatically fetch the currently logged-in user's email, name, and current tenant ID from your state management (e.g., Redux, Context, or Auth0 payload) and append it to the API payload. Do not ask the user for their email if they are already logged in!
4. **Toast Notifications**: Give immediate visual feedback (e.g., "Ticket TKT-045 submitted successfully") upon completion.
