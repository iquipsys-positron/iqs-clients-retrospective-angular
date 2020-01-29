(() => {
    function iqsPositronRetrospectiveConfig(
        pipActionsProvider: pip.nav.IActionsProvider,
        pipAuthStateProvider: pip.rest.IAuthStateProvider,
        pipErrorPageConfigServiceProvider: pip.errors.IErrorPageConfigProvider,
    ) {
        pipAuthStateProvider.authorizedState = 'app.map';
        pipErrorPageConfigServiceProvider.configs.NoConnection.RedirectSateDefault = pipAuthStateProvider.authorizedState;

        pipActionsProvider.primaryGlobalActions.unshift(...[
            { name: 'global.incidents', icon: 'icons:bell', count: 0, event: 'iqsIncidentsOpen' },
        ]);
    }

    angular
        .module('iqsPositronRetrospective.Config', [
            'ngCookies',
            'iqsShell',
            'iqsIncidents.Panel',
            'pipSystem',
            'pipSystem.Templates',
        ])
        .config(iqsPositronRetrospectiveConfig);
})();