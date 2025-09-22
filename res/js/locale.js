const headerComp = document.querySelector("header-comp");
const productTutElement = document.querySelector("#helper");
var localizationLanguage;
// Parameter hiding to the next level - EVERYTHING is name cookie...
//get ONLY lang Cookie
// function getLangCookie() {
//   let cookies = {};
//   let lang = navigator.language || navigator.userLanguage;
//   document.cookie.split(";").map(function (el) {
//     let [k, v] = el.split("=");
//     if (el.length == 2) {
//       cookie = el;
//     }
//     //language change on default browser lang
//     if (!cookie && lang === "lt") {
//       cookie = "lt";
//     }
//   });
//   return cookie;
// }

// Get localization language from current memory or load it from cookie;
function getLocalizationLanguage() {
  if (!localizationLanguage) {
    let localizationParameter = document.cookie
      .split(";")
      .find((s) => s.includes("loc_lang"));
    if (!localizationParameter) {
      setLocalizationLanguage("en");
      localizationParameter = "loc_lang=en";
      return "en";
    }
    localizationLanguage = localizationParameter.split("=")[1];
  }

  return localizationLanguage;
}

// Set the localization language parameter in the cookie to the given value
function setLocalizationLanguage(value, expiration = 2592000) {
  document.cookie = `loc_lang=${value}; max-age=${expiration}; path=/;`;
  localizationLanguage = value;
}

//toggle logo LT->EN
function toggleLogo(lang) {
  const L = lang || i18next.language || "en";
  if (L === "en") {
    headerComp.logo.src = "./res/img/header_footer/logo_en.png";
  } else {
    headerComp.logo.src = "./res/img/header_footer/logo.png";
  }
}

function updateContent() {
  // A) Text nodes
  const elements = document.getElementsByClassName("element");
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const key = el.getAttribute("data");
    const val = i18next.t(key);
    if (typeof val === "string") el.innerHTML = val;
  }

  // B) Attribute bindings (src, alt, href, poster, srcset, etc.)
  document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
    const map = el.getAttribute("data-i18n-attr"); // e.g. "src:sample.cybersecurity.logo; alt:sample.cybersecurity.logoAlt"
    if (!map) return;
    map.split(";").forEach((pair) => {
      const p = pair.trim();
      if (!p) return;
      const [attr, key] = p.split(":").map((s) => s.trim());
      if (!attr || !key) return;
      let val = i18next.t(key);
      if (typeof val !== "string" || !val) return;

      // GitHub Pages safety: use relative paths, strip any leading slash
      if (
        attr === "src" ||
        attr === "href" ||
        attr === "poster" ||
        attr === "srcset"
      ) {
        val = val.replace(/^\/+/, "");
      }
      el.setAttribute(attr, val);
    });
  });
}

function updateSectionContent(sectionSelector, lng) {
  const root = document.querySelector(sectionSelector);
  if (!root) return;

  // text
  root.querySelectorAll(".element[data]").forEach((el) => {
    const key = el.getAttribute("data");
    const val = i18next.t(key, { lng });
    if (typeof val === "string") el.innerHTML = val;
  });

  // attributes (src, alt, href, poster, srcset)
  root.querySelectorAll("[data-i18n-attr]").forEach((el) => {
    const map = el.getAttribute("data-i18n-attr");
    if (!map) return;
    map.split(";").forEach((pair) => {
      const p = pair.trim();
      if (!p) return;
      const [attr, key] = p.split(":").map((s) => s.trim());
      if (!attr || !key) return;
      let val = i18next.t(key, { lng });
      if (typeof val !== "string" || !val) return;
      if (
        attr === "src" ||
        attr === "href" ||
        attr === "poster" ||
        attr === "srcset"
      ) {
        val = val.replace(/^\/+/, ""); // GH Pages-safe
      }
      el.setAttribute(attr, val);
    });
  });
}

function toggleClass() {
  document.querySelector(`.${i18next.language}`).classList.add("active");
}

async function i18Loader() {
  const langs = ["en", "lt", "pl"];
  const jsons = await Promise.all(
    langs.map((l) => fetch("./res/lang/" + l + ".json").then((r) => r.json()))
  );
  const res = langs.reduce((acc, l, idx) => {
    acc[l] = { translation: jsons[idx] };
    return acc;
  }, {});
  await i18next.init({
    lng: localizationLanguage ? localizationLanguage : "en",
    debug: true,
    resources: res,
  });

  updateContent();

  i18next.on("languageChanged", () => {
    updateContent();
  });

  // 👇 Wire the PL button NOW (no DOMContentLoaded)
  const plBtn = document.querySelector("#cybersecurity .switch-to-pl");
  if (plBtn) {
    plBtn.addEventListener("click", () => {
      updateSectionContent("#cybersecurity", "pl");
    });
  }

  // (Unrelated but still risky) headerComp.langSelector may be undefined.
  // Guard it so your page doesn't crash if header-comp hasn't exposed it.
  if (headerComp?.langSelector) {
    headerComp.langSelector.forEach((s) => {
      s.addEventListener("click", (e) => {
        const next = e.target.innerText.toLowerCase();
        i18next.changeLanguage(next);
        setLocalizationLanguage(next);
        toggleLogo(next);
        // simple active toggle
        headerComp.langSelector.forEach((b) =>
          b.classList.toggle("active", b === s)
        );
      });
    });
  }

  toggleClass();
  toggleLogo(localizationLanguage);
}

getLocalizationLanguage();
i18Loader();
