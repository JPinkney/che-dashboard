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

import { AxiosInstance } from 'axios';
import { injectable } from 'inversify';
import WorkspaceClient from '@eclipse-che/workspace-client';
import { KeycloakAuthService } from '../keycloak/auth';
import * as aa from '../../../../devworkspace-client/dist';

/**
 * This class manages the api connection.
 */
@injectable()
export class DevWorkspaceClient {
  private readonly axios: AxiosInstance;
  public devWorkspaceClient: aa.IDevWorkspaceClient;

  /**
   * Default constructor that is using resource.
   */
  constructor() {
    // todo change this temporary solution after adding the proper method to workspace-client https://github.com/eclipse/che/issues/18311
    this.axios = (WorkspaceClient as any).createAxiosInstance({ loggingEnabled: false });
    if (this.axios.defaults.headers === undefined) {
      this.axios.defaults.headers = {};
    }
    if (this.axios.defaults.headers.common === undefined) {
      this.axios.defaults.headers.common = {};
    }
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
    this.axios.interceptors.request.use(async request => {
      const { keycloak } = KeycloakAuthService;
      if (keycloak && keycloak.updateToken && !isUpdated) {
        updateTimer();
        try {
          await new Promise((resolve, reject) => {
            keycloak.updateToken(5).success((refreshed: boolean) => {
              if (refreshed && keycloak.token) {
                const header = 'Authorization';
                this.axios.defaults.headers.common[header] = `Bearer ${keycloak.token}`;
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
      return request;
    });
    this.devWorkspaceClient = new aa.default('/');
  }

  private get token(): string | undefined {
    const { keycloak } = KeycloakAuthService;
    return keycloak ? keycloak.token : undefined;
  }
}
