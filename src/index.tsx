import * as React from 'react';
import * as ReactDOM from 'react-dom';
import configureStore from './store/configureStore';
import {Provider} from 'react-redux';
import App from './components/App';
import {createHashHistory} from 'history';
import {PreloadData} from './services/bootstrap/PreloadData';

const history = createHashHistory();
// get the application-wide store instance, with state from the server where available
const store = configureStore(history);
// preload app data
new PreloadData(store).init();

const ROOT = document.querySelector('.ui-container');
ReactDOM.render(<Provider store={store}><App history={history}/></Provider>, ROOT);