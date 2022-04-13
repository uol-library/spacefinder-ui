/**
 * van11y-accessible-modal-window-aria - ES2015 accessible modal window system, using ARIA (compatible IE9+ when transpiled)
 * @version v2.4.5
 * @link https://van11y.net/accessible-modal/
 * @license MIT : https://github.com/nico3333fr/van11y-accessible-modal-window-aria/blob/master/LICENSE
 */
"use strict";!function(t){function e(t,e){for("string"==typeof e&&(e=document.createElement(e)),t.appendChild(e);t.firstChild!==e;)e.appendChild(t.firstChild)}function a(t){t.parentNode.removeChild(t)}var o="js-modal",d="label_modal_",l="modal",n="data-modal-background-click",i="data-modal-prefix-class",r="data-modal-text",s="data-modal-content-id",c="data-modal-describedby-id",u="data-modal-title",m="data-modal-focus-toid",b="data-modal-close-text",f="data-modal-close-title",g="data-modal-close-img",v="dialog",A="modal-close",C="js-modal-close",p="js-modal-close",h="data-content-back-id",y="data-focus-back",k="modal__wrapper",x="modal__content",I="js-modal-content",L="modal__closeimg",T="modal-close__text",E="modal-title",B="modal-title",j="a[href], area[href], input:not([type='hidden']):not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]",M="js-modal-page",P="js-modal",D="js-modal-overlay",_="modal-overlay",w="Close modal",H="data-background-click",N="invisible",S="no-scroll",q="role",F="open",O="aria-labelledby",R="aria-describedby",$="aria-hidden",K="aria-haspopup",V="dialog",W=function(e){return t.getElementById(e)},z=function(t,e){t.classList?t.classList.add(e):t.className+=" "+e},G=function(t,e){t.classList?t.classList.remove(e):t.className=t.className.replace(new RegExp("(^|\\b)"+e.split(" ").join("|")+"(\\b|$)","gi")," ")},J=function(t,e){return t.classList?t.classList.contains(e):new RegExp("(^| )"+e+"( |$)","gi").test(t.className)},Q=function(t,e){for(var a=!1,o=t.parentNode;o&&a===!1;)J(o,e)===!0?a=!0:o=o.parentNode;return a===!0?o.getAttribute("id"):""},U=function(t){var e=D,a=t.text||w,o=t.prefixClass+_,d="disabled"===t.backgroundEnabled?"disabled":"enabled";return'<span\n id="'+e+'"\n class="'+o+'"\n'+H+'="'+d+'"\n title="'+a+'"\n>\n<span class="'+N+'">'+a+"</span>\n</span>"},X=function(t){var e=P,a=t.modalPrefixClass+l,o=t.modalPrefixClass+k,d=t.modalPrefixClass+A,n=t.modalCloseImgPath?'<img src="'+t.modalCloseImgPath+'" alt="'+t.modalCloseText+'" class="'+t.modalPrefixClass+L+'" />':'<span class="'+t.modalPrefixClass+T+'">\n'+t.modalCloseText+"\n</span>",i=t.modalPrefixClass+x,r=t.modalPrefixClass+B,s=""!==t.modalTitle?'<h1 id="'+E+'" class="'+r+'">\n'+t.modalTitle+"\n</h1>":"",c='<button type="button" class="'+p+" "+d+'" id="'+C+'" title="'+t.modalCloseTitle+'" '+h+'="'+t.modalContentId+'" '+y+'="'+t.modalFocusBackId+'">\n'+n+"\n</button>",u=t.modalText,m=""!==t.modalDescribedById?R+'="'+t.modalDescribedById+'"':"";if(""===u&&t.modalContentId){var b=W(t.modalContentId);b&&(u='<div id="'+I+'">\n'+b.innerHTML+"\n</div",b.innerHTML="")}return'<dialog id="'+e+'" class="'+a+'" '+q+'="'+v+'" '+m+" "+F+" "+O+'="'+E+'">\n<div role="document" class="'+o+'">\n'+c+'\n<div class="'+i+'">\n'+s+"\n"+u+"\n</div>\n</div>\n</dialog>"},Y=function(t){if(a(t.modal),a(t.overlay),""!==t.contentBackId){var e=W(t.contentBackId);e&&(e.innerHTML=t.modalContent)}if(t.modalFocusBackId){var o=W(t.modalFocusBackId);o&&o.focus()}},Z=function(){var e=arguments.length<=0||void 0===arguments[0]?t:arguments[0];return[].slice.call(e.querySelectorAll("."+o))},tt=function(a){var l=arguments.length<=1||void 0===arguments[1]||arguments[1];Z(a).forEach(function(a){var o=Math.random().toString(32).slice(2,12),l=W(M),n=t.querySelector("body");if(a.setAttribute("id",d+o),a.setAttribute(K,V),null===l||0===l.length){var i=t.createElement("DIV");i.setAttribute("id",M),e(n,i)}}),l&&["click","keydown"].forEach(function(e){t.body.addEventListener(e,function(a){var d=Q(a.target,o);if((J(a.target,o)===!0||""!==d)&&"click"===e){var l=t.querySelector("body"),v=""!==d?W(d):a.target,A=v.hasAttribute(i)===!0?v.getAttribute(i)+"-":"",k=v.hasAttribute(r)===!0?v.getAttribute(r):"",x=v.hasAttribute(s)===!0?v.getAttribute(s):"",L=v.hasAttribute(c)===!0?v.getAttribute(c):"",T=v.hasAttribute(u)===!0?v.getAttribute(u):"",E=v.hasAttribute(b)===!0?v.getAttribute(b):w,B=v.hasAttribute(f)===!0?v.getAttribute(f):E,_=v.hasAttribute(g)===!0?v.getAttribute(g):"",N=v.hasAttribute(n)===!0?v.getAttribute(n):"",q=v.hasAttribute(m)===!0?v.getAttribute(m):"",F=W(M);l.insertAdjacentHTML("beforeEnd",U({text:B,backgroundEnabled:N,prefixClass:A})),l.insertAdjacentHTML("beforeEnd",X({modalText:k,modalPrefixClass:A,backgroundEnabled:x,modalTitle:T,modalCloseText:E,modalCloseTitle:B,modalCloseImgPath:_,modalContentId:x,modalDescribedById:L,modalFocusBackId:v.getAttribute("id")})),F.setAttribute($,"true"),z(l,S);var O=W(C);if(""!==q){var R=W(q);R?R.focus():O.focus()}else O.focus();a.preventDefault()}var K=Q(a.target,p);if((a.target.getAttribute("id")===C||""!==K||a.target.getAttribute("id")===D||J(a.target,p)===!0)&&"click"===e){var l=t.querySelector("body"),F=W(M),V=W(P),Z=W(I)?W(I).innerHTML:"",tt=W(D),et=W(C),at=et.getAttribute(y),ot=et.getAttribute(h),N=tt.getAttribute(H);a.target.getAttribute("id")===D&&"disabled"===N||(Y({modal:V,modalContent:Z,overlay:tt,modalFocusBackId:at,contentBackId:ot,backgroundEnabled:N,fromId:a.target.getAttribute("id")}),F.removeAttribute($),G(l,S))}if(W(P)&&"keydown"===e){var l=t.querySelector("body"),F=W(M),V=W(P),Z=W(I)?W(I).innerHTML:"",tt=W(D),et=W(C),at=et.getAttribute(y),ot=et.getAttribute(h),dt=[].slice.call(V.querySelectorAll(j));27===a.keyCode&&(Y({modal:V,modalContent:Z,overlay:tt,modalFocusBackId:at,contentBackId:ot}),F.removeAttribute($),G(l,S)),9===a.keyCode&&dt.indexOf(a.target)>=0&&(a.shiftKey?a.target===dt[0]&&(dt[dt.length-1].focus(),a.preventDefault()):a.target===dt[dt.length-1]&&(dt[0].focus(),a.preventDefault())),9===a.keyCode&&dt.indexOf(a.target)===-1&&(a.preventDefault(),dt[0].focus())}},!0)})},et=function at(){tt(),document.removeEventListener("DOMContentLoaded",at)};document.addEventListener("DOMContentLoaded",et),window.van11yAccessibleModalWindowAria=tt}(document);
