import { Injectable } from '@nestjs/common';
import { AuthAzureServiceInterface } from '../interfaces/services/auth.azure.service.interface';
import { ConfidentialClientApplication } from '@azure/msal-node';
import { Client } from '@microsoft/microsoft-graph-client';
import { ConfigService } from '@nestjs/config';
import { AZURE_AUTHORITY, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET } from 'src/libs/constants/azure';
import { AzureUserDTO } from '../dto/azure-user.dto';

export type AzureDecodedUser = {
	unique_name: string;
	email: string;
	given_name: string;
	family_name: string;
	name: string;
};

@Injectable()
export default class AuthAzureService implements AuthAzureServiceInterface {
	private graphClient: Client;
	private authCredentials: { accessToken: string; expiresOn: Date };

	constructor(private readonly configService: ConfigService) {
		const confidentialClient = new ConfidentialClientApplication({
			auth: {
				clientId: configService.get(AZURE_CLIENT_ID),
				clientSecret: configService.get(AZURE_CLIENT_SECRET),
				authority: configService.get(AZURE_AUTHORITY)
			}
		});

		this.graphClient = Client.init({
			fetchOptions: {
				headers: { ConsistencyLevel: 'eventual' }
			},
			authProvider: async (done) => {
				if (this.authCredentials?.expiresOn >= new Date()) {
					return done(null, this.authCredentials.accessToken);
				}

				const { accessToken, expiresOn } = await confidentialClient.acquireTokenByClientCredential({
					scopes: ['https://graph.microsoft.com/.default']
				});

				this.authCredentials = { accessToken, expiresOn };
				done(null, accessToken);
			}
		});
	}

	async getUserFromAzure(email: string): Promise<AzureUserDTO | undefined> {
		const { value } = await this.graphClient
			.api('/users')
			.select([
				'id',
				'mail',
				'displayName',
				'userPrincipalName',
				'createdDateTime',
				'accountEnabled',
				'deletedDateTime',
				'employeeLeaveDateTime'
			])
			.search(`"mail:${email}" OR "displayName:${email}" OR "userPrincipalName:${email}"`)
			.orderby('displayName')
			.get();

		return value[0];
	}

	fetchUserPhoto(userId: string) {
		return this.graphClient.api(`/users/${userId}/photo/$value`).get();
	}
}
