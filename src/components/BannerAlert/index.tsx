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
import WarningBanner from './WarningBanner';
import WebSocketBanner from './WebSocketBanner';

type Props = {};

type State = {
  bannerAlerts: any[];
};

export class BannerAlert extends React.PureComponent<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      bannerAlerts: [
        <WarningBanner key='WarningBanner'></WarningBanner>,
        <WebSocketBanner key='WebSocketBannerAlert'></WebSocketBanner>
      ]
    };
  }

  render() {
    const banners = this.state.bannerAlerts;
    return (
      <div>
        {banners.map(banner => <div key={banner.key}>{banner}</div>)}
      </div>
    );
  }
}
