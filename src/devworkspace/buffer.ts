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

export interface IStream {
  done: any;
  value: any;
}

export function stream(reader: any) {
  const utf8Decoder = new TextDecoder('utf-8');
  let buffer = '';

  // wait for an update and prepare to read it
  return reader.read().then(function onIncomingStream({ done, value }: IStream) {
    if (done) {
      console.log('Watch request terminated');
      return;
    }
    buffer += utf8Decoder.decode(value);
    const remainingBuffer = findLine(buffer, (line: any) => {
      try {
        const event = JSON.parse(line);
        const pod = event.object;
        console.log('PROCESSING EVENT: ', event.type, pod.metadata.name);
      } catch (error) {
        console.log('Error while parsing\n', error);
      }
    });

    buffer = remainingBuffer;

    // continue waiting & reading the stream of updates from the server
    return reader.read().then(onIncomingStream);
  });
}

function findLine(buffer: any, fn: any): any {
  const newLineIndex = buffer.indexOf('\n');
  // if the buffer doesn't contain a new line, do nothing
  if (newLineIndex === -1) {
    return buffer;
  }
  const chunk = buffer.slice(0, buffer.indexOf('\n'));
  const newBuffer = buffer.slice(buffer.indexOf('\n') + 1);

  // found a new line! execute the callback
  fn(chunk);

  // there could be more lines, checking again
  return findLine(newBuffer, fn);
}
