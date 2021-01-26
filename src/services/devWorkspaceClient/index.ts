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

/**
 * This class manages the api connection.
 */
@injectable()
export class DevWorkspaceClient {

  getAllWorkspaces(namespace: string): Promise<any> {
    return fetch(`http://localhost:8080/workspace/namespace/${namespace}`, {
      headers: {
        'Authentication': `Bearer ${this.token}`
      }
    }).then(response => response?.json());
  }

  getWorkspaceByName(namespace: string, workspaceName: string): Promise<any> {
    return fetch(`http://localhost:8080/workspace/namespace/${namespace}/${workspaceName}`, {
      headers: {
        'Authentication': `Bearer ${this.token}`
      }
    });
  }

  create(devfile: any): Promise<any> {
    return fetch('http://localhost:8080/workspace', {
      method: 'POST',
      body: devfile,
      headers: {
        'Authentication': `Bearer ${this.token}`
      }
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
    return fetch(`http://localhost:8080/workspace/namespace/${workspace.metadata.namespace}/${workspace.metadata.name}?token=${this.token}`, {
      method: 'PATCH',
      body: JSON.stringify({ started }),
      headers: {
        'Authentication': `Bearer ${this.token}`,
        'Content-type': 'application/merge-patch+json'
      }
    });
  }

  subscribeToNamespace(namespace: string): Promise<any> {
    return fetch(`http://localhost:8080/workspace/namespace/${namespace}/subscribe?token=${this.token}`, {
      method: 'GET',
      headers: {
        'Authentication': `Bearer ${this.token}`
      }
    }).then(response => response?.json());
  }

  unsubscribeFromNamespace(namespace: string): Promise<any> {
    return fetch(`http://localhost:8080/workspace/namespace/${namespace}/subscribe?token=${this.token}`, {
      method: 'DELETE',
      headers: {
        'Authentication': `Bearer ${this.token}`
      }
    });
  }

  private get token(): string | undefined {
    const { keycloak } = KeycloakAuthService;
    return keycloak ? keycloak.token : undefined;
  }
}
