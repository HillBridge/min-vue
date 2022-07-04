
import { createApp } from "../../lib/guide-min-vue.esm.js";
import { App } from "./app.js";

const rootContainer = document.querySelector("#app")
createApp(App).mount(rootContainer)