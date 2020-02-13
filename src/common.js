import './styles.scss';
import Router from 'controllers/router.controller';
// TODO: Force lazy loading for future parts!
let initialized = false;
// Fetch to find out whether we're Authenticated or not(!) => load afterwards
function init() {
    const rootId = 'app';
    if (initialized) { return } else { initialized = true }

    const appNode = document.getElementById(rootId);
    const initialRoute = 'signInPhoneNumber';
    const router = Router({ initialRoute, appNode });
}

document.addEventListener('DOMContentLoaded', init, false);

// const configuration = {
//     rootId: 'app',
//     initialRoute: 'signInPhoneNumber',
// };
// const init = () => {
//     if (!window.__initialize_app__) {
//         setTimeout(() => init(), 0);
//     } else {
//         window.__initialize_app__(configuration)
//     }
// }
// document.addEventListener('DOMContentLoaded', init, false);