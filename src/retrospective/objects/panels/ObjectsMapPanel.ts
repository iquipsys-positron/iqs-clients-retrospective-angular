interface IRetrospectiveObjectsMapPanelBindings {
    [key: string]: any;
    object: any;
    type: any;
}

const RetrospectiveObjectsMapPanelBindings: IRetrospectiveObjectsMapPanelBindings = {
    object: '<?iqsObject',
    type: '<iqsType'
}

class RetrospectiveObjectsMapPanelChanges implements ng.IOnChangesObject, IRetrospectiveObjectsMapPanelBindings {
    [key: string]: ng.IChangesObject<any>;
    object: ng.IChangesObject<iqs.shell.ControlObject>;
    type: ng.IChangesObject<string>;
}

class RetrospectiveObjectsMapPanelController implements ng.IController {
    public $onInit() { }
    private center: any = {};

    public object: any;
    public type: string;
    public objects: any[];
    public startPause: boolean = true;
    public empty: boolean = false;

    public _configs: any = {
        map: {
            draggable: false,
            scrollwheel: false,
            disableDoubleClickZoom: true
        },
        zoom: 16,
        center: this.center
    }

    public zoneOptions: any = {
        fill: 'fill',
        stroke: 'stroke',
        radius: 'distance'
    };

    private _defaultIconTemplate: any = {
        path: 0,
        scale: 3,
        strokeWeight: 6,
        fillColor: '#fbd93e',
        strokeColor: '#fbd93e'
    };
    private cf: Function[] = [];

    constructor(
        $rootScope: ng.IRootScopeService,
        private iqsMapViewModel: iqs.shell.IMapViewModel,
        // private iqsCurrentObjectStatesViewModel: ICurrentObjectStatesViewModel,
        private iqsStatesViewModel: iqs.shell.IStatesViewModel,
        // private iqsObjectPositionsViewModel: IObjectPositionsViewModel,
        private iqsObjectRoutesViewModel: iqs.shell.IObjectRoutesViewModel,
        private $scope: ng.IScope,
        $element: JQuery,
        $timeout: ng.ITimeoutService,
        private iqsMapConfig: iqs.shell.IMapService,
        private iqsLoading: iqs.shell.ILoadingService
    ) {
        "ngInject";

        $element.addClass('flex layout-column layout-align-center-center');
        const runWhenReady = () => {
            let mapConfig: iqs.shell.MapConfigs = this.iqsMapConfig.get();
            this._configs.embededMap = mapConfig.embededMap;

            $timeout(() => {
                this.startPause = false;
            }, 100);
        };

        if (this.iqsLoading.isDone) { runWhenReady(); }
        this.cf.push($rootScope.$on(iqs.shell.LoadingCompleteEvent, runWhenReady.bind(this)));
    }

    public get configs() {
        return this._configs;
    }

    private focusObject(object) {
        if (!object || !object['pos'] || !object['pos'].coordinates) return;

        this.center.longitude = object['pos'].coordinates[0] || object.longitude;
        this.center.latitude = object['pos'].coordinates[1] || object.latitude;
    }

    public get polylineOptions(): any {
        return this.iqsMapViewModel.polylinesOptions;
    }

    public get dottraces() {
        return this.iqsObjectRoutesViewModel.objectPositions;
    }

    public get dottracePoints() {
        return this.iqsObjectRoutesViewModel.objectPoints;
    }

    public get polygons(): any[] {
        return this.iqsMapViewModel.polygons;
    }

    public get lines(): any[] {
        return this.iqsMapViewModel.lines;
    }

    public get circles(): any[] {
        return this.iqsMapViewModel.circles;
    }

    public $onChanges(changes: RetrospectiveObjectsMapPanelChanges) {
        // if (changes.object) {
        //     this.object = changes.object.currentValue;
        //     this.setEmptyState();
        //     this.objects = [changes.object.currentValue];
        //     this.focusObject(this.object);
        //     this.iqsCurrentObjectStatesViewModel.focusByDeviceId(this.object.device_id, false, true);
        //     if (changes.object && changes.object.currentValue && changes.object.currentValue.id != this.object.id) {
        //         ///update curr obj state
        //         this.iqsCurrentObjectStatesViewModel.updateStates(new Date().toISOString(),
        //             (data: any) => {
        //                 this.iqsCurrentObjectStatesViewModel.focusByDeviceId(this.object.device_id, false, true);
        //             });
        //     }
        // }
        if (changes.object) {
            this.iqsStatesViewModel.unfocusAll();
            this.object = changes.object.currentValue;
            if (this.object['options']) this.object['options'].visible = true;
            this.setEmptyState();
            this.focusObject(this.object);
            if (this.object.device_id) {
                this.iqsStatesViewModel.focusByDeviceId(this.object.device_id, false, true);
                this.object = this.iqsStatesViewModel.getStateByDeviceId(this.object.device_id);
                this.object.latitude = Number(this.object.latitude);
                this.object.longitude = Number(this.object.longitude);
            }
            this.objects = [this.object];
            if (changes.object && changes.object.currentValue && changes.object.currentValue.id != this.object.id) {
                ///update curr obj state
                if (this.object.device_id) {
                    this.iqsStatesViewModel.updateStates(new Date().toISOString(),
                        (data: any) => {
                            this.iqsStatesViewModel.focusByDeviceId(this.object.device_id, false, true);
                            this.object = this.iqsStatesViewModel.getStateByDeviceId(this.object.device_id);
                            this.object.latitude = Number(this.object.latitude);
                            this.object.longitude = Number(this.object.longitude);
                            this.objects = [this.object];
                        });
                }
            }
        }
    }

    public $onDestroy() {
        this.iqsObjectRoutesViewModel.unfocus();
        this.iqsMapViewModel.unfocusAll();
        for (const f of this.cf) { f(); }
    }

    private setEmptyState() {
        this.empty = !this.object || !this.object['pos'] || this.object['pos'].coordinates[0] === null || this.object['pos'].coordinates[1] === null
            || this.object['pos'].coordinates[0] === undefined || this.object['pos'].coordinates[1] === undefined;
    }

}

(() => {
    angular
        .module('iqsRetrospectiveObjectsMapPanel', [
            'iqsMap.ViewModel',
            'iqsStates.ViewModel',
            'iqsObjectRoutes.ViewModel',
            'iqsMapConfig',
        ])
        .component('iqsRetrospectiveObjectsMapPanel', {
            bindings: RetrospectiveObjectsMapPanelBindings,
            templateUrl: 'retrospective/objects/panels/ObjectsMapPanel.html',
            controller: RetrospectiveObjectsMapPanelController,
            controllerAs: '$ctrl'
        })

})();
