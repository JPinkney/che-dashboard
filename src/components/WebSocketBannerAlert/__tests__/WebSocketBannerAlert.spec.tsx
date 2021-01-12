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

import React from 'react';
import { container } from '../../../inversify.config';
import WebSocketBannerAlert from '../';
import { CheWorkspaceClient } from '../../../services/cheWorkspaceClient';
import { Provider } from 'react-redux';
import { FakeStoreBuilder } from '../../../store/__mocks__/storeBuilder';
import { BrandingData } from '../../../services/bootstrap/branding.constant';
import { render, RenderResult } from '@testing-library/react';

const failingWebSocketName = 'Failing websocket';

class mockCheWorkspaceClient extends CheWorkspaceClient {
  get failingWebSockets() { return [failingWebSocketName]; }
}

const store = new FakeStoreBuilder().withBranding({
  docs: {
    webSocketTroubleshooting: 'http://sample_documentation'
  }
} as BrandingData).build();

describe('WebSocketBannerAlert component', () => {
  it('should show error message when error found before mounting', () => {
    container.rebind(CheWorkspaceClient).to(mockCheWorkspaceClient).inSingletonScope();
    const component = renderComponent(<WebSocketBannerAlert />);
    container.rebind(CheWorkspaceClient).to(CheWorkspaceClient).inSingletonScope();
    expect(component.getAllByText(failingWebSocketName, {
      exact: false
    }).length).toEqual(1);
  });

  it('should show error message when error found after mounting', () => {
    const comp = (
      <Provider store={store}>
        <WebSocketBannerAlert />
      </Provider>
    );
    const component = renderComponent(comp);
    expect(component.queryAllByText(failingWebSocketName, {
      exact: false
    })).toEqual([]);
    container.rebind(CheWorkspaceClient).to(mockCheWorkspaceClient).inSingletonScope();
    component.rerender(comp);
    container.rebind(CheWorkspaceClient).to(CheWorkspaceClient).inSingletonScope();
    expect(component.getAllByText(failingWebSocketName, {
      exact: false
    }).length).toEqual(1);
  });

  it('should not show error message if none is present', () => {
    const component = renderComponent(<WebSocketBannerAlert />);
    expect(component.queryAllByText(failingWebSocketName, {
      exact: false
    })).toEqual([]);
  });

});

function renderComponent(
  component: React.ReactElement
): RenderResult {
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
}
