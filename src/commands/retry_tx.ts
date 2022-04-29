import { CLICommand, ParametersHelper } from '../CLICommand';
import {
	BoostParameter,
	ConflictResolutionParams,
	DestinationFileNameParameter,
	DryRunParameter,
	ParentFolderIdParameter,
	WalletFileParameter,
	LocalPathParameter,
	GatewayParameter,
	CustomContentTypeParameter,
	TransactionIdParameter,
	FileIdParameter
} from '../parameter_declarations';
import { SUCCESS_EXIT_CODE } from '../CLICommand/error_codes';
import { CLIAction } from '../CLICommand/action';
import { wrapFileOrFolder, EID, readJWKFile, TxID } from 'ardrive-core-js';
import { cliArDriveFactory } from '..';
import { getArweaveFromURL } from '../utils/get_arweave_for_url';

new CLICommand({
	name: 'retry-tx',
	parameters: [
		LocalPathParameter,
		ParentFolderIdParameter,
		{ name: FileIdParameter, required: false },
		DestinationFileNameParameter,
		BoostParameter,
		DryRunParameter,
		...ConflictResolutionParams,
		CustomContentTypeParameter,
		GatewayParameter,
		TransactionIdParameter,
		WalletFileParameter
	],
	action: new CLIAction(async function action(options) {
		const parameters = new ParametersHelper(options);

		const conflictResolution = parameters.getFileNameConflictResolution();
		const customContentType = parameters.getParameterValue(CustomContentTypeParameter);
		const localFilePath = parameters.getRequiredParameterValue<string>(LocalPathParameter);

		const dataTxId = parameters.getRequiredParameterValue(TransactionIdParameter, TxID);
		const wrappedFile = wrapFileOrFolder(localFilePath, customContentType);

		const destinationFolderId = parameters.getParameterValue(ParentFolderIdParameter, EID);
		const fileId = parameters.getParameterValue(FileIdParameter, EID);

		if (wrappedFile.entityType !== 'file') {
			throw Error('Retrying folder uploads is not yet supported!');
		}

		const wallet = parameters.getRequiredParameterValue(WalletFileParameter, readJWKFile);
		const arweave = getArweaveFromURL(parameters.getGateway());

		const arDrive = cliArDriveFactory({
			wallet: wallet,
			feeMultiple: parameters.getOptionalBoostSetting(),
			dryRun: parameters.isDryRun(),
			arweave
		});

		const results = await arDrive.retryPublicArFSFileUpload({
			wrappedFile,
			dataTxId,
			destinationFolderId,
			fileId,
			conflictResolution
		});

		console.log(JSON.stringify(results, null, 4));
		return SUCCESS_EXIT_CODE;
	})
});
