import { IOperationalEventRetrospectiveSaveService } from './IOperationalEventRetrospectiveSaveService';

export const RetrospectiveEventsStateName: string = 'app.events';

class OperationalEventsRetrospectiveController implements ng.IController {
    public $onInit() { }
    private localFilter: iqs.shell.AssocietedObject = null;
    private mediaSizeGtSm: boolean;

    public severityMedium: number = iqs.shell.Severity.Medium;
    public severityLow: number = iqs.shell.Severity.Low;;
    public severityHigh: number = iqs.shell.Severity.High;
    public searchCriteria: string = '';
    public currentState: string;

    public SeverityCollection: iqs.shell.TypeNumericCollection;
    public expand: boolean = true;
    public details: boolean;
    public date: string;
    public play: boolean = true;
    public isSearch: boolean = false;
    public isHistory: boolean = true;
    public class = "iqs-flex-retro";
    public accessConfig: any;
    public defaultCollection: string[];
    private cf: Function[] = [];

    constructor(
        private $window: ng.IWindowService,
        private $state: ng.ui.IStateService,
        private $location: ng.ILocationService,
        $rootScope: ng.IRootScopeService,
        $scope: ng.IScope,
        private pipMedia: pip.layouts.IMediaService,
        private iqsOrganization: iqs.shell.IOrganizationService,
        private pipNavService: pip.nav.INavService,
        private pipDateFormat: pip.dates.IDateFormatService,
        private iqsRetrospectiveOperationalEventsViewModel: iqs.shell.IOperationalEventsViewModel,
        private iqsOperationalEventRetrospectiveSaveService: IOperationalEventRetrospectiveSaveService,
        private iqsTypeCollectionsService: iqs.shell.ITypeCollectionsService,
        private pipDateConvert: pip.dates.IDateConvertService,
        private iqsObjectGroupsViewModel: iqs.shell.IObjectGroupsViewModel,
        private iqsLocationsViewModel: iqs.shell.ILocationsViewModel,
        private iqsZonesViewModel: iqs.shell.IZonesViewModel,
        private iqsObjectsViewModel: iqs.shell.IObjectsViewModel,
        private iqsAccessConfig: iqs.shell.IAccessConfigService,
        private iqsLoading: iqs.shell.ILoadingService
    ) {
        "ngInject";

        this.cf.push($rootScope.$on('pipMainResized', () => {
            if (this.mediaSizeGtSm !== this.pipMedia('gt-sm')) {
                this.mediaSizeGtSm = this.pipMedia('gt-sm');
                if (this.pipMedia('gt-sm')) {
                    this.details = false;
                } else {
                    if (this.currentState === iqs.shell.States.Add || this.currentState === iqs.shell.States.Edit) {
                        this.details = true;
                    }
                }
                this.appHeader();
            }
        }));

        const runWhenReady = () => {
            this.restoreState();
            this.onReload();

            this.defaultCollection = this.iqsRetrospectiveOperationalEventsViewModel.getDefaultCollection();
            this.accessConfig = this.iqsAccessConfig.getStateConfigure().access;

            this.changeDate(this.date);

            this.mediaSizeGtSm = this.pipMedia('gt-sm');
            if (!this.pipMedia('gt-sm')) {
                if (this.currentState === iqs.shell.States.Add) {
                    this.details = true;
                } else {
                    this.details = $location.search().details == 'details' ? true : false;
                }
            } else {
                this.details = false;
                this.$location.search('details', 'main');
            }

            this.iqsObjectGroupsViewModel.read();
            this.iqsLocationsViewModel.read();
            this.iqsObjectsViewModel.read();
            this.iqsZonesViewModel.read();

            this.SeverityCollection = this.iqsTypeCollectionsService.getSeverity();


            this.appHeader();
        };

        if (this.iqsLoading.isDone) {
            runWhenReady();
        }

        this.cf.push($rootScope.$on(iqs.shell.LoadingCompleteEvent, runWhenReady.bind(this)));
    }

    public $onDestroy() {
        this.saveCurrentState();
        for (const f of this.cf) { f(); }
    }

    private getTimeFilter(date: string): any {
        let nowDate = date ? moment(date).toDate() : new Date();
        let prevDate = this.pipDateConvert.addHours(nowDate, -24);
        let timeFilter: iqs.shell.OperationalEventFilter = {
            to_time: nowDate.toISOString(),
            from_time: prevDate.toISOString()
        }

        return timeFilter;
    }

    private saveCurrentState() {
        this.iqsOperationalEventRetrospectiveSaveService.eventId =
            this.selectedIndex != null && this.selectedIndex > -1 && this.collection.length > 0 && this.collection[this.selectedIndex] ? this.collection[this.selectedIndex].id : null;
        this.iqsOperationalEventRetrospectiveSaveService.currState = this.state;
        this.iqsOperationalEventRetrospectiveSaveService.search = this.searchCriteria;
        this.iqsOperationalEventRetrospectiveSaveService.timeShift = this.date;
    }

    private restoreState() {
        this.searchCriteria = this.iqsOperationalEventRetrospectiveSaveService.search ? this.iqsOperationalEventRetrospectiveSaveService.search : this.$location.search()['search'] || '';
        if (this.iqsOperationalEventRetrospectiveSaveService.eventId) {
            this.$location.search('event_id', this.iqsOperationalEventRetrospectiveSaveService.eventId);
        }
        this.currentState = this.iqsOperationalEventRetrospectiveSaveService.currState ?
            this.iqsOperationalEventRetrospectiveSaveService.currState : null;
        this.currentState = this.currentState == iqs.shell.States.Add || this.currentState == iqs.shell.States.Edit ? null : this.currentState;
        let locationDate: string = this.$location.search()['retro_date'] ? this.$location.search()['retro_date'] : this.$location.search()['date'];
        this.date = locationDate ? locationDate : this.iqsOperationalEventRetrospectiveSaveService.timeShift ?
            this.iqsOperationalEventRetrospectiveSaveService.timeShift : new Date().toISOString();
    }

    private toMainFromDetails(): void {
        this.$location.search('details', 'main');
        this.details = false;
        this.appHeader();
    }

    private appHeader(): void {
        this.pipNavService.appbar.parts = { 'icon': true, 'actions': 'primary', 'menu': true, 'title': 'breadcrumb' };
        this.pipNavService.actions.hide();
        this.pipNavService.appbar.removeShadow();
        this.pipNavService.breadcrumb.breakpoint = 'gt-sm';
        this.pipNavService.breadcrumb.items = [
            <pip.nav.BreadcrumbItem>{ title: "RETROSPECTIVE", click: () => { this.$state.go("app.map"); } },
            <pip.nav.BreadcrumbItem>{ title: "RETROSPECTIVE_EVENTS", click: () => { } }
        ];
        this.pipNavService.actions.secondaryLocalActions = [];

        if (!this.pipMedia('gt-sm')) {
            if (this.details) {
                this.pipNavService.breadcrumb.items = [
                    <pip.nav.BreadcrumbItem>{ title: "MONITORING", click: () => { this.$state.go("app.map"); } },
                    <pip.nav.BreadcrumbItem>{
                        title: "MONITORING_EVENTS", click: () => {
                            this.toMainFromDetails();
                        }, subActions: []
                    },
                    <pip.nav.BreadcrumbItem>{
                        title: 'MONITORING_EVENTS_DETAILS', click: () => { }, subActions: []
                    }
                ];
                this.pipNavService.icon.showBack(() => {
                    this.toMainFromDetails();
                });
            } else {
                this.pipNavService.icon.showBack(() => {
                    this.$state.go("app.map");
                });
            }
        } else {
            this.pipNavService.icon.showMenu();
        }
    }

    public get collection(): iqs.shell.OperationalEvent[] {
        let collection = this.iqsRetrospectiveOperationalEventsViewModel.getCollection();
        return collection
    }

    public get state(): string {
        return this.iqsRetrospectiveOperationalEventsViewModel.state;
    }

    public get transaction(): pip.services.Transaction {
        return this.iqsRetrospectiveOperationalEventsViewModel.getTransaction();
    }

    public selectItem(index: number) {
        this.iqsRetrospectiveOperationalEventsViewModel.selectItem(index);
        if (!this.pipMedia('gt-sm')) {
            this.details = true;
            this.$location.search('details', 'details');
            this.appHeader();
        }
    }

    public get selectedItem(): iqs.shell.OperationalEvent {
        return this.iqsRetrospectiveOperationalEventsViewModel.getSelectedItem();
    }

    public get selectedIndex() {
        return this.iqsRetrospectiveOperationalEventsViewModel.selectedIndex;
    }

    public onMonitoring(): void {
        // this.$state.go('monitoring.events');
        window.location.href = window.location.origin + `/monitoring/#/app/events`;
    }

    public set selectedIndex(value: number) {
        //   this.iqsRetrospectiveOperationalEventsViewModel.selectedIndex = value;
    }

    public onReload() {
        this.iqsRetrospectiveOperationalEventsViewModel.isSort = false;
        this.iqsRetrospectiveOperationalEventsViewModel.filter = this.getTimeFilter(this.date);
        this.iqsRetrospectiveOperationalEventsViewModel.selectAllow = true;
        this.iqsRetrospectiveOperationalEventsViewModel.search = this.searchCriteria;
        // this.iqsRetrospectiveOperationalEventsViewModel.read(true, () => {
        this.iqsRetrospectiveOperationalEventsViewModel.reload(() => {
            this.defaultCollection = this.iqsRetrospectiveOperationalEventsViewModel.getDefaultCollection();
            let collection = this.collection;
            this.isSearch = false;
        });
    }

    public get searchedCollection(): string[] {
        return this.iqsRetrospectiveOperationalEventsViewModel.getSearchedCollection();
    }

    public onSearchResult(query: string) {
        this.searchCriteria = query ? query.toLocaleLowerCase() : query;
        this.$location.search('search', this.searchCriteria);
        this.isSearch = true;
        this.onReload();
    }

    public onCanselSearch() {
        this.onSearchResult('');
    }

    public changeExpand(index) {
        if (this.selectedIndex == index)
            this.expand = !this.expand;
        else {
            this.selectItem(index);
        }
    }

    public clearSearch() {
        this.onSearchResult('');
    }

    public onRetry() {
        this.$window.history.back();
    }

    public onHistory(): void {
        // this.$state.go('monitoring.events', { search: this.searchCriteria });
        window.location.href = window.location.origin + `/monitoring/#/app/events?search=${this.searchCriteria}`;
    }

    public isShowExpanded(item: iqs.shell.OperationalEvent): boolean {
        if (!item || !item.ref) return false;

        return (!!item.ref.latitude && !!item.ref.longitude) || !!item.ref.locationName || !!item.eventValue || !!item.ref.id
    }

    public changeDate(date: string) {
        this.date = date;
        // todo save to url
        this.$location.search('date', this.date);
        this.onReload();
    }

    public changePlay(play: boolean) {
        this.play = play;
    }
}

function configureEventsRetrospectiveRoute(
    $injector: angular.auto.IInjectorService,
    $stateProvider: pip.rest.IAuthStateService
) {
    "ngInject";

    $stateProvider
        .state(RetrospectiveEventsStateName, {
            url: '/events?search&event_id&date&details',
            auth: true,
            reloadOnSearch: false,
            views: {
                '@': {
                    controller: OperationalEventsRetrospectiveController,
                    controllerAs: '$ctrl',
                    templateUrl: "retrospective/events/OperationalEventsPage.html"
                }
            }
        })
}

function configureEventsRetrospectiveAccess(
    iqsAccessConfigProvider: iqs.shell.IAccessConfigProvider
) {
    "ngInject";

    let accessLevel: number = iqs.shell.AccessRole.user;
    let accessConfig: any = {
        delEvent: iqs.shell.AccessRole.admin,
        showEventMonitoring: iqs.shell.AccessRole.user,
    }

    iqsAccessConfigProvider.registerStateAccess(RetrospectiveEventsStateName, accessLevel);

    iqsAccessConfigProvider.registerStateConfigure(RetrospectiveEventsStateName, accessConfig);
}

(() => {

    angular
        .module('iqsRetrospective.Events', [
            'pipNav',
            'iqsRetrospective.EventSaveService',

            'iqsOperationalEventEmptyPanel',
            'iqsOperationalEventDetailsPanel',
            'iqsOperationalEventNewPanel',

            'iqsRetrospectiveOperationalEvents.ViewModel',
            'iqsTypeCollections.Service',
            'iqsObjectGroups.ViewModel',
            'iqsLocations.ViewModel',
            'iqsZones.ViewModel',
            'iqsObjects.ViewModel',
        ])
        .config(configureEventsRetrospectiveRoute)
        .config(configureEventsRetrospectiveAccess);

})();
