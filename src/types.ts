export const ArFS_O_11 = '0.11';
export const CURRENT_ARFS_VERSION = ArFS_O_11;
export const DEFAULT_APP_NAME = 'ArDrive-Core';
export const DEFAULT_APP_VERSION = '1.0';

export type ArweaveAddress = string;
export type PublicKey = string;
export type SeedPhrase = string;

/** TODO: Use big int library on Winston types */
export type Winston = string; // TODO: make a type that checks validity
export type NetworkReward = Winston;

export type FolderID = string;
export type FileID = string;
export type DriveID = string;
export type EntityID = DriveID | FolderID | FileID;

export type CipherIV = string;
export type DriveKey = Buffer;
export type FileKey = Buffer;

export type UnixTime = number;
export type ByteCount = number;
export type DataContentType = string;

export type TransactionID = string; // TODO: make a type that checks lengths

export interface ArDriveCommunityTip {
	tipPercentage: number;
	minWinstonFee: number; // TODO: Align with Winston type?
}

export type TipType = 'data upload';

export type GQLCursor = string;
export type FeeMultiple = number; // TODO: assert always >= 1.0

export type RewardSettings = {
	reward?: Winston;
	feeMultiple?: FeeMultiple;
};

export interface BlockStats {
	numberOfBlocks: number;
	totalTransactions: number;
	averageReward: number;
	maxReward: number;
	minReward: number; // ignore rewards of 0
}
