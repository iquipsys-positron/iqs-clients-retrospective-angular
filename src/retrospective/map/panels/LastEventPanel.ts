interface ILastEventPanelBindings {
    [key: string]: any;

    state: any;
    date: any;
}

const LastEventPanelBindings: ILastEventPanelBindings = {
    // add operational event
    state: '<iqsState',
    date: '<?iqsDate'
}

class LastEventPanelChanges implements ng.IOnChangesObject, ILastEventPanelBindings {
    [key: string]: ng.IChangesObject<any>;

    state: ng.IChangesObject<any>;
    date: ng.IChangesObject<string>;
}

class LastEventPanelController implements ng.IController {
    public $onInit() { }
    private _lastEvents: iqs.shell.OperationalEvent[] = null;
    private intervalPromise: any;
    private intervalPromise2: any;
    private _currentIndex: number = 0;
    private _fadeOutClass: string = 'out';
    private _fadeClass: string = '.iqs-fade';
    private date: any;
    private firstLoaded: boolean = false;

    public state: string;
    public severityMedium: number = iqs.shell.Severity.Medium;
    public severityLow: number = iqs.shell.Severity.Low;
    public severityHigh: number = iqs.shell.Severity.High;
    private cf: Function[] = [];

    constructor(
        private $element: JQuery,
        private $location: ng.ILocationService,
        private $state: ng.ui.IStateService,
        private $interval: ng.IIntervalService,
        private $timeout: ng.ITimeoutService,
        private $rootScope: any,
        private iqsRetrospectiveOperationalEventsViewModel: iqs.shell.IOperationalEventsViewModel,
        private pipDateConvert: any,
        private iqsLoading: iqs.shell.ILoadingService
    ) {
        "ngInject";

        const runWhenReady = () => {
            this.$interval.cancel(this.intervalPromise);
            this.$interval.cancel(this.intervalPromise2);
            this.iqsRetrospectiveOperationalEventsViewModel.isSort = true;
            this.iqsRetrospectiveOperationalEventsViewModel.filter = this.getTimeFilter();
            this.iqsRetrospectiveOperationalEventsViewModel.search = null;
            this.iqsRetrospectiveOperationalEventsViewModel.reload(() => {
                this.firstLoaded = true;
                this.getLastEvents();
            });

            this.intervalPromise = $interval(() => {
                this.reRedEvent();
            }, 60000);

            this.intervalPromise2 = $interval(() => {
                this.changeEvent();
            }, 10000);
        };

        if (iqsLoading.isDone) { runWhenReady(); }

        this.cf.push($rootScope.$on(iqs.shell.LoadingCompleteEvent, runWhenReady.bind(this)));
    }

    private reRedEvent() {
        if (!this.iqsLoading.isDone) return;
        this.iqsRetrospectiveOperationalEventsViewModel.filter = this.getTimeFilter();
        this.iqsRetrospectiveOperationalEventsViewModel.search = null;
        this.iqsRetrospectiveOperationalEventsViewModel.isSort = true;
        this.iqsRetrospectiveOperationalEventsViewModel.reload(() => {
            this.getLastEvents();
        });
    }
    private getTimeFilter(): any {
        let timeFilter: any = {
            skip: 0,
            take: 20
        }

        return timeFilter;
    }

    public $onChanges(changes: LastEventPanelChanges): void {
        if (this.firstLoaded && this.date) {
            this.reRedEvent();
        }
    }

    public $onDestroy() {
        this.$interval.cancel(this.intervalPromise);
        this.$interval.cancel(this.intervalPromise2);
        for (const f of this.cf) { f(); }
    }

    public getLastEvents() {
        if (this.iqsRetrospectiveOperationalEventsViewModel.isSort) {
            this._lastEvents = _.take(this.iqsRetrospectiveOperationalEventsViewModel.getCollection(), 2);
        }
    }

    public goToEvents() {
        if (this._lastEvents && this._lastEvents.length > 0) {
            this.openEvent(this._lastEvents[0])
        } else {
            // this.$state.go(this.state || 'monitoring.events');
            if (this.state.startsWith('app')) {
                this.$state.go(this.state)
            } else {
                window.location.href = window.location.origin + `/monitoring/#/app/events`;
            }
        }
    }

    public goToEvent() {
        if (this._lastEvents && this.lastEvent) {
            this.openEvent(this.lastEvent)
        } else {
            // this.$state.go(this.state || 'monitoring.events');
            if (this.state.startsWith('app')) {
                this.$state.go(this.state)
            } else {
                window.location.href = window.location.origin + `/monitoring/#/app/events`;
            }
        }
    }

    private openEvent(event: iqs.shell.OperationalEvent): void {
        let nowDate = new Date();
        let eventDate = new Date(event.time);

        if (nowDate.getTime() - eventDate.getTime() < 24 * 60 * 60 * 1000) {
            // this.$state.go(this.state || 'monitoring.events', {
            //     retro_date: eventDate.toISOString(),
            //     event_id: event.id
            // });
            if (this.state.startsWith('app')) {
                this.$state.go(this.state, {
                    retro_date: eventDate.toISOString(),
                    event_id: event.id
                });
            } else {
                window.location.href = window.location.origin + `/monitoring/#/app/events?retro_date=${eventDate.toISOString()}&event_id=${event.id}`;
            }
        } else {
            this.$state.go('app.events', {
                retro_date: eventDate.toISOString(),
                event_id: event.id
            });
        }
    }

    public get lastEvent(): iqs.shell.OperationalEvent {
        if (this._lastEvents === null || this._lastEvents.length === 0) {
            return null;
        } else {
            return this._lastEvents[this._currentIndex];
        }
    }

    private changeEvent() {
        if (!this._lastEvents || this._lastEvents.length < 2) {
            return;
        }

        let maxIndex = Math.min(9, this._lastEvents.length - 1);

        this.$element.find(this._fadeClass).addClass(this._fadeOutClass);

        this.$timeout(() => {
            this._currentIndex = this._currentIndex === maxIndex ? 0 : this._currentIndex + 1;
            this.$element.find(this._fadeClass).removeClass(this._fadeOutClass);
        }, 500)
    }
}

(() => {
    angular
        .module('iqsLastEventPanel', [
            'iqsRetrospectiveOperationalEvents.ViewModel',
            'iqsOrganizations.Service'
        ])
        .component('iqsLastEventPanel', {
            bindings: LastEventPanelBindings,
            templateUrl: 'retrospective/map/panels/LastEventPanel.html',
            controller: LastEventPanelController,
            controllerAs: '$ctrl'
        })
})();
