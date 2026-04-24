import { createApp } from "vue";
import VueDsfr from "@gouvminint/vue-dsfr";
import "@gouvfr/dsfr/dist/dsfr.min.css";
import "@gouvminint/vue-dsfr/styles";
import "remixicon/fonts/remixicon.css";

import App from "./App.vue";
import router from "./router/index.js";

const app = createApp(App);
app.use(VueDsfr);
app.use(router);
app.mount("#app");
