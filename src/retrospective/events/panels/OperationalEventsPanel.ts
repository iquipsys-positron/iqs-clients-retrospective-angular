class AddOperationalEventResult {
    public item: iqs.shell.OperationalEvent;
}

interface IOperationalEventPanelBindings {
    [key: string]: any;

    onEventNew: any;
    onEventDelete: any;
    startDate: any;
    ngDisabled: any;
    // filtered by objectId
    objectId: any;
}

const OperationalEventPanelBindings: IOperationalEventPanelBindings = {
    // add operational event
    onEventNew: '&iqsNew',
    onEventDelete: '&iqsDelete',
    startDate: '<?iqsDate',
    ngDisabled: '<?',
    objectId: '<?iqsObjectId'
}

class OperationalEventPanelChanges implements ng.IOnChangesObject, IOperationalEventPanelBindings {
    [key: string]: ng.IChangesObject<any>;

    onEventNew: ng.IChangesObject<() => ng.IPromise<void>>;
    onEventDelete: ng.IChangesObject<() => ng.IPromise<void>>;
    startDate: ng.IChangesObject<string>;
    ngDisabled: ng.IChangesObject<boolean>;
    objectId: ng.IChangesObject<string>;
}

class OperationalEventPanelController implements ng.IController {
    public $onInit() { }

    public severityMedium: number = iqs.shell.Severity.Medium;
    public severityLow: number = iqs.shell.Severity.Low;;
    public severityHigh: number = iqs.shell.Severity.High;

    public onEventNew: () => void;
    public ngDisabled: boolean;
    public startDate: string;
    public objectId: string;
    public onEventDelete: (operationalEvent: AddOperationalEventResult) => void;
    public eventCollection: iqs.shell.OperationalEvent[];

    private localFilter: iqs.shell.AssocietedObject = null;
    private cf: Function[] = [];

    constructor(
        private $element: JQuery,
        private $location: ng.ILocationService,
        private $state: ng.ui.IStateService,
        public pipMedia: pip.layouts.IMediaService,
        private pipDateConvert: pip.dates.IDateConvertService,
        // private iqsRetrospectiveOperationalEventsViewModel: IOperationalEventViewModel,
        private iqsRetrospectiveOperationalEventsViewModel: iqs.shell.IOperationalEventsViewModel,
        private $rootScope: ng.IRootScopeService,
        private iqsObjectStatesViewModel: iqs.shell.IObjectStatesViewModel,
        private iqsLoading: iqs.shell.ILoadingService
    ) {
        $element.addClass('iqs-operational-event-panel');

        this.cf.push($rootScope.$on('pipAutoPullChanges', () => {
            if (!this.transaction.busy()) {
                this.onReload();
            }
        }));
        if (this.iqsLoading.isDone) { this.onReload(); }
        this.cf.push($rootScope.$on(iqs.shell.LoadingCompleteEvent, this.onReload.bind(this)));
    }

    private setTimeFilter(date: string): any {
        if (!this.localFilter) {
            this.localFilter = {};
        }

        let nowDate: Date = date ? moment(date).toDate() : new Date();
        let prevDate = this.pipDateConvert.addHours(nowDate, -24);
        this.localFilter.to_time = nowDate.toISOString();
        this.localFilter.from_time = prevDate.toISOString();
    }

    public $onDestroy() {
        for (const f of this.cf) { f(); }
    }

    public openRetrospective(item: iqs.shell.OperationalEvent) {
        if (item && item.object_id) {
            this.iqsObjectStatesViewModel.clean();
            let date = item.time ? moment(item.time).add('seconds', 1).toDate().toISOString() : '';
            this.$state.go('app.map', { focus_object_id: item.object_id, retro_date: date }, { reload: true });
        }
    }

    public $onChanges(changes: OperationalEventPanelChanges): void {
        let change: boolean = false;
        if (changes.objectId) {
            if (this.objectId != changes.objectId.previousValue) {
                change = true;
            }
        }

        if (changes.startDate) {
            if (this.startDate != changes.startDate.previousValue) {
                change = true;
            }
        }

        if (change) {
            this.onReload();
        }
    }

    private setFilterObject(): any {
        if (!this.localFilter) {
            this.localFilter = {};
        }

        if (this.objectId) {
            this.localFilter.object_id = this.objectId;
        }
    }

    public get collection(): iqs.shell.OperationalEvent[] {
        let collection = this.iqsRetrospectiveOperationalEventsViewModel.getCollection();
        return collection;
    }

    public get state(): string {
        return this.iqsRetrospectiveOperationalEventsViewModel.state;
    }

    public get transaction(): pip.services.Transaction {
        return this.iqsRetrospectiveOperationalEventsViewModel.getTransaction();
    }

    public onReload() {
        this.setTimeFilter(this.startDate);
        this.setFilterObject();

        this.iqsRetrospectiveOperationalEventsViewModel.filter = this.localFilter;
        this.iqsRetrospectiveOperationalEventsViewModel.isSort = true;
        this.iqsRetrospectiveOperationalEventsViewModel.search = null;
        this.iqsRetrospectiveOperationalEventsViewModel.reload();
    }

}

(() => {
    angular
        .module('iqsOperationalEventPanel', [
            'iqsRetrospectiveOperationalEvents.ViewModel',
            'iqsObjectStates.ViewModel',
        ])
        .component('iqsOperationalEventPanel', {
            bindings: OperationalEventPanelBindings,
            templateUrl: 'retrospective/events/panels/OperationalEventsPanel.html',
            controller: OperationalEventPanelController,
            controllerAs: '$ctrl'
        })
})();
