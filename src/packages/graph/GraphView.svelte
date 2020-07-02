<script>

  const {
    quad,
    namedNode,
    literal,
    defaultGraph
  } = require("@rdfjs/data-model");
  const { RdfStore } = require("quadstore");
  const SparqlEngine = require('quadstore-sparql');
  const Dataset = require("@rdfjs/dataset");
  const memdown = require("memdown");
  const N3 = require("n3");
  const { onMount, beforeUpdate, afterUpdate } = require("svelte");
  const YASQE = require('@triply/yasqe')
  const YASR = require('@triply/yasr')
  const superagent = require('superagent')
  import { DatasetEditor, DatasetBrowser, NamedNodeEditor, 
            SimpleLiteralEditor, ExistingTermEditor, TermEditor} from "rdfjs-svelte";


  export let currentSubView = "turtle";

  let msg = false;

  let sbot = ssb.sbot;

  document.title = `Patchfox - Patchgraph`;

  const db = memdown();

  let store = new RdfStore(db);

  const quads = [];
  for (let i = 0; i < 20; i++) {
    quads.push(
      quad(
        namedNode("http://ex.com/s" + i),
        namedNode("http://ex.com/p" + i),
        namedNode("http://ex.com/o" + i)/*,
        namedNode("http://ex.com/g")*/
      )
    );
  }
  store.put(quads).then(() => {
    console.log("Put succeded.");
  });
  console.log("ds creation.");
  let dataset = Dataset.dataset(quads);
  console.log(" created ds.", dataset);
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

  //beforeUpdate(() => {
  afterUpdate(() => {
    if (currentSubView === "sparql") {
      
      const yasqe = new YASQE(queryElement, {
        requestConfig: {
          showQueryButton: true,
          endpoint: "https://query.wikidata.org/bigdata/namespace/wdq/sparql"
        }
      })
      const yasr = new YASR(resultElement, {
        pluginOrder: ['table', 'response'],
        prefixes: {
          rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
          doi: 'http://dx.doi.org/'
        }
      })
      const origQueryFunction = yasqe.query;
      yasqe.query = function() {
        const sparqlEngineInstance = new SparqlEngine(store);
        sparqlEngineInstance.query(yasqe.getValue(), 'application/sparql-results+json'
        ).catch((err) => {
            console.log("err: ", err);
        }).then((result) => {
            console.log("result!: ", result);
            yasr.setResponse(result);
        });
        return Promise.resolve(true);
      }
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
            View
          </a>
        </li>
        <li class="tab-item" class:active={currentSubView === 'edit'}>
          <a
            href="#"
            on:click|preventDefault={() => (currentSubView = 'edit')}>
            Edit
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
      {#if currentSubView === 'edit'}
        <h2>Edit</h2>
        <!-- <TermEditor value={namedNode('http://example.org/hello')} /><br> -->
        <ExistingTermEditor value={literal('Some text')} on:input /><br> 
        <!-- <SimpleLiteralEditor value={literal('Some text')} on:input /><br> -->
        <!-- <DatasetEditor bind:value={dataset} /> -->
      {/if}
    </div>
  </div>
</div>
