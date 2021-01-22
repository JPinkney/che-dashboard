/*
 * Copyright (c) 2018-2020 Red Hat, Inc.
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Contributors:
 *   Red Hat, Inc. - initial API and implementation
 */

import { injectable } from 'inversify';
import { KeycloakAuthService } from '../keycloak/auth';
import { DevWorkspaceClient as WorkspaceClient } from '@eclipse-che/devworkspace-client';
import { IDevWorkspaceApi } from '@eclipse-che/devworkspace-client/dist/api';
import { AxiosRequestConfig } from 'axios';

/**
 * This class manages the api connection.
 */
@injectable()
export class DevWorkspaceClient {

  private devworkspaceApi: IDevWorkspaceApi;

  /**
   * Default constructor that is using resource.
   */
  constructor() {
    const originLocation = new URL(window.location.href).origin;
    this.devworkspaceApi = WorkspaceClient.getApi(this.refreshToken);
    this.devworkspaceApi.configureAxios({
      baseURL: originLocation
    });
  }

  get devWorkspaceClientRestApi(): IDevWorkspaceApi {
    return this.devworkspaceApi;
  }

  private get token(): string | undefined {
    const { keycloak } = KeycloakAuthService;
    return keycloak ? keycloak.token : undefined;
  }

  private refreshToken(request?: AxiosRequestConfig): Promise<string | Error> {
    const { keycloak } = KeycloakAuthService;
    if (keycloak) {
      return new Promise((resolve, reject) => {
        keycloak.updateToken(5).success((refreshed: boolean) => {
          if (refreshed && keycloak.token) {
            const header = 'Authorization';
            this.devworkspaceApi.configureAxios({
              token: keycloak.token
            });
            if (request) {
              request.headers.common[header] = `Bearer ${keycloak.token}`;
            }
          }
          resolve(keycloak.token as string);
        }).error((error: any) => {
          reject(new Error(error));
        });
      });
    }
    if (!this.token) {
      return Promise.reject(new Error('Unable to resolve token'));
    }
    return Promise.resolve(this.token);
  }
}
