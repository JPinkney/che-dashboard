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
import { IDevWorkspaceRestApi } from '@eclipse-che/devworkspace-client/dist/rest';

/**
 * This class manages the api connection.
 */
@injectable()
export class DevWorkspaceClient {

  /**
   * Default constructor that is using resource.
   */
  constructor() {
    const originLocation = new URL(window.location.href).origin;
    WorkspaceClient.configureAxios({
      baseURL: originLocation
    });
    this.tokenUpdater();
  }

  get devWorkspaceClientRestApi(): IDevWorkspaceRestApi {
    return WorkspaceClient.getRestApi();
  }

  private tokenUpdater() {
    let isUpdated: boolean;
    const updateTimer = () => {
      if (!isUpdated) {
        isUpdated = true;
        setTimeout(() => {
          isUpdated = false;
        }, 30000);
      }
    };
    updateTimer();
    const interceptor = (async request => {
      const header = 'Authorization';
      const { keycloak } = KeycloakAuthService;
      if (keycloak && keycloak.updateToken && !isUpdated) {
        updateTimer();
        try {
          await new Promise((resolve, reject) => {
            keycloak.updateToken(5).success((refreshed: boolean) => {
              if (refreshed && keycloak.token) {
                WorkspaceClient.configureAxios({
                  token: keycloak.token
                });
                request.headers.common[header] = `Bearer ${keycloak.token}`;
              }
              resolve(keycloak);
            }).error((error: any) => {
              reject(new Error(error));
            });
          });
        } catch (e) {
          console.error('Failed to update token.', e);
          window.sessionStorage.setItem('oidcDashboardRedirectUrl', location.href);
          if (keycloak.login) {
            keycloak.login();
          }
        }
      }
      if (!request.headers?.common[header]) {
        request.headers.common[header] = `Bearer ${this.token}`;
      }
      return request;
    });
    WorkspaceClient.configureAxios({
      interceptors: [interceptor]
    });
  }

  private get token(): string | undefined {
    const { keycloak } = KeycloakAuthService;
    return keycloak ? keycloak.token : undefined;
  }
}
