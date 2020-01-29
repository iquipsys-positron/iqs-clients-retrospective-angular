{
    function declareRetrospectiveStrings(pipTranslateProvider: pip.services.ITranslateProvider) {
        pipTranslateProvider.translations('en', {
            EVENTS: 'Events',
            INFORMATION: 'Information',
            LOADING_OBJECTS: 'Loading objects',
            RETROSPECTIVE: 'Retrospective',
            'Param #': 'Param #',
            ZONE_INCLUDE_RULES_LABEL: 'Rules apply',
            ZONE_INCLUDE_RULES_EMPTY_LABEL: 'There are no rules to apply',
            ZONE_EXCLUDE_RULES_LABEL: 'Exclude from rules',
            ZONE_EXCLUDE_RULES_EMPTY_LABEL: 'The are no exclusions',
            PARKING_TIME: 'Parking time',
            STOPING_TIME: 'Stoping time',
        });
        pipTranslateProvider.translations('ru', {
            EVENTS: 'События',
            INFORMATION: 'Информация',
            LOADING_OBJECTS: 'Загрузка объектов',
            RETROSPECTIVE: 'Ретроспектива',
            'Param #': 'Параметр №',
            ZONE_INCLUDE_RULES_LABEL: 'Применяются правила',
            ZONE_INCLUDE_RULES_EMPTY_LABEL: 'Применяемые правила не заданы',
            ZONE_EXCLUDE_RULES_LABEL: 'Исключается из правил',
            ZONE_EXCLUDE_RULES_EMPTY_LABEL: 'Нет исключений',
            PARKING_TIME: 'Время стоянки',
            STOPING_TIME: 'Время отстановки',
        });
    }

    angular
        .module('iqsRetrospective')
        .config(declareRetrospectiveStrings);
}