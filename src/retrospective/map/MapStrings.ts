
function configureMonitoringMapTranslations(
    pipTranslateProvider: pip.services.ITranslateProvider
) {
    pipTranslateProvider.translations('en', {
        NO_MAP_DATA: 'Organization location is not set',
        CONTACT_THE_ADMINISTRATOR: 'Contact the administrator',
        CONFIG_GLOBAL_MAP_SETTINGS: 'Set the organization location',
        GO_TO_GLOBAL_MAP_SETTINGS: 'Organization location settings',
        SEARCH: 'Search...',
        MAP_LOADING: 'Loading map...',
        CONTROL_OBJECTS: 'Control objects',
        FAB_CONTROL_OBJECTS: 'Objects',
        ZONES: 'Zones',
        GROUPS: 'Groups',
        LOCATIONS: 'Locations',
        FIND_OBJECTS: 'Find objects...',
        ZOOM_IN: 'Zoom in',
        ZOOM_OUT: 'Zoom out',
        ALL: 'All',
        person: 'people',
        device: 'trackers',
        equimpent: 'equipment',
        asset: 'assets',
        ASSIGN_OBJECT: 'Assign object',
        CURRENT_EVENTS: 'Recent events',
        ORGANIZATION_CENTER: 'Organization center',
        OBJECT_TAB_STATUS: 'Status', //DETAILS: 'More',
        MAP_POPUP_LESS: 'Less',
        MAP_POPUP_ASSIGN: 'Attach',
        MAP_POPUP_DETAILS: 'More',
        FREE_TRACKER: 'Free',
        DEVICE: 'Tracker',
        ASSIGN_TO_OBJECT: 'attached to object',
        ASSIGNED_OBJECT: 'Assigned',

        UPDATE_TIME: 'Time',
        LATITUDE: 'Latitude',
        LONGITUDE: 'Longitude',
        ALTITUDE: 'Altitude',
        DIRECTION: 'Heading',
        DEG: 'deg',
        SPEED: 'Speed',
        KM_IN_H: 'km/h',
        METRS: 'm',
        ONLINE: 'Online',
        FREEZED: 'Freezed',
        IMMOBILE: 'Immobile',

        OFFLINE: 'Offline',

        NO_COORDINATES: 'There are no coordinates',
        WILL_BE_UPDATED_LATER: 'Data will be updated when you receive the next message from the device',
        DEVICE_NOT_ASSIGNED: 'The device could not be attached to an object',
        CONFIGURE: 'Configure',

        SEARCH_NO_RESULTS_ON_MAP: 'Objects not found',
        OBJECT_STATE_BEACONS: 'Beacons',

        OBJECT_STATE_POWER: 'Power',
        OBJECT_STATE_POWER_ON: 'On',
        OBJECT_STATE_POWER_OFF: 'Off',
        OBJECT_STATE_IMMOBILE: 'Immobile',
        SEARCH_OBJECT_IN_ZONE_EMPTY: 'Currently, there are no objects in this geo-zone.',
        EVENT_ALL: 'All Events',
        'Pressure': 'Pressure'
    });

    pipTranslateProvider.translations('ru', {
        NO_MAP_DATA: 'Местоположение площадки неизвестно',
        CONTACT_THE_ADMINISTRATOR: 'Свяжитесь с администратором',
        CONFIG_GLOBAL_MAP_SETTINGS: 'Настройте местоположение площадки',
        GO_TO_GLOBAL_MAP_SETTINGS: 'Настройки местоположения площадки',
        SEARCH: 'Поиск...',
        MAP_LOADING: 'Загрузка карты...',
        CONTROL_OBJECTS: 'Объекты контроля',
        FAB_CONTROL_OBJECTS: 'Объекты',
        ZONES: 'Зоны',
        GROUPS: 'Группы',
        LOCATIONS: 'Места',
        FIND_OBJECTS: 'Найти объекты...',
        ZOOM_IN: 'Уменьшить масштаб',
        ZOOM_OUT: 'Увеличить масштаб',
        ALL: 'Все',
        person: 'люди',
        device: 'трекеры',
        equipment: 'машины',
        asset: 'механизмы',
        ASSIGN_OBJECT: 'Привязать объект',
        CURRENT_EVENTS: 'Текущие события',
        ORGANIZATION_CENTER: 'Центр площадки',
        OBJECT_TAB_STATUS: 'Статус', //: 'Подробно',
        MAP_POPUP_LESS: 'Кратко',
        MAP_POPUP_ASSIGN: 'Прикрепить',
        MAP_POPUP_DETAILS: 'Подробно',
        FREE_TRACKER: 'Свободен',
        DEVICE: 'Трекер',
        ASSIGN_TO_OBJECT: 'прикреплен к объекту',
        ASSIGNED_OBJECT: 'Назначен',

        UPDATE_TIME: 'Время',
        LATITUDE: 'Широта',
        LONGITUDE: 'Долгота',
        ALTITUDE: 'Высота',
        DIRECTION: 'Направление',
        DEG: 'град',
        SPEED: 'Скорость',
        KM_IN_H: 'км/ч',
        METRS: 'м',
        ONLINE: 'На связи',
        FREEZED: 'Полностью неподвижен',
        IMMOBILE: 'Неподвижен',

        OFFLINE: 'Не на связи',

        NO_COORDINATES: 'Координаты отсутствуют',
        WILL_BE_UPDATED_LATER: 'Данные будут обновлены при получении следующего сообщения с устройства',
        DEVICE_NOT_ASSIGNED: 'Трекер не удалось прикрепить к объекту',
        CONFIGURE: 'Настроить',

        SEARCH_NO_RESULTS_ON_MAP: 'Объекты по заданному критерию не найдены',
        OBJECT_STATE_BEACONS: 'Маяки',


        OBJECT_STATE_POWER: 'Питание',
        OBJECT_STATE_POWER_ON: 'Включено',
        OBJECT_STATE_POWER_OFF: 'Выключено',
        OBJECT_STATE_IMMOBILE: 'Неподвижность',
        SEARCH_OBJECT_IN_ZONE_EMPTY: 'В настоящий момент в геозоне обектов нет.',
        EVENT_ALL: 'Все события',
        'Pressure': 'Давление'
    });
}

angular
    .module('iqsRetrospective.Map')
    .config(configureMonitoringMapTranslations);