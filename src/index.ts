/* eslint-disable no-await-in-loop */
// index.ts
import {
  setupDatabase,
  getUserIdFromProfile,
  getMyFileDownloadConflicts,
  getWalletBalance,
  sleep,
  checkUploadStatus,
  uploadArDriveFiles,
  getPriceOfNextUploadBatch,
  getMyArDriveFilesFromPermaWeb,
  downloadMyArDriveFiles,
  watchFolder,
  resolveFileDownloadConflict,
  getUser,
  addNewUser,
  setupArDriveSyncFolder,
} from 'ardrive-core-js'
import { ArDriveUser, UploadBatch } from 'ardrive-core-js/lib/types';
import {
  promptForLoginPassword,
  promptForNewLoginPassword,
  promptForNewUserInfo,
  promptForArDriveUpload,
  promptForFileOverwrite,
  promptForLogin,
} from './prompts';

async function main() {
  // Setup database if it doesnt exist
  try {
    await setupDatabase('./.ardrive-cli.db');
  } catch (err) {
    console.error(err);
    return;
  }
  let user: ArDriveUser = {
    login: "",
    privateArDriveId: "0",
    privateArDriveTx: "0",
    publicArDriveId: "0",
    publicArDriveTx: "0",
    dataProtectionKey: "",
    walletPrivateKey: "",
    walletPublicKey: "",
    syncFolderPath: "",
  } 
  let readyToUpload;
  let fileDownloadConflicts;

  // Check if user exists, if not, create a new one
  const login = await promptForLogin();
  const userId = await getUserIdFromProfile(login);
  if (userId === undefined || userId.length === 0)
  {
     // Welcome message and info
     console.log(
     'We have not detected a profile.  To store your files permanently, you must first setup your ArDrive account.'
    );
    const loginPassword = await promptForNewLoginPassword();
    const user: ArDriveUser = await promptForNewUserInfo(login);
    await setupArDriveSyncFolder(user.syncFolderPath);
    await addNewUser(loginPassword, user);
  }
 else {
    // Allow the user to login
    console.log('An ArDrive Wallet is present for: %s', login);
    const loginPassword = await promptForLoginPassword();
    const user: ArDriveUser | number = await getUser(loginPassword, userId.id);
    if (user === 0) {
      console.log ("You have entered a bad password for this ArDrive... GOodbye");
      return 0;
    }
  }
  watchFolder(user.syncFolderPath, user.privateArDriveId, user.publicArDriveId);
  // Run this in a loop
  while (true) {
    await getMyArDriveFilesFromPermaWeb(user);
    // await queueNewFiles(user, user.syncFolderPath);
    await checkUploadStatus();
    const uploadBatch: UploadBatch = await getPriceOfNextUploadBatch();
    if (uploadBatch.totalArDrivePrice !== 0) {
      readyToUpload = await promptForArDriveUpload(uploadBatch);
      await uploadArDriveFiles(user, readyToUpload);
    }
    await downloadMyArDriveFiles(user);
    fileDownloadConflicts = await getMyFileDownloadConflicts();
    if (fileDownloadConflicts) {
      fileDownloadConflicts.forEach(async (fileDownloadConflict: any) => {
        const response = await promptForFileOverwrite(
          fileDownloadConflict.fullPath
        );
        await resolveFileDownloadConflict(
          response,
          fileDownloadConflict.fileName,
          fileDownloadConflict.filePath,
          fileDownloadConflict.id
        );
      });
    }
    const today = new Date();
    const date = `${today.getFullYear()}-${
      today.getMonth() + 1
    }-${today.getDate()}`;
    const time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
    const dateTime = `${date} ${time}`;
    const balance = await getWalletBalance(user.walletPublicKey);
    console.log(
      '%s Syncronization completed.  Current AR Balance: %s',
      dateTime,
      balance
    );
    await sleep(30000);
  }
}
console.log('       ___   _____    _____   _____    _   _     _   _____  ');
console.log(
  '      /   | |  _  \\  |  _  \\ |  _  \\  | | | |   / / | ____| '
);
console.log('     / /| | | |_| |  | | | | | |_| |  | | | |  / /  | |__   ');
console.log('    / /_| | |  _  /  | | | | |  _  /  | | | | / /   |  __|  ');
console.log(
  '   / /  | | | | \\ \\  | |_| | | | \\ \\  | | | |/ /    | |___  '
);
console.log(
  '  /_/   |_| |_|  \\_\\ |_____/ |_|  \\_\\ |_| |___/     |_____| '
);
console.log('');
main();
