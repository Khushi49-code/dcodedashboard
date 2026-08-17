// setup-firebase.js
// Run this once: node setup-firebase.js "C:\path\to\your-downloaded-file.json"
// It reads your Firebase service account JSON and writes a correct .env.local automatically.

const fs = require("fs");
const path = require("path");

const jsonPath = process.argv[2];

if (!jsonPath) {
  console.error("❌ Please provide the path to your downloaded Firebase JSON file.");
  console.error('Example: node setup-firebase.js "C:\\Users\\YourName\\Downloads\\dcodes-bf8b1-firebase-adminsdk-xxxxx.json"');
  process.exit(1);
}

if (!fs.existsSync(jsonPath)) {
  console.error(`❌ File not found at: ${jsonPath}`);
  console.error("Check the path is correct and try again.");
  process.exit(1);
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
} catch (err) {
  console.error("❌ Could not parse the JSON file. Is it a valid Firebase service account file?");
  console.error(err.message);
  process.exit(1);
}

if (!serviceAccount.project_id || !serviceAccount.client_email || !serviceAccount.private_key) {
  console.error("❌ This JSON file is missing required fields (project_id, client_email, private_key).");
  console.error("Make sure you downloaded the correct file from Firebase Console > Service Accounts.");
  process.exit(1);
}

const privateKeyBase64 = Buffer.from(serviceAccount.private_key, "utf-8").toString("base64");

const envContent = `FIREBASE_PROJECT_ID=${serviceAccount.project_id}
FIREBASE_CLIENT_EMAIL=${serviceAccount.client_email}
FIREBASE_PRIVATE_KEY_BASE64=${privateKeyBase64}
`;

const envPath = path.join(process.cwd(), ".env.local");
fs.writeFileSync(envPath, envContent, "utf-8");

console.log("✅ Success! .env.local has been created/updated at:");
console.log(envPath);
console.log("");
console.log("Now run: npm run build");