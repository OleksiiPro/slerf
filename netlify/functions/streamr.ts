import { HandlerEvent, HandlerContext } from "@netlify/functions";
import { StreamrClient } from '@streamr/sdk';


export async function handler(event: HandlerEvent, context: HandlerContext) {

  const wallet = {
    address: '0x4FC957F47ab6f84c34544268b6510317675126d0',
    privateKey: '0x6456d224bf80acbf37bf2524d9db59eed5bed239b8b4d981dcba3d43162ca4a7'
  };

  const streamr = new StreamrClient({
      auth: {
          privateKey: wallet.privateKey,
      },
  });

  const messageData = {
    date: Date.now(),
  };

  
  const message = await streamr.publish('0x36e855b6358e977832bde8b762636fdfb1c962d1/slerf', messageData);

  return {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(message)
  };

}