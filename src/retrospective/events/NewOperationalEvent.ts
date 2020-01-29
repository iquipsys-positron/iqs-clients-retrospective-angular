export class NewOperationalEvent {
    objectGroupId: string = null;
    locationZoneId: string = null;
    description: string;
    severity?: number;
    type: string = iqs.shell.OperationalEventType.ManualRecord; 
    date: Date; // проследить что бы было в utc
    time: Date;
    org_id?: string; // ставить саому? откуда брать?
}