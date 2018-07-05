//function qualtricsPopup(surveyID) {
//    qualtricsPopup(surveyID, 500);
//}

//function qualtricsPopup(surveyID, _delay, popupText, embeddedVal) {
//    var q_viewrate = 100;
//    if (Math.random() < q_viewrate / 100) {
//        var q_popup_f = function () {
//            var q_script = document.createElement("script");
//            var q_popup_g = function () {
//                new QualtricsEmbeddedPopup({
//                    id: surveyID,
//                    imagePath: "https://qdistribution.qualtrics.com/WRQualtricsShared/Graphics/",
//                    surveyBase: "https://ihs.qualtrics.com/SE/",
//                    delay: _delay,
//                    preventDisplay: 30,
//                    animate: false,
//                    width: 400,
//                    height: 300,
//                    embeddedData: { customData: (embeddedVal || '')},
//                    surveyPopupWidth: 900,
//                    surveyPopupHeight: 600,
//                    startPos: "TC",
//                    popupText: popupText || "Please take a few moments to tell us how well this site meets your needs.",
//                    linkText: "Click Here"
//                });
//            };
//            q_script.onreadystatechange = function () { if (this.readyState == "loaded") q_popup_g(); };
//            q_script.onload = q_popup_g;
//            q_script.src = "https://qdistribution.qualtrics.com/WRQualtricsShared/JavaScript/Distribution/popup.js";
//            document.getElementsByTagName("head")[0].appendChild(q_script);
//        };
//        if (window.addEventListener) {
//            window.addEventListener("load", q_popup_f, false);
//        } else if (window.attachEvent) {
//            r = window.attachEvent("onload", q_popup_f);
//        } else {
//        };
//    };
//}