import { CLICommand, ParametersHelper } from '../CLICommand';
import {
	BoostParameter,
	DryRunParameter,
	DriveIdParameter,
	DrivePrivacyParameters,
	DriveNameParameter,
	GatewayParameter
} from '../parameter_declarations';
import { cliArDriveFactory } from '..';
import { SUCCESS_EXIT_CODE } from '../CLICommand/error_codes';
import { CLIAction } from '../CLICommand/action';
import { EID, Wallet } from 'ardrive-core-js';
import { getArweaveFromURL } from '../utils/get_arweave_for_url';

new CLICommand({
	name: 'rename-drive',
	parameters: [
		DriveIdParameter,
		{ name: DriveNameParameter, description: 'the new name for the drive' },
		BoostParameter,
		DryRunParameter,
		...DrivePrivacyParameters,
		GatewayParameter
	],
	action: new CLIAction(async function action(options) {
		const parameters = new ParametersHelper(options);
		const arweave = getArweaveFromURL(parameters.getGateway());

		const dryRun = parameters.isDryRun();
		const driveId = parameters.getRequiredParameterValue(DriveIdParameter, EID);
		const newName = parameters.getRequiredParameterValue(DriveNameParameter);

		const wallet: Wallet = await parameters.getRequiredWallet();
		const ardrive = cliArDriveFactory({
			wallet,
			feeMultiple: parameters.getOptionalBoostSetting(),
			dryRun,
			arweave
		});

		const result = await (async function () {
			if (await parameters.getIsPrivate()) {
				const driveKey = await parameters.getDriveKey({ driveId });

				return ardrive.renamePrivateDrive({
					driveId,
					newName,
					driveKey
				});
			} else {
				return ardrive.renamePublicDrive({
					driveId,
					newName
				});
			}
		})();

		console.log(JSON.stringify(result, null, 4));
		return SUCCESS_EXIT_CODE;
	})
});
