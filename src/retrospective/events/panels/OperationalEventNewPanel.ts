import { NewOperationalEvent } from '../NewOperationalEvent';

class OperationalEventParams {
    public item: NewOperationalEvent;
}

class SelectCollectionItem {
    public id: string;
    public name: string;
    public type: string;
    public icon: string;
}

class SelectCollectionTypes {
    public static ControlObject: string = 'control-objects';
    public static ObjectGroup: string = 'object-group';
    public static Zone: string = 'zone';
    public static Location: string = 'location';
}

class SelectCollectionIcons {
    public static ControlObject: string = 'iqs:object';
    public static ObjectGroup: string = 'iqs:team';
    public static Zone: string = 'iqs:zone';
    public static Location: string = 'iqs:location-1';
}

interface IOperationalEventNewPanelBindings {
    [key: string]: any;

    onOperationalEventSave: any;
    onOperationalEventCancel: any;
    eventTemplate: any;
    newItem: any;
    ngDisabled: any;
}

const OperationalEventNewPanelBindings: IOperationalEventNewPanelBindings = {
    onOperationalEventSave: '&iqsSave',
    onOperationalEventCancel: '&iqsCancel',
    eventTemplate: '=?iqsEventTemplate',
    newItem: '=?iqsNewItem',
    ngDisabled: '&?'
}

class OperationalEventNewPanelChanges implements ng.IOnChangesObject, IOperationalEventNewPanelBindings {
    [key: string]: ng.IChangesObject<any>;

    onOperationalEventSave: ng.IChangesObject<() => ng.IPromise<void>>;
    onOperationalEventCancel: ng.IChangesObject<() => ng.IPromise<void>>;
    eventTemplate: ng.IChangesObject<iqs.shell.EventTemplate>;
    newItem: ng.IChangesObject<NewOperationalEvent>;
    ngDisabled: ng.IChangesObject<() => ng.IPromise<void>>;
}

class OperationalEventNewPanelController implements ng.IController {
    public $onInit() { }
    public newOperationalEvent: NewOperationalEvent;
    public eventTemplate: iqs.shell.EventTemplate;

    public newItem: NewOperationalEvent;
    public onOperationalEventSave: (eventTempl: OperationalEventParams) => void;
    public onOperationalEventCancel: () => void;
    public ngDisabled: () => boolean;
    public onDateChange: (date: Date) => void;

    public error: string = '';
    public LocationsCollection: SelectCollectionItem[];
    public ObjectsCollection: SelectCollectionItem[];
    public severityCollection: iqs.shell.TypeNumericCollection;
    public objectTypeCollection: iqs.shell.TypeCollection;

    public isSetTime: boolean = true;
    public isSetObject: boolean = true;
    public isSetPos: boolean = true;
    public form: any;
    public touchedErrorsWithHint: Function;
    private cf: Function[] = [];

    constructor(
        $rootScope: ng.IRootScopeService,
        private $element: JQuery,
        private $state: ng.ui.IStateService,
        private $scope: ng.IScope,
        public pipMedia: pip.layouts.IMediaService,
        private pipFormErrors: pip.errors.IFormErrorsService,
        private iqsTypeCollectionsService: iqs.shell.ITypeCollectionsService,
        private iqsObjectGroupsViewModel: iqs.shell.IObjectGroupsViewModel,
        private iqsLocationsViewModel: iqs.shell.ILocationsViewModel,
        private iqsZonesViewModel: iqs.shell.IZonesViewModel,
        private iqsObjectsViewModel: iqs.shell.IObjectsViewModel,
        private iqsLoading: iqs.shell.ILoadingService
    ) {
        "ngInject";

        $element.addClass('iqs-operational-event-new-panel');
        const runWhenReady = () => {
            this.severityCollection = this.iqsTypeCollectionsService.getSeverity();
            this.touchedErrorsWithHint = pipFormErrors.touchedErrorsWithHint;
            this.onDateChange = (time: Date) => {
                if (time) {
                    this.newOperationalEvent.time = time;
                }
                this.error = null;
            }

            this.LocationsCollection = this.initLocationCollections();
            this.ObjectsCollection = this.initObjectCollections();
            this.severityCollection = this.iqsTypeCollectionsService.getSeverity();
            this.objectTypeCollection = this.iqsTypeCollectionsService.getObjectType();

            this.init();
        }
        if (this.iqsLoading.isDone) { runWhenReady(); }
        this.cf.push($rootScope.$on(iqs.shell.LoadingCompleteEvent, runWhenReady.bind(this)));
    }

    public $onDestroy() {
        for (const f of this.cf) { f(); }
    }

    public $onChanges(changes: OperationalEventNewPanelChanges): void {
        this.init();
    }

    public $postLink() {
        this.form = this.$scope.form;
    }

    private getTime(): Date {
        let nowDate: Date = new Date();
        nowDate.setSeconds(0);
        nowDate.setMilliseconds(0);

        return nowDate;
    }

    private initEventTemplate(eventTemplate: iqs.shell.EventTemplate) {
        this.newOperationalEvent.time = this.getTime();
        this.newOperationalEvent.date = new Date();
        if (eventTemplate) {
            this.newOperationalEvent.description = eventTemplate.description;
            this.newOperationalEvent.severity = eventTemplate.severity;

            this.isSetTime = eventTemplate.set_time;
            this.isSetObject = eventTemplate.set_object;
            this.isSetPos = eventTemplate.set_pos;
        } else {
            this.isSetTime = true;
            this.isSetObject = true;
            this.isSetPos = true;
        }

        if (!this.isSetObject) {
            this.newOperationalEvent.objectGroupId = null;
        }
        if (!this.isSetPos) {
            this.newOperationalEvent.locationZoneId = null;
        }
    }

    private init() {
        if (!this.iqsLoading.isDone) return;
        this.newOperationalEvent = _.cloneDeep(this.newItem);
        this.initEventTemplate(this.eventTemplate);
    }

    private initObjectCollections(): SelectCollectionItem[] {
        let collection: SelectCollectionItem[] = [];
        _.each(this.iqsObjectsViewModel.allObjects, function (item: iqs.shell.ControlObject) {
            collection.push({
                id: item.id,
                name: item.name,
                type: SelectCollectionTypes.ControlObject,
                icon: SelectCollectionIcons.ControlObject
            });
        });

        _.each(this.iqsObjectGroupsViewModel.getCollection(), function (item: iqs.shell.ObjectGroup) {
            collection.push({
                id: item.id,
                name: item.name,
                type: SelectCollectionTypes.ObjectGroup,
                icon: SelectCollectionIcons.ObjectGroup
            });
        });
        collection = _.sortBy(collection, function (item: SelectCollectionItem) {
            return item.name;
        });

        return collection;
    }

    private initLocationCollections(): SelectCollectionItem[] {
        let collection: SelectCollectionItem[] = [];
        _.each(this.iqsZonesViewModel.zones, function (item: iqs.shell.Zone) {
            collection.push({
                id: item.id,
                name: item.name,
                type: SelectCollectionTypes.Zone,
                icon: SelectCollectionIcons.Zone
            });
        });

        _.each(this.iqsLocationsViewModel.getCollection(), function (item: iqs.shell.Location) {
            collection.push({
                id: item.id,
                name: item.name,
                type: SelectCollectionTypes.Location,
                icon: SelectCollectionIcons.Location
            });
        });
        collection = _.sortBy(collection, function (item: SelectCollectionItem) {
            return item.name;
        });

        return collection;
    }

    private getId(id: string, collection: SelectCollectionItem[], type: string): string {
        let index = _.findIndex(collection, function (item: SelectCollectionItem) {
            return item.id == id && item.type == type;
        })

        return index > -1 ? collection[index].id : null;
    }

    private getDate(date: Date, time: Date): Date {
        let evTime: Date = time ? time : new Date();
        let evDate: Date = date ? date : new Date();
        let evDateTime = new Date(evDate.getFullYear(), evDate.getMonth(), evDate.getDate(), evTime.getHours(), evTime.getMinutes());
        let utcTime: moment.Moment;

        utcTime = moment(evDateTime).utc();

        return utcTime.toDate();
    }

    private getOperationalEvent() {
        let operationalEvent: iqs.shell.OperationalEvent = new iqs.shell.OperationalEvent();
        operationalEvent = {
            type: iqs.shell.OperationalEventType.ManualRecord,
            severity: this.newOperationalEvent.severity,
            time: this.getDate(this.newOperationalEvent.date, this.newOperationalEvent.time).toISOString(),
            group_id: this.getId(this.newOperationalEvent.objectGroupId, this.ObjectsCollection, SelectCollectionTypes.ObjectGroup),
            object_id: this.getId(this.newOperationalEvent.objectGroupId, this.ObjectsCollection, SelectCollectionTypes.ControlObject),
            loc_id: this.getId(this.newOperationalEvent.locationZoneId, this.LocationsCollection, SelectCollectionTypes.Location),
            zone_id: this.getId(this.newOperationalEvent.locationZoneId, this.LocationsCollection, SelectCollectionTypes.Zone),
            description: this.newOperationalEvent.description
        };

        return operationalEvent;
    }

    public clearLocation() {
        this.newOperationalEvent.locationZoneId = null;
    }

    public clearObject() {
        this.newOperationalEvent.objectGroupId = null;
    }

    private checkDate() {
        let date: Date = this.getDate(this.newOperationalEvent.date, this.newOperationalEvent.time);
        let currDate = new Date();

        this.error = date.getTime() > currDate.getTime() ? 'OPERATIONAL_EVENT_DATE_FUTURE_ERROR' : null;
    }

    public onSaveClick(): void {
        this.checkDate();
        if (this.form.$invalid || this.error) {
            this.pipFormErrors.resetFormErrors(this.form, true);

            return;
        }

        if (this.onOperationalEventSave) {
            this.onOperationalEventSave({ item: this.newOperationalEvent });
            this.pipFormErrors.resetFormErrors(this.form, false);
        }
    }

    public onCancelClick(): void {
        if (this.onOperationalEventCancel) {
            this.onOperationalEventCancel();
        }
    }
}

(() => {
    angular
        .module('iqsOperationalEventNewPanel', [
            'iqsTypeCollections.Service',
            'iqsObjectGroups.ViewModel',
            'iqsLocations.ViewModel',
            'iqsZones.ViewModel',
            'iqsObjects.ViewModel'
        ])
        .component('iqsOperationalEventNewPanel', {
            bindings: OperationalEventNewPanelBindings,
            templateUrl: 'retrospective/events/panels/OperationalEventNewPanel.html',
            controller: OperationalEventNewPanelController,
            controllerAs: '$ctrl'
        })
})();
