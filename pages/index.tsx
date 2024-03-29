import Head from "next/head";
import Header from "@components/Header";
import Footer from "@components/Footer";
import FeedbackForm from "@components/FeedbackForm";
import JokeBlock from "@components/JokeBlock";
import { useEffect } from "react";
import Provider, { useSubscribe } from 'streamr-client-react';

import * as Ably from 'ably';

function Home() {
  useSubscribe('0x36e855b6358e977832bde8b762636fdfb1c962d1/slerf', {
    onMessage(msg) {
      console.log('MESSAGE');
      console.log(msg);
    },
  });

  useEffect(() => {
    console.log("Oh hai! 🖤");

    fetch('./api/streamr');

    // (async () => {
    //   const optionalClientId = "optionalClientId"; // When not provided in authUrl, a default will be used.
    //   const ably = new Ably.Realtime({ authUrl: `./api/ably?clientId=${optionalClientId}` });
    //   const channel = ably.channels.get("some-channel-name");
  
    //   await channel.subscribe((msg: any) => {
    //       console.log("Ably message received", msg);
    //   });
  
    //   channel.publish("hello-world-message", { message: "Hello world!" });
    // })();
  }, []);

  return (
    <div className="container">
      
      <Head>
        <title>Next.js Toolbox</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header title="Next.js Toolbox" />
        <hr />
        <p className="description">
          Here's an example of a Netlify Form! When you fill this out, the
          submissions can be found in the Netlify Admin site.
        </p>
        <FeedbackForm />
        <JokeBlock />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (<Provider><Home/></Provider>);
}