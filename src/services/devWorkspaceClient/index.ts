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

import { KubernetesNamespace } from 'che';
import { injectable } from 'inversify';
import { delay } from '../helpers/delay';
import { KeycloakAuthService } from '../keycloak/auth';

/**
 * This class manages the connection between the frontend and the devworkspace client backend
 */
@injectable()
export class DevWorkspaceClient {

  getAllWorkspaces(namespaces: KubernetesNamespace[]): Promise<any> {
    const promises: Promise<any>[] = [];
    namespaces.forEach(namespace => {
      const request = fetch(`http://localhost:8080/workspace/namespace/${namespace.name}`, {
        headers: {
          'Authentication': `Bearer ${this.token}`
        }
      }).then(response => response?.json());
      promises.push(request);
    });
    return Promise.all(promises);
  }

  getWorkspaceByName(namespace: string, workspaceName: string): Promise<any> {
    return fetch(`http://localhost:8080/workspace/namespace/${namespace}/${workspaceName}`, {
      headers: {
        'Authentication': `Bearer ${this.token}`
      }
    }).then(async (resp) => {
      return (await resp?.json()).body;
    });
  }

  create(devfile: any): Promise<any> {
    return fetch('http://localhost:8080/workspace', {
      method: 'POST',
      body: JSON.stringify(devfile),
      headers: {
        'Authentication': `Bearer ${this.token}`
      }
    }).then(async (resp) => {
      const body = (await resp?.json()).body;
      if (body?.status) {
        return body;
      }
      let found;
      let count = 0;
      while (count < 5 && !found) {
        const potentialWorkspace = await this.getWorkspaceByName(devfile.metadata.namespace, devfile.metadata.name);
        if (potentialWorkspace?.status) {
          found = potentialWorkspace;
        } else {
          count += 1;
          delay();
        }
      }
      return found;
    });
  }

  delete(namespace: string, name: string): Promise<any> {
    return fetch(`http://localhost:8080/workspace/namespace/${namespace}/${name}`, {
      method: 'DELETE',
      headers: {
        'Authentication': `Bearer ${this.token}`
      }
    });
  }

  changeWorkspaceStatus(workspace: any, started: boolean): Promise<any> {
    return fetch(`http://localhost:8080/workspace/namespace/${workspace.metadata.namespace}/${workspace.metadata.name}`, {
      method: 'PATCH',
      body: JSON.stringify({ started }),
      headers: {
        'Authentication': `Bearer ${this.token}`,
        'Content-type': 'application/merge-patch+json'
      }
    }).then(async resp => (await resp?.json()).body);
  }

  subscribeToNamespaces(namespaces: KubernetesNamespace[], callback: any, dispatch: any): Promise<any> {
    const promises: Promise<any>[] = [];
    namespaces.forEach(namespace => {
      const websocket = new WebSocket(`ws://localhost:8080/workspace/namespace/${namespace.name}/subscribe`, 'json');
      websocket.onopen = () => {
        const keycloakMessage = {
          keycloakToken: this.token
        };
        websocket.send(JSON.stringify(keycloakMessage));
      };
      websocket.onmessage = (message) => {
        const parsedMessage = JSON.parse(message.data);
        callback({
          id: parsedMessage.workspaceId
        } as che.Workspace, parsedMessage)(dispatch);
      };
    });
    return Promise.all(promises);
  }

  unsubscribeFromNamespace(namespace: string): Promise<any> {
    return fetch(`http://localhost:8080/workspace/namespace/${namespace}/subscribe`, {
      method: 'DELETE',
      headers: {
        'Authentication': `Bearer ${this.token}`
      }
    });
  }

  precreateNamespaces(namespaces: KubernetesNamespace[]): any {
    namespaces.forEach(namespace => {
      fetch(`http://localhost:8080/namespace/${namespace.name}`, {
        method: 'POST',
        headers: {
          'Authentication': `Bearer ${this.token}`
        }
      }).then(response => response?.json());
    });
  }

  private get token(): string | undefined {
    const { keycloak } = KeycloakAuthService;
    return keycloak ? keycloak.token : undefined;
  }
}
