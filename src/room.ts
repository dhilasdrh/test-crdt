import { createClient } from "@liveblocks/client";

export const roomId = "sample-crdt";
// login in liveblocks to get the public key
export const ROOM_PUBLIC_KEY =
  "pk_dev_MriH1Nws1ze8H1lnLgwKvQA9iDKvshuAiaPUSzxYeEcxy-pnt-c1MQhCdAGOx6Tu";

export const client = createClient({
  publicApiKey: ROOM_PUBLIC_KEY,
});
