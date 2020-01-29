
{
    function declareRetrospectiveEventTranslateResources(pipTranslateProvider: pip.services.ITranslateProvider) {
        pipTranslateProvider.translations('en', {
            RETROSPECTIVE_EVENTS: 'Events',
            EVENT_SHOW_MONITORING: 'Show current events',
            EVENT_MANUAL_IMPUT: 'Manual event entry',
            EVENT_TEMPLATES_EDIT: 'Edit templates',
            EVENT_ADD_DIALOG_TITLE: 'Add event',
            EVENT_ADD_AUTO_DIALOG_TITLE: 'Add from template',
            EVENT_OPERATIONAL_LABEL: 'Event description',
            EVENT_DATE_LABEL: 'Date',
            EVENT_TIME_LABEL: 'Time',
            EVENT_OBJECTS_GROUP_LABEL: 'Related to group or object',
            EVENT_LOCATION_ZONE_LABEL: 'Near zone or location',
            EVENT_ADD_BUTTON: 'Save',
            EVENT_CANCEL_BUTTON: 'Cancel',
            EVENT_SHOW_RETROSPECTIVE: 'View history ',
            EVENT_DATA_EMPTY: 'Events were not found',
            EVENT_DATA_RELOAD: 'Reload events',
            EVENT_ADD_EMPTY_BUTTON: 'Add event manualy',
            EVENT_DATA_LOADING: 'Loading events',
            OPERATIONAL_EVENT_EXPECTED: 'Limit',
            OPERATIONAL_EVENT_NEW: 'New event',
            MONITORING_EVENTS: 'Events',
            OPERATIONAL_EVENT_ADD_TEMPLETE: 'Add template',
            OPERATIONAL_EVENT_ADD: 'Add event',
            OPERATIONAL_EVENT_CLEAR_SEARCH: 'Clear search',
            OPERATIONAL_EVENT_EMPTY_TITLE: 'Recent events were not found',
            OPERATIONAL_EVENT_EMPTY_SUBTITLE: '',
            OPERATIONAL_EVENT_LOADING: 'Loading events',
            OPERATIONAL_EVENT_SEARCH: 'Search event',
            OPERATIONAL_EVENT_TEMPLATE_EMPTY: 'There are no event templates',
            OPERATIONAL_EVENT_SEVERITY_LABEL: 'Importance',
            OPERATIONAL_EVENT_EMPTY_LABEL: 'The event has no additional information',
            OPERATIONAL_EVENT: 'Event',
            OPERATIONAL_EVENT_ADD_TO_HISTORY: 'was added to the history',
            MONITORING_EVENTS_DETAILS: 'Event details',
            EVENT_OPERATIONAL_DESCRIPTION_REQUIRED_ERROR: 'Event description is required',
            EVENT_OPERATIONAL_DATE_REQUIRED_ERROR: 'Date is required',
            OPERATIONAL_EVENT_DATE_FUTURE_ERROR: 'The date of the event can not be greater than the current date'

        });
        pipTranslateProvider.translations('ru', {
            RETROSPECTIVE_EVENTS: 'События',
            EVENT_SHOW_MONITORING: 'Отобразить текущие события',
            EVENT_MANUAL_IMPUT: 'Ручной ввод события',
            EVENT_TEMPLATES_EDIT: 'Редактирование шаблонов',
            EVENT_ADD_DIALOG_TITLE: 'Добавить событие',
            EVENT_ADD_AUTO_DIALOG_TITLE: 'Добавить из шаблона',
            EVENT_OPERATIONAL_LABEL: 'Описание события',
            EVENT_DATE_LABEL: 'Дата',
            EVENT_TIME_LABEL: 'Время',
            EVENT_OBJECTS_GROUP_LABEL: 'Относится к группе или объекту',
            EVENT_LOCATION_ZONE_LABEL: 'Недалеко от зоны или места',
            EVENT_ADD_BUTTON: 'Сохранить',
            EVENT_CANCEL_BUTTON: 'Отменить',
            EVENT_SHOW_RETROSPECTIVE: 'Посмотреть историю',
            EVENT_DATA_EMPTY: 'События не найдены',
            EVENT_DATA_RELOAD: 'Перечитать события',
            EVENT_ADD_EMPTY_BUTTON: 'Добавить событие вручною',
            EVENT_DATA_LOADING: 'События загружаются ',
            OPERATIONAL_EVENT_EXPECTED: 'Ограничение',
            OPERATIONAL_EVENT_NEW: 'Новое событие',
            MONITORING_EVENTS: 'События',
            OPERATIONAL_EVENT_ADD_TEMPLETE: 'Добавить шаблон',
            OPERATIONAL_EVENT_ADD: 'Добавить событие',
            OPERATIONAL_EVENT_CLEAR_SEARCH: 'Очистить условия поиска',
            OPERATIONAL_EVENT_EMPTY_TITLE: 'Событий на текущий период не найдено',
            OPERATIONAL_EVENT_EMPTY_SUBTITLE: '',
            OPERATIONAL_EVENT_LOADING: 'Загрузка событий',
            OPERATIONAL_EVENT_SEARCH: 'Найти событие',
            OPERATIONAL_EVENT_TEMPLATE_EMPTY: 'Нет шаблонов событий',
            OPERATIONAL_EVENT_SEVERITY_LABEL: 'Важность',
            OPERATIONAL_EVENT_EMPTY_LABEL: 'Событие не имеет дополнительной информации',
            OPERATIONAL_EVENT: 'Событие',
            OPERATIONAL_EVENT_ADD_TO_HISTORY: 'было добавлено в историю',
            MONITORING_EVENTS_DETAILS: 'Событие',
            EVENT_OPERATIONAL_DESCRIPTION_REQUIRED_ERROR: 'Введите описание события',
            EVENT_OPERATIONAL_DATE_REQUIRED_ERROR: 'Введите дату события',
            OPERATIONAL_EVENT_DATE_FUTURE_ERROR: 'Дата события не может быть больше текущей'

        });
    }

    angular
        .module('iqsRetrospective.Events')
        .config(declareRetrospectiveEventTranslateResources);
}
