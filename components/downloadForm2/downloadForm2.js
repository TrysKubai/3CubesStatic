fetch("./components/downloadForm2/downloadForm2.html")
  .then((stream) => stream.text())
  .then((response) => defineDownloadForm2(response));

function defineDownloadForm2(template) {
  class DownloadForm2 extends HTMLElement {
    constructor() {
      super();
      this.innerHTML = template;
      this.downloadURL =
        "https://utility-server.komandax.lt/Packages/RequestPackage";

      this.dialgoIsActive = true;

      this.downloadFormDialog = this.querySelector("#downloadFormDialog");
      this.downloadFormBackground = this.querySelector(
        "#downloadFormBackground"
      );
      this.downloadSubmitButton = this.querySelector("#downloadSubmitButton");

      this.successOverlay = this.querySelector("#successOverlay");
      this.failOverlay = this.querySelector("#failOverlay");
      //Form parameters
      this.emailInput = this.querySelector("#email");
      this.newsletterCheckbox = this.querySelector("#checkbox");

      //Validation indicators
      this.requiredBox = this.querySelector("#valid-required");
      this.symbolsBox = this.querySelector("#valid-symbols");

      this.language = "LT";
      this.lesson = "S13";

      this.emailCheckRegEx = /["'/$&\\;]/g;

      this.downloadSubmitButton.addEventListener("click", () => this.submit());
      this.downloadFormBackground.addEventListener("click", () => this.hide());

      this.packageLang = this.querySelector('#packageLang');
    }

    show() {
      this.style.display = "block";
      this.dialgoIsActive = true;
    }

    hide() {
      this.requiredBox.style.display = "none";
      this.symbolsBox.style.display = "none";

      this.style.display = "none";
      this.dialgoIsActive = false;
    }

    validate() {
      this.requiredBox.style.display = "none";
      this.symbolsBox.style.display = "none";

      if (this.emailInput.value === "") {
        this.requiredBox.style.display = "block";
        return false;
      }
      if (this.emailInput.value.match(this.emailCheckRegEx)) {
        this.symbolsBox.style.display = "block";
        return false;
      }

      return true;
    }

    sendEmail(email, lesson, subscribeToNewsletter) {
      const payload = {
        email: email,
        packageName: lesson,
        subscribeToNewsletter: subscribeToNewsletter,
      };

      fetch(this.downloadURL, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify(payload),
      })
        .then((response) => {
          if (response.status === 200) {
            this.successOverlay.style.display = "block";
            setTimeout(() => {
              this.successOverlay.style.display = "none";
            }, 3000);
          } else {
            this.failOverlay.style.display = "block";
            setTimeout(() => {
              this.failOverlay.style.display = "none";
            }, 4000);
          }
          //reset
          this.emailInput.value = "";
          this.newsletterCheckbox.checked = false;
        })
        .catch((error) => {
          this.failOverlay.style.display = "block";
          setTimeout(() => {
            this.failOverlay.style.display = "none";
          }, 4000);
        });
    }

    submit() {
      if (!this.validate()) return;

      this.sendEmail(
        this.emailInput.value,
        this.lesson + this.packageLang.value,
        this.newsletterCheckbox.checked
      );
    }
  }

  window.customElements.define("download-form-2", DownloadForm2);
}

function onClickDownloadButton2(lesson) {
  // const downloadForm = document.querySelector("download-form-2");
  // const packageLangSelect = document.querySelector('#packageLang');
  // const packageLangEn = document.querySelector('#packageLangEn');

  // downloadForm.lesson = lesson;
  // downloadForm.language = getLocalizationLanguage().toUpperCase();
  // downloadForm.show();

  // packageLangSelect.value = 'LT';
  // packageLangEn.disabled = lesson === 'KMKM';
  onClickDownloadButton(lesson);
}
