import { IRetrospectiveDataTimeDialogService } from "./IRetrospectiveDataTimeDialogService";

interface IRetrospectiveDataTimePanelBindings {
    [key: string]: any;

    localDate: any;
    changeDate: any;
    class: any;
    changePlay: any;
    play: any;
}

const RetrospectiveDataTimePanelBindings: IRetrospectiveDataTimePanelBindings = {
    localDate: '<?iqsDate',
    changeDate: '&?iqsChange',
    class: '<?iqsClass',
    changePlay: '&?iqsChangePlay',
    play: '<?iqsPlay'
}

class RetrospectiveDataTimePanelChanges implements ng.IOnChangesObject, IRetrospectiveDataTimePanelBindings {
    [key: string]: ng.IChangesObject<any>;

    localDate: ng.IChangesObject<string>;
    class: ng.IChangesObject<string>;
    play: ng.IChangesObject<boolean>;
    changeDate: ng.IChangesObject<(string) => void>;
    changePlay: ng.IChangesObject<(boolean) => void>;
}

class RetrospectiveDataTimePanelController implements ng.IController {
    public minutes: number = 5;
    public minutesPlay: number = 1;
    public sec: number = 5;
    public date: Date;
    public localDate: string;
    public play: boolean = false;
    public changeDate: (string) => void;
    public changePlay: (boolean) => void;
    public class: string;

    public cleanUpFunc: Function;

    constructor(
        private iqsRetrospectiveDataTimeDialog: IRetrospectiveDataTimeDialogService,
        public pipMedia: pip.layouts.IMediaService,
        private pipTimer: pip.services.ITimerService,
        private pipDateFormat: pip.dates.IDateFormatService,
        private $location: ng.ILocationService,
        $scope: ng.IScope,
        private pipTranslate: pip.services.ITranslateService,
        private pipToasts: pip.controls.IToastService,
        $rootScope: ng.IRootScopeService,
        $interval: ng.IIntervalService
    ) {

        this.setRefreshTimer();
        this.cleanUpFunc = $rootScope.$on('iqsDateTime', () => {
            if (this.play) {
                let date = this.date;
                date.setMinutes(this.date.getMinutes() + this.minutesPlay);
                if (date.getTime() > new Date().getTime()) {
                    this.pipToasts.showNotification(this.pipTranslate.translate('RETROSPECTIVE_END_HISTORY'),
                        ['ok'], () => { }, () => { }, '');
                    this.play = false;
                    date = new Date();
                }
                this.date = date;
                this.localDate = this.date.toISOString();
                if (this.changeDate) {
                    this.$location.search('retro_date', this.localDate);
                    this.changeDate({ date: this.localDate });
                }
            }
        });
    }

    public $onDestroy() {
        this.pipTimer.removeEvent('iqsDateTime');
        if (angular.isFunction(this.cleanUpFunc)) {
            this.cleanUpFunc();
        }
    }

    public $onInit() {
        this.date = this.localDate ? new Date(Date.parse(this.localDate)) : new Date();
        this.localDate = this.date.toISOString();
    }

    private setRefreshTimer() {
        if (!this.pipTimer.isStarted()) {
            this.pipTimer.start();
        }

        this.pipTimer.removeEvent('iqsDateTime');
        this.pipTimer.addEvent('iqsDateTime', this.sec * 1000);
    }

    public playClick() {
        this.play = !this.play;
        if (this.changePlay) {
            this.$location.search('retro_date', this.localDate);
            this.changePlay({ play: this.play });
        }
    }

    public next() {
        let date = this.date;
        date.setMinutes(this.date.getMinutes() + this.minutes);
        if (date.getTime() > new Date().getTime()) {
            this.pipToasts.showNotification(this.pipTranslate.translate('RETROSPECTIVE_DATE') + ' ' +
                this.pipDateFormat.formatLongDateTime(date) + ' ' + this.pipTranslate.translate('RETROSPECTIVE_DATE_OUTSIDE_RANGE'),
                ['ok'], () => { }, () => { }, '');

            date = new Date();
        }

        // this.date.setMinutes(this.date.getMinutes() + 15);
        this.date = date;
        this.localDate = this.date.toISOString();
        if (this.changeDate) {
            this.$location.search('retro_date', this.localDate);
            this.changeDate({ date: this.localDate });
        }
    }

    public priv() {
        this.date.setMinutes(this.date.getMinutes() - this.minutes);//
        this.localDate = this.date.toISOString();
        if (this.changeDate) {
            this.$location.search('retro_date', this.localDate);
            this.changeDate({ date: this.localDate });
        }
    }

    public openDialog() {
        this.iqsRetrospectiveDataTimeDialog.show({ date: this.date }, (date: any) => {
            if (date.date.getTime() > new Date().getTime()) {
                this.pipToasts.showNotification(this.pipTranslate.translate('RETROSPECTIVE_DATE') + ' ' +
                    this.pipDateFormat.formatLongDateTime(date.date) + ' ' + this.pipTranslate.translate('RETROSPECTIVE_DATE_OUTSIDE_RANGE'),
                    ['ok'], () => { }, () => { }, '');

                this.date = new Date();
            } else {
                this.date = date.date;
            }

            this.localDate = this.date.toISOString();
            if (this.changeDate) {
                this.$location.search('retro_date', this.localDate);
                this.changeDate({ date: this.localDate });
            }
        })
    }

}

(() => {
    angular
        .module('iqsRetrospectiveDataTimePanel', ['iqsRetrospectiveDataTimeDialog', 'pipTimeAutocomplete'])
        .component('iqsRetrospectiveDataTimePanel', {
            bindings: RetrospectiveDataTimePanelBindings,
            templateUrl: 'retrospective/components/RetrospectiveDataTime.html',
            controller: RetrospectiveDataTimePanelController,
            controllerAs: '$ctrl'
        })

})();
