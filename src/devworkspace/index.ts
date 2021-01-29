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

/**
 * Convert a devworkspace to something that the natively dashboard understands
 * @param devworkspace The devworkspace that you want to convert
 */
export function convertDevWorkspaceV2ToV1(devworkspace: any) {
  devworkspace.namespace = devworkspace.metadata.namespace;
  devworkspace.devfile = {
    metadata: devworkspace.metadata
  };
  devworkspace.attributes = {
    infrastructureNamespace: devworkspace.namespace,
    created: '1611066990669',
    updated: '1611066990669'
  };
  if (devworkspace.status.workspaceId) {
    devworkspace.id = devworkspace.status?.workspaceId;
  }
  if (devworkspace.status?.phase && devworkspace.status?.ideUrl) {
    devworkspace.runtime = {
      status: devworkspace.status.phase.toUpperCase(),
      activeEnv: '',
      machines: {
        theia: {
          servers: {
            theia: {
              attributes: {
                type: 'ide'
              },
              url: devworkspace.status.ideUrl
            }
          }
        }
      }
    };
    devworkspace.status = devworkspace.status.phase.toUpperCase();
  }
  return devworkspace;
}

/**
 * Check to see if the workspace or devfile is a DevWorkspace
 * @param workspaceOrDevfile The workspace or devfile you want to check
 */
export function isDevWorkspace(workspaceOrDevfile: che.Workspace | api.che.workspace.devfile.Devfile) {
  return (workspaceOrDevfile as any).kind === 'DevWorkspace';
}
