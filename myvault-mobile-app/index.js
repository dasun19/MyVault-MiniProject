/**
 * @format
 */


import { decode as atob } from 'base-64';

if (!global.window) {
  global.window = {};
}
global.window.atob = atob;
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
