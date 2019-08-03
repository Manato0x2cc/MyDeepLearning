var includes = [
    "https://cdn.jsdelivr.net/gh/nicolaspanel/numjs@0.15.1/dist/numjs.min.js",
    "./js/index.js"
];

for (var i = 0; i < includes.length; i++) {
    var script = document.createElement("script");
    script.src = includes[i];
    document.body.appendChild(script);
}