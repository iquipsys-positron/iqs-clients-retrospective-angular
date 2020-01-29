import { IRetrospectiveDataTimeDialogService } from './IRetrospectiveDataTimeDialogService';

class RetrospectiveDataTimeDialogService implements IRetrospectiveDataTimeDialogService {
    public _mdDialog: angular.material.IDialogService;
    public constructor($mdDialog: angular.material.IDialogService) {
        this._mdDialog = $mdDialog;
    }
    public show(params, successCallback?: (date: Date) => void, cancelCallback?: () => void) {
        this._mdDialog.show({
            targetEvent: params.event,
            templateUrl: 'retrospective/components/RetrospectiveDataTimeDialog.html',
            controller: 'iqsRetrospectiveDataTimeDialogController',
            controllerAs: '$ctrl',
            locals: { params: params },
            clickOutsideToClose: true
        })
            .then((callbackData: any) => {
                if (successCallback) {
                    successCallback(callbackData);
                }
            }, () => {
                if (cancelCallback) {
                    cancelCallback();
                }
            });

    }

}

function configTranslations(pipTranslateProvider: pip.services.ITranslateProvider) {
    pipTranslateProvider.translations('ru', {
        RETROSPECTIVE_DATE: 'Выбранная дата',
        RETROSPECTIVE_DATE_OUTSIDE_RANGE: 'больше текущей даты. Просмотр истории возможен только до текущей даты.',
        RETROSPECTIVE_END_HISTORY: 'Достигнут конец истории.'
    });

    pipTranslateProvider.translations('en', {
        RETROSPECTIVE_DATE: 'The selected date',
        RETROSPECTIVE_DATE_OUTSIDE_RANGE: 'is greater than the current date. Viewing history is possible only until the current date.',
        RETROSPECTIVE_END_HISTORY: 'The end of history is achieved.'
    });
}


angular
    .module('iqsRetrospectiveDataTimeDialog', [])
    .config(configTranslations)
    .service('iqsRetrospectiveDataTimeDialog', RetrospectiveDataTimeDialogService);