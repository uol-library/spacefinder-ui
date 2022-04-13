---
layout: map
permalink: /
---

<div class="page-include" id="accessibility-page" aria-labelledby="accessibility-title" aria-describedby="accessibility-description" hidden>
  <header>
    <div id="accessibility-description" class="visuallyhidden">Text describing the accessibility status of this application</div>
    <h2 id="accessibility-title">Accessibility</h2>
    <button class="modal-close-button" title="Close Accessibility information">Close</button>
  </header>
  {% capture accessibility_page %}{% include_relative _pages/accessibility.md %}{% endcapture %}
  {{ accessibility_page | markdownify }}
</div>
<div class="page-include" id="privacy-page" arial-labelledby="privacy-title" hidden>
{% capture privacy_page %}{% include_relative _pages/privacy.md %}{% endcapture %}
{{ privacy_page | markdownify }}
</div>
<div class="page-include" id="terms-page" aria-labelledby="terms-title" hidden>
{% capture terms_page %}{% include_relative _pages/terms.md %}{% endcapture %}
{{ terms_page | markdownify }}
</div>