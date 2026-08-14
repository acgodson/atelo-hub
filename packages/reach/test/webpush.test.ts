import { describe, expect, it } from "vitest";
import { InMemoryStore } from "../src/store.js";
import { ReachDispatcher, type PushTransport } from "../src/webpush.js";
import { buildEvent, makeEventId } from "../src/events.js";
import { makeClientSubscription } from "./fixtures.js";

function capturingTransport(): { transport: PushTransport; sent: { endpoint: string; payload: string }[] } {
  const sent: { endpoint: string; payload: string }[] = [];
  const transport: PushTransport = async (subscription, payload) => {
    sent.push({ endpoint: subscription.endpoint, payload });
    return { statusCode: 201 };
  };
  return { transport, sent };
}

describe("I2 web push subscribe -> dispatch round trip", () => {
  it("delivers a dispatched event to every stored subscription", async () => {
    const store = new InMemoryStore();
    await store.subscribe(makeClientSubscription("https://push.example/a"));
    await store.subscribe(makeClientSubscription("https://push.example/b"));

    const { transport, sent } = capturingTransport();
    const dispatcher = new ReachDispatcher(store, transport);

    const event = buildEvent({ kind: "system.test", title: "Hello", body: "World" });
    const report = await dispatcher.dispatch(event);

    expect(report.delivered).toBe(2);
    expect(report.failed).toBe(0);
    expect(report.deduped).toBe(false);
    expect(sent).toHaveLength(2);
    const payload = JSON.parse(sent[0]!.payload) as { title: string; eventId: string };
    expect(payload.title).toBe("Hello");
    expect(payload.eventId).toBe(event.eventId);
  });

  it("subscribe is idempotent per endpoint", async () => {
    const store = new InMemoryStore();
    const sub = makeClientSubscription("https://push.example/dup");
    const first = await store.subscribe(sub);
    const second = await store.subscribe(sub);
    expect(first.created).toBe(true);
    expect(second.created).toBe(false);
    expect(await store.list()).toHaveLength(1);
  });

  it("dispatches the same eventId only once (idempotent per event id)", async () => {
    const store = new InMemoryStore();
    await store.subscribe(makeClientSubscription("https://push.example/a"));

    const { transport, sent } = capturingTransport();
    const dispatcher = new ReachDispatcher(store, transport);

    const eventId = makeEventId("job.settled", "job:42");
    const event = buildEvent({ eventId, kind: "job.settled", title: "Job #42 settled", body: "OK" });

    const first = await dispatcher.dispatch(event);
    const second = await dispatcher.dispatch(event);

    expect(first.deduped).toBe(false);
    expect(first.delivered).toBe(1);
    expect(second.deduped).toBe(true);
    expect(second.delivered).toBe(0);
    expect(sent).toHaveLength(1);
    expect(dispatcher.hasDispatched(eventId)).toBe(true);
  });
});
