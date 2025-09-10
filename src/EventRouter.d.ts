export type Unsubscribe = () => void;
export type TopicHandler = (payload: any) => void;
export declare const EventRouter: {
    init(): Promise<void>;
    subscribe(topic: string, handler: TopicHandler): Unsubscribe;
    publish(topic: string, payload: any, conductor?: any): Promise<void>;
};
//# sourceMappingURL=EventRouter.d.ts.map