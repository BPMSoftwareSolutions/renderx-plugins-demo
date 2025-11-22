export interface PublishedEvent<T=any> { topic: string; payload: T; }

export class TestEventBus {
  public events: PublishedEvent[] = [];
  publish(topic: string, payload: any) {
    this.events.push({ topic, payload });
  }
  last(topic: string) {
    return [...this.events].reverse().find(e => e.topic === topic);
  }
  count(topic?: string) {
    return topic ? this.events.filter(e => e.topic === topic).length : this.events.length;
  }
}

export function createEventBus() {
  return new TestEventBus();
}
