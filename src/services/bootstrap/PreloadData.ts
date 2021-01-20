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

import { Store } from 'redux';
import { lazyInject } from '../../inversify.config';
import { KeycloakSetupService } from '../keycloak/setup';
import { AppState } from '../../store';
import * as BrandingStore from '../../store/Branding';
import * as UserStore from '../../store/User';
import * as WorkspacesStore from '../../store/Workspaces';
import * as DevfileRegistriesStore from '../../store/DevfileRegistries';
import * as InfrastructureNamespaceStore from '../../store/InfrastructureNamespace';
import * as Plugins from '../../store/Plugins';
import { KeycloakAuthService } from '../keycloak/auth';
import { CheWorkspaceClient } from '../cheWorkspaceClient';

/**
 * This class prepares all init data.
 * @author Oleksii Orel
 */
export class PreloadData {

  @lazyInject(KeycloakSetupService)
  private readonly keycloakSetup: KeycloakSetupService;

  @lazyInject(KeycloakAuthService)
  private readonly keycloakAuth: KeycloakAuthService;

  @lazyInject(CheWorkspaceClient)
  private readonly cheWorkspaceClient: CheWorkspaceClient;

  private store: Store<AppState>;

  constructor(store: Store<AppState>) {
    this.store = store;
  }

  async init(): Promise<void> {
    await this.updateUser();
    await this.updateKeycloakUserInfo();
    await this.updateBranding();

    this.updateRestApiClient();
    this.updateJsonRpcMasterApi();

    this.updateWorkspaces();
    this.updateInfrastructureNamespaces();

    const origin = new URL(window.location.href).origin.replace('http', 'ws');
    const unsupported = '/api/unsupported';

    const socket = new WebSocket(`${origin}${unsupported}/k8s/apis/workspace.devfile.io/v1alpha2/namespaces/devworkspace-operator/devworkspaces?watch=true`);
    socket.onopen = function (e) {
      console.log('Opened websocket');
      console.log(e);
    };

    socket.onmessage = function (event) {
      console.log(event);
    };

    socket.onclose = function (event) {
      if (event.wasClean) {
        console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
      } else {
        console.log('[close] Connection died');
      }
    };

    socket.onerror = function (error) {
      console.log(`[error] ${error.eventPhase}`);
    };

    const settings = await this.updateWorkspaceSettings();
    await this.updatePlugins(settings);
    await this.updateRegistriesMetadata(settings);
    await this.updateDevfileSchema();
  }

  private async updateBranding(): Promise<void> {
    const { requestBranding } = BrandingStore.actionCreators;
    await requestBranding()(this.store.dispatch, this.store.getState);
  }

  private updateRestApiClient(): void {
    return this.cheWorkspaceClient.updateRestApiClient();
  }

  private async updateJsonRpcMasterApi(): Promise<void> {
    return this.cheWorkspaceClient.updateJsonRpcMasterApi();
  }

  private setUser(): void {
    const user = this.keycloakSetup.getUser();
    if (user) {
      this.store.dispatch(UserStore.setUser(user));
    }
  }

  private async updateUser(): Promise<void> {
    await this.keycloakSetup.start();
    this.setUser();
  }

  private async updateWorkspaces(): Promise<void> {
    const { requestWorkspaces } = WorkspacesStore.actionCreators;
    await requestWorkspaces()(this.store.dispatch, this.store.getState, undefined);
  }

  private async updatePlugins(settings: che.WorkspaceSettings): Promise<void> {
    const { requestPlugins } = Plugins.actionCreators;
    await requestPlugins(settings.cheWorkspacePluginRegistryUrl || '')(this.store.dispatch, this.store.getState);
  }

  private async updateInfrastructureNamespaces(): Promise<void> {
    const { requestNamespaces } = InfrastructureNamespaceStore.actionCreators;
    await requestNamespaces()(this.store.dispatch, this.store.getState, undefined);
  }

  private async updateWorkspaceSettings(): Promise<che.WorkspaceSettings> {
    const { requestSettings } = WorkspacesStore.actionCreators;
    await requestSettings()(this.store.dispatch, this.store.getState, undefined);

    return this.store.getState().workspaces.settings;
  }

  private async updateRegistriesMetadata(settings: che.WorkspaceSettings): Promise<void> {
    const { requestRegistriesMetadata } = DevfileRegistriesStore.actionCreators;
    await requestRegistriesMetadata(settings.cheWorkspaceDevfileRegistryUrl || '')(this.store.dispatch, this.store.getState, undefined);
  }

  private async updateDevfileSchema(): Promise<void> {
    const { requestJsonSchema } = DevfileRegistriesStore.actionCreators;
    return requestJsonSchema()(this.store.dispatch, this.store.getState, undefined);
  }

  private async updateKeycloakUserInfo(): Promise<void> {
    if (!KeycloakAuthService.sso) {
      return;
    }
    const userInfo = await this.keycloakAuth.fetchUserInfo();
    const user = Object.assign({}, this.keycloakSetup.getUser(), userInfo);
    if (user) {
      this.store.dispatch(UserStore.setUser(user));
    }
  }
}
