declare let google: any;

interface IOperationalEventDetailsPanelBindings {
    [key: string]: any;

    event: any;
    state: any;
    ngDisabled: any;
}

const OperationalEventDetailsPanelBindings: IOperationalEventDetailsPanelBindings = {
    event: '<?iqsEventItem',
    state: '<?iqsState',
    ngDisabled: '&?'
}

class OperationalEventDetailsPanelChanges implements ng.IOnChangesObject, IOperationalEventDetailsPanelBindings {
    [key: string]: ng.IChangesObject<any>;

    event: ng.IChangesObject<iqs.shell.OperationalEvent>;
    state: ng.IChangesObject<string>;
    ngDisabled: ng.IChangesObject<() => ng.IPromise<void>>;
}

class OperationalEventDetailsPanelController implements ng.IController {
    public $onInit() { }
    public accessConfig: any;
    public event: iqs.shell.OperationalEvent;
    public ngDisabled: () => boolean;
    public state: string;
    public severityMedium: number = iqs.shell.Severity.Medium;
    public severityLow: number = iqs.shell.Severity.Low;
    public severityHigh: number = iqs.shell.Severity.High;
    public rebuild: boolean = false;
    private cf: Function[] = [];

    constructor(
        $rootScope: ng.IRootScopeService,
        private $element: JQuery,
        private $state: ng.ui.IStateService,
        private $timeout: ng.ITimeoutService,
        public pipMedia: pip.layouts.IMediaService,
        private iqsAccessConfig: iqs.shell.IAccessConfigService,
        private iqsObjectStatesViewModel: iqs.shell.IObjectStatesViewModel,
        private iqsOperationalEventsViewModel: iqs.shell.IOperationalEventsViewModel,
        private iqsLoading: iqs.shell.ILoadingService
    ) {
        "ngInject";

        $element.addClass('iqs-operational-event-details-panel');
        if (this.iqsLoading.isDone) { this.accessConfig = iqsAccessConfig.getStateConfigure().access; }
        this.cf.push($rootScope.$on(iqs.shell.LoadingCompleteEvent, () => { this.accessConfig = iqsAccessConfig.getStateConfigure().access; }));
    }

    public $onDestroy() {
        for (const f of this.cf) { f(); }
    }

    public $onChanges(changes: OperationalEventDetailsPanelChanges): void {
        if (this.event) {
            this.iqsOperationalEventsViewModel.referenceDetails(this.event);
        }
    }

    public openRetrospective(item: iqs.shell.OperationalEvent) {
        if (item && item.object_id) {
            this.iqsObjectStatesViewModel.clean();
            let date = item.time ? moment(item.time).add('seconds', 1).toDate().toISOString() : '';
            this.$state.go('app.map', { focus_object_id: item.object_id, retro_date: date }, { reload: true });
            // window.location.href = window.location.origin + `/retrospective/#/retrospective/map?focus_object_id=${item.object_id}&retro_date=${date}`;
        }
    }
}

(() => {
    angular
        .module('iqsOperationalEventDetailsPanel', [
            'iqsAccessConfig',
            'iqsIncidents.Panel.Map',
            'iqsObjectStates.ViewModel',
            'iqsOperationalEvents.ViewModel'
        ])
        .component('iqsOperationalEventDetailsPanel', {
            bindings: OperationalEventDetailsPanelBindings,
            templateUrl: 'retrospective/events/panels/OperationalEventDetailsPanel.html',
            controller: OperationalEventDetailsPanelController,
            controllerAs: '$ctrl'
        })
})();
