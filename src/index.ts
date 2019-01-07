import './style.css'
import {Main} from './main'

function init() {
	const container = document.getElementById('appContainer');
	new Main(container);
}

init();