// If gdpr setting have not been sat. Get the HTML file with the template and read it.
// TODO add error handling on unsucessfull response
fetch("./components/gdprPopup/gdprPopup.html")
  .then((stream) => stream.text())
  .then((response) => defineGDPR(response));

// Create a custom element class using the given template
function defineGDPR(template) {
  // GDPR Popup class to encapsulate the popup and avoid repetition of HTML code on multiple pages
  class GDPRPopup extends HTMLElement {
    constructor() {
      super();
      // For now leaving this inline template as its styles are defined in separete scss.
      // Might be worth considering encapsulating it with shadowDOM
      this.innerHTML = template;
      // let shadow = this.attachShadow({mode: "open"});
      // shadow.innerHTML = template;

      this.cookiePreferencesSaved = document.cookie.includes("GDPRConfirmed");
      this.newsletterContainer = document.querySelector(
        ".container__newsletter"
      );

      this.customizeBtn = this.querySelector("#customizeBtn");
      this.rejectAllBtn = this.querySelector("#rejectBtn");
      this.acceptAllBtn = this.querySelector("#acceptBtn");
      this.savePreferecesBtn = this.querySelector("#saveMyPreference");
      this.HTML = document.documentElement;
      this.body = document.body;

      this.switchers = this.querySelectorAll(
        "input[type=checkbox][name=cookieGroupToggle]"
      );
      this.expansionTriggeringElements = this.querySelectorAll(
        ".expansion-triggering-element"
      );
      this.preferencesContainer = this.querySelector("#preferenceContainer");
    }

    // Lifecycle hook, that gets called when the custom element is connected or disconnected from the DOM;
    connectedCallback() {
      if (!this.isConnected) return;
      // //Setting the initial state for popup inputs
      this.initialInputState();
      this.savedInputState(document.cookie);
      // Attaching on click events for buttons
      this.customizeBtn.onclick = () => this.expandPreference();
      this.rejectAllBtn.onclick = () => {
        this.rejectAllCookies();
        this.saveCookiePreferences();
        this.consentOptions();
        this.toggleDisplay(this);
      };
      this.acceptAllBtn.onclick = () => {
        this.acceptAllCookies();
        this.saveCookiePreferences();
        this.consentOptions();
        this.toggleDisplay(this);
        this.dispatchEvent(new CustomEvent("hideNotice"));
      };
      this.savePreferecesBtn.onclick = () => {
        this.saveCookiePreferences();
        this.consentOptions();
        this.toggleDisplay(this);
        this.dispatchEvent(new CustomEvent("hideNotice"));
      };

      // Attaching on click events for elements triggering expansion of cookie explanation
      this.expansionTriggeringElements.forEach(
        (element) =>
          (element.onclick = () => this.expandCookieGroup(element.id))
      );
      // If there are already preferences set don't display the preferences tab
      if (this.cookiePreferencesSaved) {
        this.style.display = "none";
        if (document.cookie.includes("functi-false"))
          this.style.display = "none";
      } else {
        this.style.display = "block";
      }
    }
    //function triggered on showGDPR custom event
    show() {
      this.style.display = "block";
      this.expandPreference();
    }
    //setting initial cookie options
    initialInputState() {
      this.switchers.forEach((switcher) => {
        switcher.checked = true;
      });
    }
    //setting saved customized cookie settings inputs, their states
    savedInputState(cookieValue) {
      this.switchers.forEach((switcher) => {
        if (
          cookieValue.includes("functi-false") &&
          switcher.id === "functional"
        ) {
          switcher.checked = false;
        }

        if (
          cookieValue.includes("analyt-false") &&
          switcher.id === "analytical"
        ) {
          switcher.checked = false;
        }
      });
    }
    //Save selected preferencess to cookies
    // TODO Check for existing cookie and owerwrite
    saveCookiePreferences() {
      let consentCookieValue = "";
      this.switchers.forEach(
        (switcher) =>
          (consentCookieValue += `${switcher.id.slice(0, 6)}-${
            switcher.checked
          }/`)
      );
      // If I recall correctly this will always create a new cookie, so if this is save twice we will have 2 of the same cookies.
      document.cookie = `GDPRConfirmed=${consentCookieValue}; path=/;`;
      this.cookiePolicySaved = true;
      //Setting the initial state for popup inputs
      if (
        this.HTML.classList.contains("inactive") ||
        this.body.classList.contains("inactive")
      ) {
        this.HTML.classList.toggle("inactive");
        this.body.classList.toggle("inactive");
      }
    }

    // Set all cookie options to FALSE
    rejectAllCookies() {
      this.switchers.forEach((switcher) => {
        switcher.checked = false;
        // this.newsletterContainer.style.display = "none";
      });
    }

    // Set all cookie options to TRUE
    acceptAllCookies() {
      this.switchers.forEach((switcher) => {
        switcher.checked = true;
      });
    }
    //Setting selected GA consent option
    consentOptions = () => {
      let cookieArr = [];
      let cookieStr = "";
      let updatedCokie = "";
      if (document.cookie.indexOf("analyt-true") > -1) {
        gtag("consent", "update", {
          ad_storage: "granted",
          analytics_storage: "granted",
        });
        window[disableStr] = false;
      } else {
        gtag("consent", "update", {
          ad_storage: "denied",
          analytics_storage: "denied",
        });
        window[disableStr] = true;
        //manually deleating GA cookies
        cookieArr = document.cookie.split(";");
        //terminating GA cookies
        cookieArr
          .filter((c) => c.indexOf("_ga") > -1)
          .forEach((cookie) => {
            document.cookie = `${cookie} ; expires = Thu, 01 Jan 1970 00:00:00 GMT`;
          });
      }
    };

    // Expand the cookieGroup matching the clicked item id
    expandCookieGroup(clickedItem) {
      const group = this.querySelector(`#${clickedItem}CookieTable`);
      const chevronArrows = document.querySelectorAll(
        ".popup__container-preference_body-wrapper_accordion-item_chevron"
      );
      //SHOW/HIDE cookieGroup section
      this.toggleDisplay(group);

      chevronArrows.forEach((arrow) => {
        if (arrow.id === clickedItem) arrow.classList.toggle("rotate-arrow");
      });
    }

    // Expand the main customization section
    expandPreference() {
      this.customizeBtn.classList.toggle("rotate-arrow");
      this.toggleDisplay(this.preferencesContainer);
      //Disabling scrolling on consent customization
      this.HTML.classList.toggle("inactive");
      this.body.classList.toggle("inactive");
    }

    //Toggle element display style value
    toggleDisplay(element) {
      element.style.display == "none" || element.style.display === ""
        ? (element.style.display = "block")
        : (element.style.display = "none");
    }
  }
  window.customElements.define("gdpr-popup", GDPRPopup);
}
