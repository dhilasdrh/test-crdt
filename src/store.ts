import { syncedStore, getYjsDoc } from "@syncedstore/core";
import { WebsocketProvider } from "y-websocket";
// import { IndexeddbPersistence } from "y-indexeddb";
import type { Edge, Node } from "@vue-flow/core";
import { Doc, UndoManager } from "yjs";

export const store = syncedStore({
  nodes: [] as Node[],
  edges: [] as Edge[],
  fragment: "xml",
});

export const doc: Doc = getYjsDoc(store);

export const undoManager = new UndoManager([
  doc.getArray("nodes") as any,
  doc.getArray("edges") as any,
]);

// websocket
// Start a y-websocket server, e.g.: HOST=localhost PORT=1234 npx y-websocket-server
const wsProvider = new WebsocketProvider(
  "ws://localhost:1234",
  "my-roomname",
  doc
);

wsProvider.on("status", (event: any) => {
  console.log(event.status); // logs "connected" or "disconnected"
});

// local db
// const provider = new IndexeddbPersistence("my-roomname", doc);
// provider.on("synced", () => {
//   console.log("content from the database is loaded");
// });

export const disconnect = () => wsProvider.disconnect();
export const connect = () => wsProvider.connect();
