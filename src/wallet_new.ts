import { GQLTagInterface, JWKInterface } from 'ardrive-core-js';
import * as B64js from 'base64-js';
import * as crypto from 'crypto';
import jwkToPem, { JWK } from 'jwk-to-pem';
import Arweave from 'arweave';
import * as mnemonicKeys from 'arweave-mnemonic-keys';
import Transaction from 'arweave/node/lib/transaction';
import { TransactionID, Winston, NetworkReward, PublicKey, ArweaveAddress, SeedPhrase, Bytes } from './types';

export type ARTransferResult = {
	trxID: TransactionID;
	winston: Winston;
	reward: NetworkReward;
};

export interface Wallet {
	getPublicKey(): Promise<PublicKey>;
	getAddress(): Promise<ArweaveAddress>;
	sign(data: Uint8Array): Promise<Uint8Array>;
}

export class JWKWallet implements Wallet {
	constructor(private readonly jwk: JWKInterface) {}

	getPublicKey(): Promise<PublicKey> {
		return Promise.resolve(this.jwk.n);
	}

	getPrivateKey(): JWKInterface {
		return this.jwk;
	}

	async getAddress(): Promise<ArweaveAddress> {
		const result = crypto
			.createHash('sha256')
			.update(b64UrlToBuffer(await this.getPublicKey()))
			.digest();
		return Promise.resolve(bufferTob64Url(result));
	}

	// Use cases: generating drive keys, file keys, etc.
	sign(data: Uint8Array): Promise<Uint8Array> {
		const sign = crypto.createSign('sha256');
		sign.update(data);
		const pem: string = jwkToPem(this.jwk as JWK, { private: true });
		const signature = sign.sign({
			key: pem,
			padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
			saltLength: 0 // We do not need to salt the signature since we combine with a random UUID
		});
		return Promise.resolve(signature);
	}
}

export class WalletDAO {
	constructor(private readonly arweave: Arweave) {}

	async generateSeedPhrase(): Promise<SeedPhrase> {
		const seedPhrase: SeedPhrase = await mnemonicKeys.generateMnemonic();
		return Promise.resolve(seedPhrase);
	}

	async generateJWKWallet(seedPhrase: SeedPhrase): Promise<JWKWallet> {
		const jwkWallet: JWKInterface = await mnemonicKeys.getKeyFromMnemonic(seedPhrase);
		return Promise.resolve(new JWKWallet(jwkWallet));
	}

	async getWalletWinstonBalance(wallet: Wallet): Promise<number> {
		return this.getAddressWinstonBalance(await wallet.getAddress());
	}

	async getAddressWinstonBalance(address: ArweaveAddress): Promise<number> {
		return Promise.resolve(+(await this.arweave.wallets.getBalance(address)));
	}

	async walletHasBalance(wallet: Wallet, winstonPrice: Winston): Promise<boolean> {
		const walletBalance = await this.getWalletWinstonBalance(wallet);
		return +walletBalance > +winstonPrice;
	}

	// TODO: Use price regression methods from price calc when reintegrated with core
	async getWinstonPriceForBytes(bytes: Bytes): Promise<Winston> {
		return this.arweave.transactions.getPrice(bytes);
	}

	async prepareARToAddressTransaction(
		arAmount: number,
		fromWallet: Wallet,
		toAddress: ArweaveAddress,
		[
			{ value: appName = 'ArDrive-Core' },
			{ value: appVersion = '1.0' },
			{ value: trxType = 'transfer' },
			...otherTags
		]: GQLTagInterface[]
	): Promise<Transaction> {
		// TODO: Figure out how this works for other wallet types
		const jwkWallet = fromWallet as JWKWallet;
		const winston: Winston = this.arweave.ar.arToWinston(arAmount.toString());

		const transaction = await this.arweave.createTransaction(
			{ target: toAddress, quantity: winston },
			jwkWallet.getPrivateKey()
		);

		// Tag file with data upload Tipping metadata
		transaction.addTag('App-Name', appName);
		transaction.addTag('App-Version', appVersion);
		transaction.addTag('Type', trxType);
		otherTags?.forEach((tag) => {
			transaction.addTag(tag.name, tag.value);
		});

		// TODO: CHECK TAG LIMITS - i.e. upper limit of 2048bytes for all names and values

		// Sign file
		await this.arweave.transactions.sign(transaction, jwkWallet.getPrivateKey());

		return transaction;
	}

	async submitTransaction(transaction: Transaction): Promise<Transaction> {
		// Submit the transaction
		const response = await this.arweave.transactions.post(transaction);
		if (response.status === 200 || response.status === 202) {
			return Promise.resolve(transaction);
		} else {
			throw new Error(`Transaction failed. Response: ${response}`);
		}
	}
}

export function bufferTob64Url(buffer: Uint8Array): string {
	return b64UrlEncode(bufferTob64(buffer));
}

export function b64UrlEncode(b64UrlString: string): string {
	return b64UrlString.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function bufferTob64(buffer: Uint8Array): string {
	return B64js.fromByteArray(new Uint8Array(buffer));
}

export function b64UrlToBuffer(b64UrlString: string): Uint8Array {
	return new Uint8Array(B64js.toByteArray(b64UrlDecode(b64UrlString)));
}

export function b64UrlDecode(b64UrlString: string): string {
	b64UrlString = b64UrlString.replace(/-/g, '+').replace(/_/g, '/');
	let padding;
	b64UrlString.length % 4 == 0 ? (padding = 0) : (padding = 4 - (b64UrlString.length % 4));
	return b64UrlString.concat('='.repeat(padding));
}
