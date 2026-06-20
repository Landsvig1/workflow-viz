import { describe, it, expect } from "vitest";
import {
  executionOrder,
  playbackReducer,
  initialPlayback,
  type PlaybackState,
} from "./playback";
import type { WorkflowNode, WorkflowEdge } from "@/types/workflow";

const n = (id: string): WorkflowNode => ({
  id,
  data: { label: id, type: "action" },
});

describe("executionOrder", () => {
  it("orders a linear chain source-to-sink", () => {
    const order = executionOrder(
      [n("a"), n("b"), n("c")],
      [
        { id: "e1", source: "a", target: "b" },
        { id: "e2", source: "b", target: "c" },
      ]
    );
    expect(order).toEqual(["a", "b", "c"]);
  });

  it("places both branch targets after the branch node", () => {
    const order = executionOrder(
      [n("cond"), n("a"), n("b")],
      [
        { id: "e1", source: "cond", target: "a" },
        { id: "e2", source: "cond", target: "b" },
      ]
    );
    expect(order[0]).toBe("cond");
    expect(order.slice(1).sort()).toEqual(["a", "b"]);
  });

  it("includes every node once and orders triggers before descendants", () => {
    const order = executionOrder(
      [n("t1"), n("t2"), n("merge")],
      [
        { id: "e1", source: "t1", target: "merge" },
        { id: "e2", source: "t2", target: "merge" },
      ]
    );
    expect(order).toHaveLength(3);
    expect(new Set(order)).toEqual(new Set(["t1", "t2", "merge"]));
    expect(order.indexOf("t1")).toBeLessThan(order.indexOf("merge"));
    expect(order.indexOf("t2")).toBeLessThan(order.indexOf("merge"));
  });

  it("terminates on a cycle, visiting each node once", () => {
    const order = executionOrder(
      [n("a"), n("b"), n("c")],
      [
        { id: "e1", source: "a", target: "b" },
        { id: "e2", source: "b", target: "c" },
        { id: "e3", source: "c", target: "a" },
      ]
    );
    expect(order).toHaveLength(3);
    expect(new Set(order)).toEqual(new Set(["a", "b", "c"]));
  });
});

describe("playbackReducer", () => {
  const total = 3;

  it("play from idle starts running at index 0", () => {
    expect(playbackReducer(initialPlayback, { type: "play" }, total)).toEqual({
      status: "running",
      index: 0,
    });
  });

  it("pause moves running to paused", () => {
    const running: PlaybackState = { status: "running", index: 1 };
    expect(playbackReducer(running, { type: "pause" }, total)).toEqual({
      status: "paused",
      index: 1,
    });
  });

  it("play resumes from a paused index", () => {
    const paused: PlaybackState = { status: "paused", index: 1 };
    expect(playbackReducer(paused, { type: "play" }, total)).toEqual({
      status: "running",
      index: 1,
    });
  });

  it("tick advances while running", () => {
    const running: PlaybackState = { status: "running", index: 0 };
    expect(playbackReducer(running, { type: "tick" }, total)).toEqual({
      status: "running",
      index: 1,
    });
  });

  it("tick past the last node moves to done", () => {
    const running: PlaybackState = { status: "running", index: 2 };
    expect(playbackReducer(running, { type: "tick" }, total)).toEqual({
      status: "done",
      index: 2,
    });
  });

  it("play from done restarts at index 0", () => {
    const done: PlaybackState = { status: "done", index: 2 };
    expect(playbackReducer(done, { type: "play" }, total)).toEqual({
      status: "running",
      index: 0,
    });
  });

  it("step from idle pauses on the first node", () => {
    expect(playbackReducer(initialPlayback, { type: "step" }, total)).toEqual({
      status: "paused",
      index: 0,
    });
  });

  it("step advances one node and pauses", () => {
    const paused: PlaybackState = { status: "paused", index: 0 };
    expect(playbackReducer(paused, { type: "step" }, total)).toEqual({
      status: "paused",
      index: 1,
    });
  });

  it("step on the last node moves to done", () => {
    const paused: PlaybackState = { status: "paused", index: 2 };
    expect(playbackReducer(paused, { type: "step" }, total)).toEqual({
      status: "done",
      index: 2,
    });
  });

  it("reset returns to idle at index 0 from any state", () => {
    const done: PlaybackState = { status: "done", index: 2 };
    expect(playbackReducer(done, { type: "reset" }, total)).toEqual(
      initialPlayback
    );
  });
});
