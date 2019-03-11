const nest = require("depnest");
const { h, Struct, computed, map, resolve, onceTrue } = require("mutant");
const last = require("lodash/last");
const get = require("lodash/get");
const next = require("pull-next-query");


exports.gives = nest("app.page.feed");

exports.needs = nest({
    "feed.html.render": "first",
    "feed.obs.thread": "first",
    "message.html.render": "first",
    "about.html.image": "first",
    "about.obs.name": "first",
    "about.obs.description": "first",
    "keys.sync.id": "first",
    "message.html.markdown": "first",
    "sbot.pull.stream": "first"
});


exports.create = (api) => {
    return nest("app.page.feed", ({ feedID }) => {
        try {
            feedID = decodeURIComponent(feedID);
        } catch (e) {
            console.log("id not encoded.");
        }
        console.log("feedID", feedID);

        return h("div.App", [
            h("section.about", [
                api.about.html.image(feedID),
                h("h1", [
                    api.about.obs.name(feedID)
                ]),
                h("div.introduction", computed(api.about.obs.description(feedID), d => {
                    let content =  api.message.html.markdown(d || "");
                    console.log("markdown", d);
                    console.log("content", content);
                    return content;
                })),
                
            ])
        ]);
    });
};

