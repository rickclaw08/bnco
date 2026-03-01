#!/usr/bin/env node
/**
 * Google Drive Backup
 * 
 * Backs up key workspace files to Google Drive.
 * Creates timestamped backup folders, keeps last 7, auto-deletes older ones.
 * Uses Google Drive API with service account credentials.
 * 
 * Environment Variables:
 *   GOOGLE_SERVICE_ACCOUNT_KEY - Path to service account JSON key file
 *   GDRIVE_PARENT_FOLDER_ID   - Google Drive folder ID for backups
 *   WORKSPACE_DIR              - Workspace root (defaults to ../../ relative to this file)
 *   BACKUP_RETENTION_COUNT     - Number of backups to keep (default: 7)
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

// Configuration
const WORKSPACE = process.env.WORKSPACE_DIR || path.resolve(__dirname, '../..');
const SERVICE_ACCOUNT_KEY_PATH = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '';
const PARENT_FOLDER_ID = process.env.GDRIVE_PARENT_FOLDER_ID || '';
const RETENTION_COUNT = parseInt(process.env.BACKUP_RETENTION_COUNT, 10) || 7;

const LOG_DIR = path.join(__dirname, 'logs');
const LOG_FILE = path.join(LOG_DIR, 'gdrive-backup.log');

// Backup targets (glob-like patterns resolved manually)
const BACKUP_TARGETS = [
  { pattern: 'claw-agency/', type: 'directory' },
  { pattern: 'automation/*/config.json', type: 'glob' },
  { pattern: 'automation/*/data/', type: 'glob-dir' },
  { pattern: 'memory/', type: 'directory' },
];

/**
 * Logger utility
 */
function log(level, message) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] [${level}] ${message}`;
  console.log(line);
  try {
    if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
    fs.appendFileSync(LOG_FILE, line + '\n');
  } catch (err) {
    console.error(`Failed to write log: ${err.message}`);
  }
}

/**
 * Authenticate with Google Drive using service account
 */
async function authenticate() {
  if (!SERVICE_ACCOUNT_KEY_PATH) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set. Provide the path to your service account JSON key file.');
  }
  if (!PARENT_FOLDER_ID) {
    throw new Error('GDRIVE_PARENT_FOLDER_ID environment variable is not set. Provide the Google Drive folder ID for backups.');
  }
  if (!fs.existsSync(SERVICE_ACCOUNT_KEY_PATH)) {
    throw new Error(`Service account key file not found: ${SERVICE_ACCOUNT_KEY_PATH}`);
  }

  const keyFile = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_KEY_PATH, 'utf-8'));
  const auth = new google.auth.JWT(
    keyFile.client_email,
    null,
    keyFile.private_key,
    ['https://www.googleapis.com/auth/drive'],
  );

  await auth.authorize();
  return google.drive({ version: 'v3', auth });
}

/**
 * Create a folder on Google Drive
 */
async function createDriveFolder(drive, name, parentId) {
  const res = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    },
    fields: 'id, name',
  });
  return res.data;
}

/**
 * Upload a file to Google Drive
 */
async function uploadFile(drive, localPath, parentId) {
  const fileName = path.basename(localPath);
  const mimeType = 'application/octet-stream';

  const res = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [parentId],
    },
    media: {
      mimeType,
      body: fs.createReadStream(localPath),
    },
    fields: 'id, name, size',
  });

  return res.data;
}

/**
 * Recursively upload a directory
 */
async function uploadDirectory(drive, localDir, parentId, stats) {
  if (!fs.existsSync(localDir)) {
    log('WARN', `Directory does not exist, skipping: ${localDir}`);
    return;
  }

  const dirName = path.basename(localDir);
  const folder = await createDriveFolder(drive, dirName, parentId);
  log('INFO', `Created folder: ${dirName} (${folder.id})`);

  const entries = fs.readdirSync(localDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(localDir, entry.name);
    if (entry.name.startsWith('.')) continue; // Skip hidden files

    if (entry.isDirectory()) {
      await uploadDirectory(drive, fullPath, folder.id, stats);
    } else if (entry.isFile()) {
      try {
        await uploadFile(drive, fullPath, folder.id);
        stats.filesUploaded++;
        log('INFO', `Uploaded: ${path.relative(WORKSPACE, fullPath)}`);
      } catch (err) {
        stats.errors++;
        log('ERROR', `Failed to upload ${fullPath}: ${err.message}`);
      }
    }
  }
}

/**
 * Resolve backup targets to actual file/directory paths
 */
function resolveTargets() {
  const resolved = [];

  for (const target of BACKUP_TARGETS) {
    if (target.type === 'directory') {
      const dirPath = path.join(WORKSPACE, target.pattern);
      if (fs.existsSync(dirPath)) {
        resolved.push({ path: dirPath, type: 'directory' });
      } else {
        log('WARN', `Target directory not found: ${target.pattern}`);
      }
    } else if (target.type === 'glob' || target.type === 'glob-dir') {
      // Simple glob resolution for automation/*/pattern
      const parts = target.pattern.split('/');
      const parentDir = path.join(WORKSPACE, parts[0]);
      if (!fs.existsSync(parentDir)) {
        log('WARN', `Parent directory not found: ${parts[0]}`);
        continue;
      }
      const subDirs = fs.readdirSync(parentDir, { withFileTypes: true })
        .filter(d => d.isDirectory() && !d.name.startsWith('.'));

      for (const sub of subDirs) {
        const remainder = parts.slice(2).join('/');
        const fullTarget = path.join(parentDir, sub.name, remainder);

        if (fs.existsSync(fullTarget)) {
          const stat = fs.statSync(fullTarget);
          resolved.push({
            path: fullTarget,
            type: stat.isDirectory() ? 'directory' : 'file',
            relativeName: `${parts[0]}/${sub.name}/${remainder}`,
          });
        }
      }
    }
  }

  return resolved;
}

/**
 * List existing backup folders (sorted by creation time)
 */
async function listBackupFolders(drive) {
  const res = await drive.files.list({
    q: `'${PARENT_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name, createdTime)',
    orderBy: 'createdTime desc',
  });
  return res.data.files || [];
}

/**
 * Delete a folder and its contents from Google Drive
 */
async function deleteDriveFolder(drive, folderId, folderName) {
  await drive.files.delete({ fileId: folderId });
  log('INFO', `Deleted old backup: ${folderName} (${folderId})`);
}

/**
 * Enforce retention policy - keep only the latest N backups
 */
async function enforceRetention(drive) {
  const folders = await listBackupFolders(drive);
  if (folders.length <= RETENTION_COUNT) {
    log('INFO', `Retention OK: ${folders.length}/${RETENTION_COUNT} backups stored.`);
    return;
  }

  const toDelete = folders.slice(RETENTION_COUNT);
  log('INFO', `Pruning ${toDelete.length} old backup(s)...`);

  for (const folder of toDelete) {
    try {
      await deleteDriveFolder(drive, folder.id, folder.name);
    } catch (err) {
      log('ERROR', `Failed to delete backup ${folder.name}: ${err.message}`);
    }
  }
}

/**
 * Main backup function
 */
async function runBackup() {
  const startTime = Date.now();
  log('INFO', '=== Google Drive Backup Started ===');

  let drive;
  try {
    drive = await authenticate();
    log('INFO', 'Authenticated with Google Drive.');
  } catch (err) {
    log('ERROR', `Authentication failed: ${err.message}`);
    log('INFO', '');
    log('INFO', 'Setup instructions:');
    log('INFO', '1. Create a Google Cloud service account');
    log('INFO', '2. Download the JSON key file');
    log('INFO', '3. Set GOOGLE_SERVICE_ACCOUNT_KEY=/path/to/key.json');
    log('INFO', '4. Create a folder in Google Drive and share it with the service account email');
    log('INFO', '5. Set GDRIVE_PARENT_FOLDER_ID=<folder-id-from-url>');
    process.exit(1);
  }

  // Create timestamped backup folder
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupFolderName = `clawops-backup-${timestamp}`;
  const backupFolder = await createDriveFolder(drive, backupFolderName, PARENT_FOLDER_ID);
  log('INFO', `Created backup folder: ${backupFolderName} (${backupFolder.id})`);

  // Resolve and upload targets
  const targets = resolveTargets();
  log('INFO', `Found ${targets.length} backup target(s).`);

  const stats = { filesUploaded: 0, errors: 0 };

  for (const target of targets) {
    try {
      if (target.type === 'directory') {
        await uploadDirectory(drive, target.path, backupFolder.id, stats);
      } else {
        // Create parent structure for individual files
        const relPath = target.relativeName || path.relative(WORKSPACE, target.path);
        const parentDirName = path.dirname(relPath).replace(/\//g, '_');
        const subFolder = await createDriveFolder(drive, parentDirName, backupFolder.id);
        await uploadFile(drive, target.path, subFolder.id);
        stats.filesUploaded++;
        log('INFO', `Uploaded: ${relPath}`);
      }
    } catch (err) {
      stats.errors++;
      log('ERROR', `Failed to backup ${target.path}: ${err.message}`);
    }
  }

  // Enforce retention
  await enforceRetention(drive);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  log('INFO', `=== Backup Complete: ${stats.filesUploaded} files uploaded, ${stats.errors} errors, ${elapsed}s elapsed ===`);

  if (stats.errors > 0) {
    process.exit(1);
  }
}

// Run
runBackup().catch(err => {
  log('ERROR', `Unhandled error: ${err.message}`);
  process.exit(1);
});
