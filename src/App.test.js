import React from 'react';
import { Provider } from 'react-redux';
import configureStore from './redux/store-mock';
import ReactDOM from 'react-dom';
import App from './App';

const store = configureStore();

it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(
        <Provider store={store}>
            <App />
        </Provider>, div
    );
    ReactDOM.unmountComponentAtNode(div);
});
