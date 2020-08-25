export enum ActivityTypes {
    RUN = 'RUN',
    WALKING = 'WALKING',
    BICYCLE = 'BICYCLE',
    SKIING = 'SKIING',
}

export interface Training {
    ID: string,
    date: Date,
    fullName: string,
    activityType: ActivityTypes,
    distance: number,
    comment: string,
}
