# Google Play Store Publishing & Compliance Guide: Engram Mobile

This guide contains everything required to build, test, and publish the **Engram Mobile** Android app to the **Google Play Console** in full compliance with the latest 2025/2026 Google Play Developer policies.

---

## 1. Quick Build Commands (via EAS Cloud)

EAS (Expo Application Services) compiles the native Android binaries on fast cloud builders without requiring local Android Studio or NDK installation.

### Step A: Install EAS CLI & Login (One-Time)
```bash
npm install -g eas-cli
eas login
```
*(If you don't have an Expo account yet, register for free at [expo.dev](https://expo.dev).)*

### Step B: Configure Project with EAS
Inside `engram-mobile`:
```bash
eas build:configure
```

### Step C1: Build Test APK (Install & test on your phone first)
```bash
eas build -p android --profile preview
```
- EAS will generate a direct download link and QR code for an `.apk` file.
- Scan the QR code or download the `.apk` on your Android device to test the full live app.

### Step C2: Build Production `.aab` (For Google Play Store submission)
```bash
eas build -p android --profile production
```
- EAS will compile an optimized `.aab` (Android App Bundle) signed with release keystores.
- Download the resulting `.aab` file to upload to the Google Play Console.

---

## 2. Google Play Console Form Answers & Compliance Checklist

To prevent delays or rejections, fill out the Google Play Console forms using the exact specifications below:

### A. App Access (Mandatory)
Google reviewers must be able to log in and test the app immediately without obstacles.
- **Selection**: "All or some functionality is restricted"
- **Credentials instructions**:
  - **Account Name / Email**: `test@devpractice.io`
  - **Password**: `reviewer123`
  - **Reviewer Note**: *"Alternatively, a dedicated 'Google Play Reviewer 1-Tap Demo' button is provided on the login screen for instantaneous single-click verification without typing credentials."*

### B. Ads Declaration
- **Answer**: **No, my app does not contain ads.**

### C. Content Rating & Target Audience
- **Target Age Group**: 18 and older (Professional Software Engineers).
- **Appeal to Children**: No.
- **Category**: Productivity / Education.

### D. Data Safety Declaration (Strict Enforcement)
| Question | Exact Answer |
| :--- | :--- |
| Does your app collect or share user data? | **Yes** |
| Is all data collected encrypted in transit? | **Yes** (HTTPS TLS 1.3) |
| Do you provide a way for users to request that their data is deleted? | **Yes** (In-app + Web portal) |
| **Data Types Collected**: | |
| 1. Personal Info -> Name | Used for App Functionality / Account Management (Not shared with 3rd parties). |
| 2. Personal Info -> Email address | Used for Account Management & Authentication. |
| 3. App Activity -> User Prompts & Session Diffs | Used for Core Feature Functionality (Generating recall questions). |

### E. Account Deletion URL (Required)
Google Play policy requires a publicly accessible URL where any user can request account and data deletion outside of the app:
- **Deletion URL**: `https://engram.bamacharan.com/delete-account`
- **In-App Deletion Path**: `Settings Tab -> Account Control -> Permanently Delete Account & Data`

### F. Privacy Policy URL (Required)
- **Privacy Policy URL**: `https://engram.bamacharan.com/privacy`

---

## 3. Play Store Listing Assets Checklist

1. **App Name**: `Engram: AI Active Recall` (or `Engram`)
2. **Short Description** (up to 80 chars):
   > Continuous active recall for software engineers calibrated to your code diffs.
3. **Full Description**:
   > Engram bridges the gap between passive AI code generation and permanent engineering mastery. By ingesting your local CLI (Codex, Claude Code) and IDE session diffs, Engram synthesizes targeted daily practice reps, code comprehension challenges, and system design prompts calibrated to your target career seniority (Intern → SDE1 → SDE2 → Senior → Staff).
   >
   > Features:
   > • Daily active recall calibrated to your actual git diffs and prompt history
   > • Instant Staff Engineer evaluation and actionable blindspot feedback
   > • Automated Standup & PR Brief generator with 1-tap clipboard export
   > • Prompt density telemetry to eliminate vague LLM queries
   > • Zero ad tracking, encrypted in transit, with complete account data deletion controls
4. **App Icon**: `engram-mobile/assets/icon.png` (1024x1024 PNG)
5. **Feature Graphic**: 1024 x 500 PNG (Obsidian dark background with gold Engram branding).
6. **Screenshots**: 2 to 8 phone screenshots (1080 x 1920 or 1080 x 2400) captured from the Practice, Prompts, Retention, and Settings screens.

---

## 4. Google Play Closed Testing Requirement Note
- If your Google Play Developer account was created after **November 13, 2023** as a personal account, Google requires you to run a **Closed Test with at least 20 testers for 14 days** before applying for production access.
- You can invite friends, colleagues, or community members to your closed test track using their Google accounts.
- Once closed testing completes, Google Play opens the **Production Track** for public rollout.
