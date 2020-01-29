interface IRetrospectiveObjectsEventsPanelBindings {
    [key: string]: any;
    object: any;
    count: any;
}

const RetrospectiveObjectsEventsPanelBindings: IRetrospectiveObjectsEventsPanelBindings = {
    object: '<iqsObject',
    count: '<?iqsCount'
}

class RetrospectiveObjectsEventsPanelChanges implements ng.IOnChangesObject, IRetrospectiveObjectsEventsPanelBindings {
    [key: string]: ng.IChangesObject<any>;
    object: ng.IChangesObject<iqs.shell.ControlObject>;
    count: ng.IChangesObject<number>;
}

class RetrospectiveObjectsEventsPanelController implements ng.IController {
    public $onInit() { }
    public object: iqs.shell.ControlObject;
    public count: number;
    public events: iqs.shell.OperationalEvent[];
    private cf: Function[] = [];

    constructor(
        $rootScope: ng.IRootScopeService,
        private iqsOperationalEventsViewModel: iqs.shell.IOperationalEventsViewModel,
        private iqsLoading: iqs.shell.ILoadingService
    ) {
        "ngInject";

        if (this.iqsLoading.isDone) { this.readEvents(); }
        this.cf.push($rootScope.$on(iqs.shell.LoadingCompleteEvent, this.readEvents.bind(this)));
    }

    public $onDestroy() {
        for (const f of this.cf) { f(); }
    }

    public readEvents() {
        if (!this.iqsLoading.isDone) return;
        this.iqsOperationalEventsViewModel.filter = {
            object_id: this.object.id
        };
        this.iqsOperationalEventsViewModel.read(false, (events: iqs.shell.OperationalEvent[]) => {
            this.events = events;
        });
    }
}

(() => {
    angular
        .module('iqsRetrospectiveObjectsEventsPanel', [
            'IOperationalEvent.sViewModel'
        ])
        .component('iqsRetrospectiveObjectsEventsPanel', {
            bindings: RetrospectiveObjectsEventsPanelBindings,
            templateUrl: 'retrospective/objects/panels/ObjectsEventsPanel.html',
            controller: RetrospectiveObjectsEventsPanelController,
            controllerAs: '$ctrl'
        })

})();
