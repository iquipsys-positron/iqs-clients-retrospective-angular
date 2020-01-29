export const RetrospectiveMapStateName: string = 'app.map';

class RetrospectiveMapController implements ng.IController {
    public $onInit() { }
    private cf: Function[] = [];
    constructor(
        private $window: ng.IWindowService,
        private $scope: ng.IScope,
        private $rootScope: ng.IScope,
        $state: ng.ui.IStateService,
        $injector: angular.auto.IInjectorService,
        private pipNavService: pip.nav.INavService,
        private pipMedia: pip.layouts.IMediaService
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
        this.pipNavService.appbar.parts = { 'icon': true, 'actions': 'primary', 'menu': true, 'title': 'breadcrumb', 'organizations': this.pipMedia('gt-sm') };
        this.pipNavService.appbar.addShadow();
        this.pipNavService.breadcrumb.text = 'RETROSPECTIVE';
        this.pipNavService.actions.hide();
        this.pipNavService.appbar.removeShadow();
        this.pipNavService.icon.showMenu();
    }

    public onRetry() {
        this.$window.history.back();
    }
}

function configureRetrospectiveMapRoute(
    $injector: angular.auto.IInjectorService,
    $stateProvider: pip.rest.IAuthStateService
) {
    "ngInject";

    $stateProvider

        .state(RetrospectiveMapStateName, {
            url: '/map?search&device_id&focus_object_id',
            auth: true,
            reloadOnSearch: false,
            views: {
                '@': {
                    controller: RetrospectiveMapController,
                    controllerAs: '$ctrl',
                    reloadOnSearch: false,
                    templateUrl: "retrospective/map/MapPage.html"
                }
            }
        })
}

function configureRetrospectiveMapAccess(
    iqsAccessConfigProvider: iqs.shell.IAccessConfigProvider
) {
    "ngInject";

    let accessLevel: number = iqs.shell.AccessRole.user;
    let accessConfig: any = {
        zonePopapConfigure: iqs.shell.AccessRole.manager,
    }

    iqsAccessConfigProvider.registerStateAccess(RetrospectiveMapStateName, accessLevel);

    iqsAccessConfigProvider.registerStateConfigure(RetrospectiveMapStateName, accessConfig);
}

function configureRetrospectiveMapTranslations(
    pipTranslateProvider: pip.services.ITranslateProvider
) {
    pipTranslateProvider.translations('en', {
        NO_MAP_DATA: 'Sorry! No map settings!',
        CONTACT_THE_ADMINISTRATOR: 'Please, contact the administrator!',
        CONFIG_GLOBAL_MAP_SETTINGS: 'Please, configure global map\'s settings!',
        GO_TO_GLOBAL_MAP_SETTINGS: 'Global map\'s settings',
        SEARCH: 'Search...',
        MAP_LOADING: 'Map loading...',
        CONTROL_OBJECTS: 'Control objects',
        ZONES: 'Zones',
        LOCATIONS: 'Locations',
        FIND_OBJECTS: 'Find objects...'
    });

    pipTranslateProvider.translations('ru', {
        'NO_MAP_DATA': 'Извините! Отсутствуют настройки карты!',
        'CONTACT_THE_ADMINISTRATOR': 'Пожалуйста, свяжитесь с администратором!',
        'CONFIG_GLOBAL_MAP_SETTINGS': 'Пожалуйста, настройте параметры глобальных карт!',
        'GO_TO_GLOBAL_MAP_SETTINGS': 'Глобальные настройки карты',
        SEARCH: 'Поиск...',
        MAP_LOADING: 'Загрузка карты...',
        CONTROL_OBJECTS: 'Объекты контроля',
        ZONES: 'Зоны',
        LOCATIONS: 'Места',
        FIND_OBJECTS: 'Найти объекты...'
    });
}

(() => {

    angular
        .module('iqsRetrospective.Map', [
            'iqsRetrospectiveMapPanel',
            'iqsLastEventPanel',
            'iqsSearchResultsPanel',
            'iqsZoneEventRulesPanel',
            'iqsCurrentObjectStates',
            'iqsZoomButtonsPanel',
            'iqsCurrentStateObjectDetailsPanel'
        ])
        .config(configureRetrospectiveMapRoute)
        .config(configureRetrospectiveMapTranslations)
        .config(configureRetrospectiveMapAccess);
})();
