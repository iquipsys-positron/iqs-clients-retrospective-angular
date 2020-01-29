import './events/OperationalEventsPage';
import './components/RetrospectiveDataTime';
import './map/MapPage';
import './objects/ObjectsPage';

export const RetrospectiveStateName: string = 'app';

class RetrospectiveController implements ng.IController {
    public $onInit() { }

    private cf: Function[] = [];

    constructor(
        private $window: ng.IWindowService,
        $scope: ng.IScope,
        $state: ng.ui.IStateService,
        private $rootScope: ng.IRootScopeService,
        private pipMedia: pip.layouts.IMediaService,
        private pipNavService: pip.nav.INavService
    ) {
        "ngInject";

        this.appHeader();
        this.cf.push($rootScope.$on(pip.services.IdentityChangedEvent, this.appHeader.bind(this)));
        this.cf.push($rootScope.$on('pipMainResized', this.appHeader.bind(this)));
    }

    public $onDestroy() {
        for (const f of this.cf) { f(); }
    }

    private appHeader(): void {
        this.pipNavService.appbar.addShadow();
        this.pipNavService.actions.hide();
        this.pipNavService.appbar.removeShadow();
        this.pipNavService.appbar.parts = { 'icon': true, 'actions': 'primary', 'menu': true, 'title': 'breadcrumb', 'organizations': this.pipMedia('gt-sm') };
    }

    public onRetry() {
        this.$window.history.back();
    }

}

function configureRetrospectiveRoute(
    $injector: angular.auto.IInjectorService,
    $stateProvider: pip.rest.IAuthStateService
) {
    "ngInject";

    $stateProvider
        .state(RetrospectiveStateName, {
            url: '/app?retro_date',
            auth: true,
            reloadOnSearch: false,
            views: {
                '@': {
                    controller: RetrospectiveController,
                    controllerAs: '$ctrl',
                    templateUrl: 'retrospective/Retrospective.html'
                }
            }
        });
}

function configureRetrospectiveAccess(
    iqsAccessConfigProvider: iqs.shell.IAccessConfigProvider
) {
    "ngInject";

    let accessLevel: number = iqs.shell.AccessRole.user;
    let accessConfig: any = {

    }

    iqsAccessConfigProvider.registerStateAccess(RetrospectiveStateName, accessLevel);

    iqsAccessConfigProvider.registerStateConfigure(RetrospectiveStateName, accessConfig);
}

(() => {

    angular
        .module('iqsRetrospective', [
            'pipNav',
            'iqsRetrospectiveDataTimePanel',

            'iqsRetrospective.Events',
            'iqsRetrospective.Map',
            'iqsRetrospective.Objects',
            'iqsStatus'
        ])
        .config(configureRetrospectiveRoute)
        .config(configureRetrospectiveAccess);
})();
