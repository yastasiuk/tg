const routes = {
    signInPhoneNumber: {
        getModule: (props) => import('authPage').then(module => { module.default(props) }),
    }
}

// TODO: remove previous scene?
function navigateTo(state, routeName) {
    const route = routes[routeName];
    if (!route) {
        const error = `Route does not exists: ${routeName}`;
        console.error(error);
        return Promise.reject({ error });
    }
    return route.getModule({ target: state.target });
}

// TODO: Move to signals(?)
function onInit(state, props) {
    navigateTo(state, props.initialRoute);
}

function initRouter(props) {
    const { appNode } = props;
    
    const state = {
        target: appNode,
    };
    onInit(state, props);
    return {
        navigateTo: navigateTo.bind(this, state),
    }
}

let router;
function init (props) {
    if (router) {
        console.error('Router already created');
    } else {
        router = initRouter(props);
    }
    return router
}
export default init;