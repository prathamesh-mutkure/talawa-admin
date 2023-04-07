// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { jestPreviewConfigure } from 'jest-preview';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import 'react-datepicker/dist/react-datepicker.css';
import 'flag-icon-css/css/flag-icons.min.css';
import 'react-toastify/dist/ReactToastify.css';

import './css/bootstrap.min.css';
import './css/index.css';

import { configure } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';

configure({ adapter: new Adapter() });

jestPreviewConfigure({
  // Opt-in to automatic mode to preview failed test case automatically.
  autoPreview: true,
});
