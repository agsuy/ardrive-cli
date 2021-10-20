import { Parameter } from './CLICommand/parameter';

export const WalletFileParameter = 'walletFile';
export const SeedPhraseParameter = 'seedPhrase';
export const PrivateParameter = 'private';
export const UnsafeDrivePasswordParameter = 'unsafeDrivePassword';
export const DriveNameParameter = 'driveName';
export const FolderNameParameter = 'folderName';
export const DriveKeyParameter = 'driveKey';
export const AddressParameter = 'address';
export const DriveIdParameter = 'driveId';
export const ArAmountParameter = 'arAmount';
export const DestinationAddressParameter = 'destAddress';
export const TransactionIdParameter = 'txId';
export const ConfirmationsParameter = 'confirmations';
export const FolderIdParameter = 'folderId';
export const FileIdParameter = 'fileId';
export const ParentFolderIdParameter = 'parentFolderId';
export const LocalFilePathParameter = 'localFilePath';
export const DestinationFileNameParameter = 'destFileName';
export const LocalFilesParameter = 'localFiles';
export const GetAllRevisionsParameter = 'getAllRevisions';
export const AllParameter = 'all';
export const MaxDepthParameter = 'maxDepth';
export const BoostParameter = 'boost';
export const DryRunParameter = 'dryRun';
export const NoVerifyParameter = 'verify'; // commander maps --no-x style params to options.x and always includes in options

// Aggregates for convenience
export const DriveCreationPrivacyParameters = [
	PrivateParameter,
	UnsafeDrivePasswordParameter,
	WalletFileParameter,
	SeedPhraseParameter
];
export const DrivePrivacyParameters = [DriveKeyParameter, ...DriveCreationPrivacyParameters];
export const TreeDepthParams = [AllParameter, MaxDepthParameter];

/**
 * Note: importing this file will declare all the above parameters
 */

Parameter.declare({
	name: WalletFileParameter,
	aliases: ['-w', '--wallet-file'],
	description: `the path to a JWK file on the file system
		• Can't be used with --seed-phrase`,
	forbiddenConjunctionParameters: [SeedPhraseParameter]
});

Parameter.declare({
	name: SeedPhraseParameter,
	aliases: ['-s', '--seed-phrase'],
	description: `a 12-word seed phrase representing a JWK
		• Can't be used with --wallet-file`,
	forbiddenConjunctionParameters: [WalletFileParameter]
});

Parameter.declare({
	name: UnsafeDrivePasswordParameter,
	aliases: ['-p', '--unsafe-drive-password'],
	description: `the encryption password for the private drive (OPTIONAL - NOT RECOMMENDED)
		• When provided, creates/accesses a private drive. Public drive otherwise.
		• Can NOT be used in conjunction with --private
		• Can NOT be used in conjunction with --drive-key`,
	forbiddenConjunctionParameters: [DriveKeyParameter, PrivateParameter]
});

Parameter.declare({
	name: PrivateParameter,
	aliases: ['-P', '--private'],
	description: `specify to create/interact with private entities, i.e. drives, folders, and files (OPTIONAL - RECOMMENDED OVER --unsafe-drive-password)
		• obtains the drive password from the following locations, in precedence order:
			- STDIN
			- Environment variable ARDRIVE_DRIVE_PW
			- Interactive, secure prompt
		• Can NOT be used in conjunction with --unsafe-drive-password
		• Can NOT be used in conjunction with --drive-key`,
	forbiddenConjunctionParameters: [DriveKeyParameter, UnsafeDrivePasswordParameter],
	type: 'boolean'
});

Parameter.declare({
	name: DriveKeyParameter,
	aliases: ['-k', '--drive-key'],
	description: `the drive key for the parent drive of the folder identified by --folder-id
		• Required only for folders residing in private drives
		• Can NOT be used in conjunction with --unsafe-drive-password
		• Can NOT be used in conjunction with --private`,
	forbiddenConjunctionParameters: [UnsafeDrivePasswordParameter, PrivateParameter]
});

Parameter.declare({
	name: DriveNameParameter,
	aliases: ['-n', '--drive-name'],
	description: `the name for the new drive`,
	required: true
});

Parameter.declare({
	name: FolderNameParameter,
	aliases: ['-n', '--folder-name'],
	description: `the name for the new folder`,
	required: true
});

Parameter.declare({
	name: AddressParameter,
	aliases: ['-a', '--address'],
	description: 'the address'
});

Parameter.declare({
	name: DriveIdParameter,
	aliases: ['-d', '--drive-id'],
	description: 'the drive ID to get metadata from',
	required: true
});

Parameter.declare({
	name: ArAmountParameter,
	aliases: ['-a', '--ar-amount'],
	description: 'required: amount of AR to send',
	required: true
});

Parameter.declare({
	name: DestinationAddressParameter,
	aliases: ['-d', '--dest-address'],
	description: 'required: destination wallet address',
	required: true
});

Parameter.declare({
	name: TransactionIdParameter,
	aliases: ['-t', '--tx-id'],
	description: 'The transaction id to check the status of in the mempool',
	required: true
});

Parameter.declare({
	name: ConfirmationsParameter,
	aliases: ['-c', '--confirmations'],
	description: 'Number of confirmations to determine if a transaction is mined'
});

Parameter.declare({
	name: ParentFolderIdParameter,
	aliases: ['-F', '--parent-folder-id'],
	description: `the ArFS folder ID for the folder in which this file will reside (i.e. its parent folder)
		• To upload the file to the root of a drive, use the root folder ID of the drive`,
	required: true
});

Parameter.declare({
	name: FolderIdParameter,
	aliases: ['-f', '--folder-id'],
	description: `the ArFS folder ID for the folder to query`,
	required: true
});

Parameter.declare({
	name: FileIdParameter,
	aliases: ['-f', '--file-id'],
	description: `the ArFS file ID for the file to query`,
	required: true
});

Parameter.declare({
	name: LocalFilePathParameter,
	aliases: ['-l', '--local-file-path'],
	description: `the path on the local filesystem for the file that will be uploaded`
});

Parameter.declare({
	name: DestinationFileNameParameter,
	aliases: ['-d', '--dest-file-name'],
	description: `(OPTIONAL) a destination file name to use when uploaded to ArDrive`
});

Parameter.declare({
	name: LocalFilesParameter,
	aliases: ['--local-files'],
	description: `a path to a csv (tab delimited) file containing rows of data for the following columns:
		• CSV Columns
		• local file path
		• destination file name (optional)
		• parent folder ID (optional)
			• --parent-folder-id used, otherwise
			• all parent folder IDs should reside in the same drive
		• Can NOT be used in conjunction with --local-file-path`,
	forbiddenConjunctionParameters: [LocalFilePathParameter]
});

Parameter.declare({
	name: GetAllRevisionsParameter,
	aliases: ['--get-all-revisions'],
	description: '(OPTIONAL) gets every revision',
	type: 'boolean'
});

Parameter.declare({
	name: BoostParameter,
	aliases: ['--boost'],
	description:
		'(OPTIONAL) a multiple of the base transaction data fee that can be used to accelerate transaction mining. A multiple of 2.5 would boost a 100 Winston transaction fee to 250 Winston.'
});

Parameter.declare({
	name: DryRunParameter,
	aliases: ['--dry-run'],
	description:
		'(OPTIONAL) Print the results of the transactions that would occur, and their potential fees, without sending the transactions.',
	type: 'boolean'
});

Parameter.declare({
	name: AllParameter,
	aliases: ['--all'],
	description: `(OPTIONAL) gets all contents within this folder, including child files/folders`,
	type: 'boolean',
	forbiddenConjunctionParameters: [MaxDepthParameter]
});

Parameter.declare({
	name: MaxDepthParameter,
	aliases: ['--max-depth'],
	description: `(OPTIONAL) enter a number of the amount of sub folder levels to list`
});

Parameter.declare({
	name: NoVerifyParameter,
	aliases: ['--no-verify'],
	description:
		'(OPTIONAL) Derives a drive key for the given drive ID without verifying its correctness against the drive on chain.',
	type: 'boolean'
});
