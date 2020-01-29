class OrganizationTimePanelController implements ng.IController {
    public time: string;
    private currDate: moment.Moment;
    private intervalPromise: any;
    private INTERVALL: number = 10000;
    private organizationOffset;
    private localOffset;

    constructor(
        private $element: JQuery,
        private $interval: ng.IIntervalService,
        private $rootScope: ng.IRootScopeService,
        private pipDateFormat: pip.dates.IDateFormatService,
        private pipMedia: pip.layouts.IMediaService,
        private iqsOrganization: iqs.shell.IOrganizationService

    ) {
        "ngInject";

        $element.addClass('iqs-organization-time-panel');
        let organizationTimezone = this.iqsOrganization.organization && this.iqsOrganization.organization.timezone ? this.iqsOrganization.organization.timezone : moment.tz.guess();
        this.localOffset = moment(new Date()).utcOffset();
        this.organizationOffset = moment(new Date()).tz(organizationTimezone).format('z') !== undefined ? moment(new Date()).tz(organizationTimezone).utcOffset() : this.localOffset;
        this.time = this.pipDateFormat.formatLongDateTime(moment().add((this.organizationOffset - this.localOffset), 'minutes').toDate());
        this.intervalPromise = this.$interval(() => {
            this.updateTime();
        }, this.INTERVALL);
    }

    public $onChanges(changes) {

    }

    public $onInit() {

    }

    public $onDestroy() {
        this.$interval.cancel(this.intervalPromise);
    }

    private updateTime() {
        this.time = this.pipDateFormat.formatLongDateTime(moment().add((this.organizationOffset - this.localOffset), 'minutes').toDate());
    }
}

(() => {
    angular
        .module('iqsOrganizationTimePanel', [])
        .component('iqsOrganizationTimePanel', {
            bindings: {},
            templateUrl: 'retrospective/map/panels/OrganizationTimePanel.html',
            controller: OrganizationTimePanelController,
            controllerAs: '$ctrl'
        })
})();