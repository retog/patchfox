<script>
  const {
    quad,
    namedNode,
    literal,
    defaultGraph
  } = require("@rdfjs/data-model");
  const { RdfStore } = require("quadstore");
  const memdown = require("memdown");
  const N3 = require("n3");
  const { onMount, afterUpdate } = require("svelte");
  const YASQE = require('@triply/yasqe')
  const YASR = require('@triply/yasr')
  const superagent = require('superagent')
//import '../../../node_modules/yasqe/build/yasqe.min.css'
//import '@triply/yasr/build/yasr.min.css'

  export let currentSubView = "turtle";

  let msg = false;

  let sbot = ssb.sbot;

  document.title = `Patchfox - Patchgraph`;

  const db = memdown();

  const store = new RdfStore(db);

  const quads = [];
  for (let i = 0; i < 20; i++) {
    quads.push(
      quad(
        namedNode("http://ex.com/s" + i),
        namedNode("http://ex.com/p" + i),
        namedNode("http://ex.com/o" + i),
        namedNode("http://ex.com/g")
      )
    );
  }
  store.put(quads).then(() => {
    console.log("Put succeded.");
  });

  const streamWriter = new N3.StreamWriter({
    prefixes: { ex: "http://ex.com/" }
  });

  store.getStream().pipe(streamWriter);

  function streamToString(stream) {
    const chunks = [];
    return new Promise((resolve, reject) => {
      stream.on("data", chunk => chunks.push(chunk));
      stream.on("error", reject);
      stream.on("end", () => resolve(chunks.join("")));
    });
  }

  streamToString(streamWriter).then(s => (msg = s));

  let queryElement
  let resultElement

  afterUpdate(() => {
    if (currentSubView === "sparql") {
      
      const yasqe = new YASQE(queryElement, {
        requestConfig: {
          showQueryButton: true,
          endpoint: "https://query.wikidata.org/bigdata/namespace/wdq/sparql"
        }
      })

      const origQueryFunction = yasqe.query;
      yasqe.query = function() {
        console.log(arguments);
        alert("query: "+yasqe.getValue());
        const r = origQueryFunction();
        console.log(r);
        return r;
      }

      resultElement.id = Math.random().toString(36).substring(7)
      const yasr = new YASR(resultElement, {
        pluginOrder: ['table', 'response'],
        prefixes: {
          rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
          doi: 'http://dx.doi.org/'
        }
      })

      yasqe.on('queryResponse',
        (instance, req, duration) => {
          console.log("on queryResponse");
          console.log(req);
          yasr.setResponse(req, duration)
        })
    }
  });
</script>

<style>

</style>

<div class="container">
  <div class="columns">
    <div class="column">
      <h1>ScuttleGraph</h1>
      <br />
      <ul class="tab tab-block">
        <li class="tab-item" class:active={currentSubView === 'rdf2h'}>
          <a
            href="#"
            on:click|preventDefault={() => (currentSubView = 'rdf2h')}>
            RDF2h Rendered
          </a>
        </li>
        <li class="tab-item" class:active={currentSubView === 'triplitdown'}>
          <a
            href="#"
            on:click|preventDefault={() => (currentSubView = 'triplitdown')}>
            Triplitdown
          </a>
        </li>
        <li class="tab-item" class:active={currentSubView === 'sparql'}>
          <a
            href="#"
            on:click|preventDefault={() => (currentSubView = 'sparql')}>
            SPARQL
          </a>
        </li>
        <li class="tab-item" class:active={currentSubView === 'turtle'}>
          <a
            href="#"
            on:click|preventDefault={() => (currentSubView = 'turtle')}>
            Turtle
          </a>
        </li>
      </ul>
      <br />
      {#if currentSubView === 'turtle'}
        <pre>{msg}</pre>
      {/if}
      {#if currentSubView === 'sparql'}
        <div bind:this={queryElement}>editor</div>
        <div bind:this={resultElement}>result</div>
      {/if}
    </div>
  </div>
</div>
