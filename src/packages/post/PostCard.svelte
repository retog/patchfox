<script>
  const { getPref } = require("../../core/kernel/prefs.js");
  const Card = require("../../core/components/ui/Card.svelte");
  const VoteCounter = require("../../core/components/VoteCounter.svelte");

  export let msg;
  let contentWarningsExpandByDefault = getPref(
    "content-warnings-expand",
    "collapsed"
  );
  let content = ssb.markdown(msg.value.content.text);
  let liked = false;
  let showRaw = false;
  let hasContentWarning = msg.value.content.contentWarning || false;
  let showContentWarning = contentWarningsExpandByDefault === "collapsed";

  ssb.votes(msg.key).then(ms => {
    liked = ms.includes(ssb.feed);
  });

  const likeChanged = ev => {
    let v = ev.target.checked;
    if (v) {
      ssb
        .like(msg.key)
        .then(() => console.log("liked", msg.key))
        .catch(() => (liked = false));
    } else {
      ssb
        .unlike(msg.key)
        .then(() => console.log("unliked", msg.key))
        .catch(() => (liked = true));
    }
  };

  const reply = ev => {
    let root = msg.value.content.root || msg.key;
    let channel = msg.value.content.channel;
    let replyfeed = msg.value.author;
    patchfox.go("post", "compose", {
      root,
      branch: msg.key,
      channel,
      replyfeed
    });
  };

  const fork = ev => {
    let originalRoot = msg.value.content.root || msg.key;
    let channel = msg.value.content.channel;
    let replyfeed = msg.value.author;
    patchfox.go("post", "compose", {
      root: msg.key,
      branch: msg.key,
      fork: originalRoot,
      channel,
      replyfeed
    });
  };

  const goRoot = ev => {
    let rootId = msg.value.content.root || msg.key;
    patchfox.go("hub", "thread", { thread: rootId });
  };

  const goBranch = ev => {
    let branchId = msg.value.content.branch || msg.key;
    patchfox.go("hub", "thread", { thread: branchId });
  };
</script>

<style>
  div img.is-image-from-blob {
    max-width: 90%;
  }

  .card-body {
    overflow-wrap: break-word;
  }
</style>

<Card {msg} {showRaw}>
  {#if hasContentWarning && showContentWarning}
    <p>{msg.value.content.contentWarning}</p>
    <button
      class="btn"
      on:click={() => (showContentWarning = !showContentWarning)}>
      Show Message
    </button>
  {:else}
    {#if hasContentWarning}
      <div class="toast toast-primary">
        <p>
          <b>Content Warning:</b>
          {msg.value.content.contentWarning}
          <button
            class="btn btn-sm float-right"
            on:click={() => (showContentWarning = !showContentWarning)}>
            Hide Message
          </button>
        </p>
      </div>
    {/if}
    {@html content}
  {/if}

  <div class="card-footer" slot="card-footer">
    <div class="columns col-gapless">
      <div class="column col-6">
        <label class="form-switch d-inline">
          <input type="checkbox" on:change={likeChanged} checked={liked} />
          <i class="form-icon" />
          Like
        </label>
        <span>
          <VoteCounter {msg} />
        </span>

        {#if msg.value.content.root}
          <span>
            <a
              href="?pkg=hub&view=thread&thread={encodeURIComponent(msg.value.content.root)}"
              on:click|preventDefault={goRoot}>
              (root)
            </a>
          </span>
        {/if}
        {#if msg.value.content.branch}
          <span>
            <a
              href="?pkg=hub&view=thread&thread={encodeURIComponent(msg.value.content.branch)}"
              on:click|preventDefault={goBranch}>
              (in reply to)
            </a>
          </span>
        {/if}
      </div>

      {#if !msg.value.private}
        <div class="column col-6 text-right">
          <button class="btn" on:click={fork}>Fork</button>

          <button class="btn" on:click={reply}>Reply</button>
        </div>
      {/if}
    </div>
  </div>
</Card>
