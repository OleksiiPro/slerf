import * as Ably from "ably";
import { HandlerEvent, HandlerContext } from "@netlify/functions";
import { StreamrClient } from '@streamr/sdk';


export async function handler(event: HandlerEvent, context: HandlerContext) {

  const streamr = new StreamrClient();

  const messageData = {
    hello: 'world',
  };

  try {
    const message = await streamr.publish('0x36e855b6358e977832bde8b762636fdfb1c962d1/slerf', messageData);
  } catch (error) {
    console.log(error);
  }

  return {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(messageData)
  };

}