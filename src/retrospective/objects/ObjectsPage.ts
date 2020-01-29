export const RetrospectiveObjectsStateName: string = 'app.objects';

class RetrospectiveObjectsController implements ng.IController {
    public $onInit() { }
    private cf: Function[] = [];
    constructor(
        private $window: ng.IWindowService,
        $scope: ng.IScope,
        private $state: ng.ui.IStateService,
        private $rootScope: ng.IRootScopeService,
        private pipMedia: pip.layouts.IMediaService,
        $injector: angular.auto.IInjectorService,
        private $location: ng.ILocationService,
        private pipNavService: pip.nav.INavService
    ) {
        "ngInject";

        this.appHeader();
        this.cf.push($rootScope.$on(pip.services.IdentityChangedEvent, this.changeAppBar.bind(this)));
        this.cf.push($rootScope.$on('pipMainResized', this.changeAppBar.bind(this)));
    }

    public $onDestroy() {
        for (const f of this.cf) { f(); }
    }

    private appHeader(): void {

        this.pipNavService.appbar.parts = { 'icon': true, 'actions': 'primary', 'menu': true, 'title': 'breadcrumb' };
        this.pipNavService.appbar.addShadow();
        this.pipNavService.actions.hide();
        this.pipNavService.appbar.removeShadow();

        this.changeAppBar();

        this.cf.push(this.$rootScope.$on('pipMainResized', () => {
            this.changeAppBar();
        }));

        this.cf.push(this.$rootScope.$on('iqsChangeNav', () => {
            this.changeAppBar();
        }));
    }

    private toMainFromDetails() {
        this.$location.search('details', 'main');
        this.$rootScope.$broadcast('iqsChangeNavPage');
        this.changeAppBar();
    }

    public changeAppBar() {
        this.pipNavService.breadcrumb.items = [
            <pip.nav.BreadcrumbItem>{ title: "RETROSPECTIVE", click: () => { this.$state.go("app.map"); } },
            <pip.nav.BreadcrumbItem>{ title: "RETROSPECTIVE_OBJECTS", click: () => { } }
        ];
        this.pipNavService.breadcrumb.breakpoint = 'gt-sm';

        if (!this.pipMedia('gt-sm')) {
            if (this.$location.search().details == 'details') {

                this.pipNavService.breadcrumb.items = [
                    <pip.nav.BreadcrumbItem>{ title: "RETROSPECTIVE", click: () => { this.$state.go('app.map'); } },
                    <pip.nav.BreadcrumbItem>{
                        title: "RETROSPECTIVE_OBJECTS", click: () => {
                            this.toMainFromDetails();
                        }
                    },
                    <pip.nav.BreadcrumbItem>{
                        title: "Details", click: () => {

                        }
                    }
                ];
                this.pipNavService.icon.showBack(() => {
                    this.toMainFromDetails();
                });
            } else {
                this.pipNavService.icon.showBack(() => {
                    this.$state.go('app.map');
                });
            }

        } else {
            this.pipNavService.icon.showMenu();
        }
    }

    public onRetry() {
        this.$window.history.back();
    }
}

function configureRetrospectiveObjectsRoute(
    $injector: angular.auto.IInjectorService,
    $stateProvider: pip.rest.IAuthStateService
) {
    "ngInject";

    $stateProvider

        .state(RetrospectiveObjectsStateName, {
            url: '/objects?type&curr_object_id&section&details',
            auth: true,
            reloadOnSearch: false,
            views: {
                '@': {
                    controller: RetrospectiveObjectsController,
                    controllerAs: '$ctrl',
                    reloadOnSearch: false,
                    templateUrl: "retrospective/objects/ObjectsPage.html"
                }
            }

        })
}

function configureRetrospectiveObjectsAccess(
    iqsAccessConfigProvider: iqs.shell.IAccessConfigProvider
) {
    "ngInject";

    let accessLevel: number = iqs.shell.AccessRole.user;
    let accessConfig: any = {
        objectEdit: iqs.shell.AccessRole.manager,
        changeDevice: iqs.shell.AccessRole.manager,
        detachDevice: iqs.shell.AccessRole.manager,
        goToDevice: iqs.shell.AccessRole.user,
    }

    iqsAccessConfigProvider.registerStateAccess(RetrospectiveObjectsStateName, accessLevel);

    iqsAccessConfigProvider.registerStateConfigure(RetrospectiveObjectsStateName, accessConfig);
}

(() => {
    const translateConfig = function (pipTranslateProvider) {
        // Set translation strings for the module
        pipTranslateProvider.translations('en', {
            "RETROSPECTIVE_OBJECTS": 'Objects',
            'RETROSPECTIVE_EMPTY': 'Objects were not found on the organization at the specified time'
        });

        pipTranslateProvider.translations('ru', {
            "RETROSPECTIVE_OBJECTS": 'Объекты',
            'RETROSPECTIVE_EMPTY': 'Наблюдаемых объектов на рабочей площадке в указанное время не найдено'
        });
    }

    angular
        .module('iqsRetrospective.Objects', ['iqsRetrospectiveObjectsPanel'])
        .config(configureRetrospectiveObjectsRoute)
        .config(translateConfig)
        .config(configureRetrospectiveObjectsAccess);
})();
