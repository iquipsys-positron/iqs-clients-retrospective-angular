class RetrospectiveDataTimeDialogController implements ng.IController {
    public $onInit() { }
    public date: Date;
    public theme: string;
    public dateChange: (date: Date) => void;
    constructor(
        public params: any,
        private $mdDialog: angular.material.IDialogService,
        private $location: ng.ILocationService,
        $rootScope
    ) {
        'ngInject';
        this.date = params.date;
        this.theme = $rootScope['$theme'];
        this.dateChange = (date: Date) => { this.onDateChange(date) };
    }

    public onClose(): void {
        this.$mdDialog.cancel();
    }

    public onItemClick() {
        this.$mdDialog.hide({ date: this.date });
    }

    public onDateChange(date: Date) {
        this.date = date;
        this.$location.search('retro_date', this.date.toISOString());
    }
}


const translateConfig = function (pipTranslateProvider) {
    // Set translation strings for the module
    pipTranslateProvider.translations('en', {
        'RETROSPECTIVE_DIALOG_TITLE': 'Set start time',
        'RETROSPECTIVE_DIALOG_DATE': 'Change date',
        CHANGE: 'Set',
        RETRO_TIME: 'Time',
        'RETRO_DATE': 'Date'
    });

    pipTranslateProvider.translations('ru', {
        'RETROSPECTIVE_DIALOG_TITLE': 'Установите начало просмотра',
        'RETROSPECTIVE_DIALOG_DATE': 'Выберите дату',
        CHANGE: 'Установить',
        RETRO_TIME: 'Время',
        RETRO_DATE: 'Дата'
    });
}


angular
    .module('iqsRetrospectiveDataTimeDialog')
    .config(translateConfig)
    .controller('iqsRetrospectiveDataTimeDialogController', RetrospectiveDataTimeDialogController);