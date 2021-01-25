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

/**
 * This class manages the api connection.
 */
@injectable()
export class DevWorkspaceClient {

  getAllWorkspaces(namespace: string): Promise<any> {
    return fetch(`http://localhost:8080/workspace/namespace/${namespace}`).then(response => response?.json());
  }

  getWorkspaceByName(namespace: string, workspaceName: string): Promise<any> {
    return fetch(`http://localhost:8080/workspace/namespace/${namespace}/${workspaceName}`);
  }

  create(devfile: any): Promise<any> {
    return fetch('http://localhost:8080/workspace', {
      method: 'POST',
      body: devfile
    });
  }

  delete(namespace: string, name: string): Promise<any> {
    return fetch(`http://localhost:8080/workspace/namespace/${namespace}/${name}`, {
      method: 'DELETE'
    });
  }

  changeWorkspaceStatus(workspace: any, started: boolean): Promise<any> {
    return fetch(`http://localhost:8080/workspace/namespace/${workspace.metadata.namespace}/${workspace.metadata.name}`, {
      method: 'PATCH',
      body: JSON.stringify({ started }),
      headers: {
        'Content-type': 'application/merge-patch+json'
      }
    });
  }

  subscribeToNamespace(namespace: string): Promise<any> {
    return fetch(`http://localhost:8080/workspace/namespace/${namespace}/subscribe`, {
      method: 'GET'
    }).then(response => response?.json());
  }

  unsubscribeFromNamespace(namespace: string): Promise<any> {
    return fetch(`http://localhost:8080/workspace/namespace/${namespace}/subscribe`, {
      method: 'DELETE'
    });
  }

}
