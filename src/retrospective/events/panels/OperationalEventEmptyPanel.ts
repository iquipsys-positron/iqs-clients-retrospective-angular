interface IOperationalEventEmptyPanelBindings {
    [key: string]: any;

    onOperationalEventAdd: any;
    state: any,
    isHistory: any;
    ngDisabled: any;
}

const OperationalEventEmptyPanelBindings: IOperationalEventEmptyPanelBindings = {
    // change operational event
    onOperationalEventAdd: '&iqsAdd',
    state: '<?iqsState',
    isHistory: '<?iqsHistory',
    ngDisabled: '&?'
}

class OperationalEventEmptyPanelChanges implements ng.IOnChangesObject, IOperationalEventEmptyPanelBindings {
    [key: string]: ng.IChangesObject<any>;

    onOperationalEventAdd: ng.IChangesObject<() => ng.IPromise<void>>;
    state: ng.IChangesObject<string>;
    isHistory: ng.IChangesObject<boolean>;
    ngDisabled: ng.IChangesObject<() => ng.IPromise<void>>;
}

class OperationalEventEmptyPanelController implements ng.IController {          public $onInit() {}
    public onOperationalEventAdd: () => void;
    public state: string;
    public isHistory: boolean;
    public accessConfig: any;
    public ngDisabled: () => boolean;
    private cf: Function[] = [];

    constructor(
        $rootScope: ng.IRootScopeService,
        private $element: JQuery,
        private $state: ng.ui.IStateService,
        public pipMedia: pip.layouts.IMediaService,
        private iqsAccessConfig: iqs.shell.IAccessConfigService,
        private iqsLoading: iqs.shell.ILoadingService
    ) {
        "ngInject";
        
        $element.addClass('iqs-operational-event-empty-panel');
        if (this.iqsLoading.isDone) { this.accessConfig = iqsAccessConfig.getStateConfigure().access; }
        this.cf.push($rootScope.$on(iqs.shell.LoadingCompleteEvent, () => { this.accessConfig = iqsAccessConfig.getStateConfigure().access; }));
    }

    public $onDestroy() {
        for (const f of this.cf) { f(); }
    }

    public onAdd(): void {
        if (this.onOperationalEventAdd) {
            this.onOperationalEventAdd();
        }
    }
}

(() => {
    angular
        .module('iqsOperationalEventEmptyPanel', ['iqsAccessConfig'])
        .component('iqsOperationalEventEmptyPanel', {
            bindings: OperationalEventEmptyPanelBindings,
            templateUrl: 'retrospective/events/panels/OperationalEventEmptyPanel.html',
            controller: OperationalEventEmptyPanelController,
            controllerAs: '$ctrl'
        })
})();
