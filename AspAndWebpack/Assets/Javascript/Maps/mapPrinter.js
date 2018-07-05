var mapPrinter = function (options) {
    var self = this;
    self.mapDivId = options.mapDivId || "map";
    self.mapDiv = document.getElementById(self.mapDivId);
    self.mapObject = options.mapObject;
    self.targetCanvasId = options.targetCanvasId || "h2Canvas_Tmp";
    self.ihsLogo = document.querySelector('.brand img').src || "/Assets/Images/Janes-IHSM-logo.svg";
    self.button = '#ExportButton';
    self.exportType = 'png';
    self.gif = null;
    self.cleanUp = [];
    self.timer = 0;
    self.capture = function (pc, then) {
        _mapPageVM.showLoading('gif','Animated Image Export');
        if (!self.timer){
            self.timer = Date.now();
        }

        if (!self.gif) {
            self.gif = new GIF({
                workers: 2,
                quality: 10,
                workerScript: "/Assets/Javascript/Plugins/gif.worker.js"
            });
        }
        self.drawCanvas(function (canvas) {
            var ctx = canvas.getContext("2d");
            ctx.font = "15px Arial";
            ctx.fillStyle = '#333';
            ctx.textAlign = 'start';
            ctx.fillText(pc.txt, 15,30);

            ctx.beginPath();
            ctx.moveTo(0,0);
            ctx.lineTo(pc.pc * canvas.width, 0);
            ctx.lineWidth = 15;
            ctx.strokeStyle = '#009596';
            ctx.stroke();

            self.gif.addFrame(canvas, { copy: true });
            then();
        });
    };
    self.createGif = function () {
        self.gif.on('finished', function (blob) {
            var downloadName = "image.gif";
            var dlLink = document.createElement('a');
            dlLink.download = downloadName;
            dlLink.href = URL.createObjectURL(blob);
            dlLink.dataset.downloadurl = ["Image/Gif", dlLink.download, dlLink.href].join(':');
            document.body.appendChild(dlLink);
            dlLink.click();
            document.body.removeChild(dlLink);

            _mapPageVM.hideLoading('gif');
            console.log((Date.now() - self.timer)+'ms');
        });

        self.gif.render();
        $(self.button).removeClass("btn-loading");
    };
    self.print = function (button, type) {
        self.button = button || self.button;
        self.exportType = type || self.exportType;
        self.drawCanvas();
    };
    self.isIE = navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0;
    self.errors = {};
    self.drawCanvas = function (callback) {
        $(self.button).addClass("btn-loading");
        //ignore elements and setup cors flags 
        $("#map image").each(function () {
            $(this).attr('crossOrigin', 'anonymous');
        });
        $("#map img").each(function () {
            $(this).attr('crossOrigin', 'anonymous');
        });
        $('#map_root .esriControlsBR').each(function () {
            $(this).attr('data-html2canvas-ignore', 'true');
        })
        $('#map_root .esriPopup').each(function () {
            $(this).attr('data-html2canvas-ignore', 'true');
        })
        $('#map_zoom_slider').each(function () {
            $(this).attr('data-html2canvas-ignore', 'true');
        })
        $('#map_zoom_slider')
            .each(function () {
                $(this).attr('data-html2canvas-ignore', 'true');
            });
        $('#map .esriOverviewMap').each(function () {
            $(this).attr('data-html2canvas-ignore', 'true');
        })
        $('#searchBoxDiv').attr('data-html2canvas-ignore', 'true');
        var divToUse = self.mapDiv;
        if (self.isIE) {
            /* Microsoft Internet Explorer detected in. */
            divToUse = document.getElementById("map_layers");
        }
        self.AddIHSLogo();

        html2canvas(divToUse, {
            logging: false,
            useCORS: true
        }).then(function (canvas) {
            var element = document.getElementById(self.targetCanvasId);
            if (element) {
                element.parentNode.removeChild(element);
            }
            canvas.id = self.targetCanvasId;
            canvas.setAttribute('style', 'position: absolute;left: -10000px;top: 0px;');
            document.body.appendChild(canvas);

            var onComplete = function(){
                if(callback){
                    callback(canvas) ;
                }
                else{
                    self.downloadImage(canvas);
                }
                self.cleanUp.forEach(function(el){
                    el.remove();
                });
            };
            self.AddGraphics(onComplete);

        });
    };
    self.downloadImage = function (canvas) {
        var MIME_TYPE = "image/png";
        var self = this;
        var ctx = canvas.getContext("2d");
        var downloadName = "image.png";
        var ieError = "Due to an issue with this version of the Internet Explorer browser, exporting this map image with the icons is not possible. If you have the Chrome browser installed or are able to download IE 11 you can export the image.";
        if (canvas.msToBlob && !canvas.toBlob) {
            //for IE
            try {
                var blob = canvas.msToBlob();
                window.navigator.msSaveBlob(blob, downloadName);
            } catch (e) {
                self.errors.Info = null;
                self.errors.Error = ieError;
            }
        } else {
            //other browsers
            try {
                canvas.toBlob(function (blob) {
                    var imgURL = canvas.toDataURL(MIME_TYPE);
                    var dlLink = document.createElement('a');
                    dlLink.download = downloadName;
                    dlLink.href = URL.createObjectURL(blob);
                    dlLink.dataset.downloadurl = [MIME_TYPE, dlLink.download, dlLink.href].join(':');
                    document.body.appendChild(dlLink);
                    dlLink.click();
                    document.body.removeChild(dlLink);
                });
            } catch (e) {
                if (self.isIE) {
                    self.errors.Error = ieError;
                }
            }
        }
        var element = document.getElementById(self.targetCanvasId);
        if (element) {
            element.parentNode.removeChild(element);
        }
        $(self.button).removeClass("btn-loading");

        Object.keys(self.errors).forEach(function (key) {
            if (!self.errors[key]) return;
            window['Show' + key](self.errors[key]);
        });
    };
    self.AddGraphics = function (onComplete) {
        var extent = self.mapObject.geographicExtent;
        var canvas = document.getElementById(self.targetCanvasId);
        var firstLayer = $("#map_layers.esriMapLayers")[0];
        var ctx = canvas.getContext("2d");
        ctx.webkitImageSmoothingEnabled = false;
        ctx.mozImageSmoothingEnabled = false;
        ctx.imageSmoothingEnabled = false;
        //TODO:work out which layer we are on to get the correct offsetting

        self.imageCounter =  $("#map svg g:not([style='display: none;']) image, #map .ihsm-logo img").length;


       $("#map svg > g:not([style='display: none;']) image,#map svg > g:not([style='display: none;']) text, #map .ihsm-logo img").each(self.reDrawImageText.bind(self, onComplete));

        if (!self.imageCounter) onComplete();
    };

    self.reDrawImageText = function (onComplete, index, element) {
        var self = this;
        var canvas = document.getElementById(self.targetCanvasId);
        var ctx = canvas.getContext("2d");
        // we need to see if the images parent (or grandparent) has a transform as this will require the images to be offset some more
        // e.g. drag map a bit - g element transform gets changed but not the x y of the image, how this works I know not.
        var transform = $("#map svg g:not([style='display: none;'])").first().attr("transform");

        if (transform === undefined) {
            transform = $("#map svg").first().css("transform");
        }

        var parentTransformX = 0;
        var parentTransformY = 0;
        if (transform){
            var parentTransformValues;
            if (transform.indexOf(',') > -1) {
                parentTransformValues = transform.replace(')', '').split(',');
            } else {
                parentTransformValues = transform.replace(')', '').split(' ');
            }
            //ie doesnt contain commas, just spaces so handle this again if no commas
            parentTransformX = parentTransformValues[4];
            parentTransformY = parentTransformValues[5];
        }
        parentTransformY = self.mapDiv.getBoundingClientRect().top + Number(parentTransformY);

        var tagName = element.tagName.toLowerCase();
        if (tagName === 'image' || tagName === 'img') {

            var img = new Image();
            var isImg = tagName === 'img';

            var imageWidth = isImg ? element.width : element.attributes["width"].value;
            var imageHeight = isImg ? element.height : element.attributes["height"].value;
            var imageX = isImg ? element.x : Number(element.attributes["x"].value) + Number(parentTransformX);
            var imageY = isImg ? element.y : Number(element.attributes["y"].value) + Number(parentTransformY);
            var onLoadedImage = function () {};
            var sibling = element.nextElementSibling || $(element).next()[0];
            if (sibling && sibling.tagName.toLowerCase() === 'text') {
                onLoadedImage = function () {
                    self.reDrawImageText(onComplete, 0, sibling);
                };
            }
            img.onload = function () {
                ctx.shadowBlur = 0;
                ctx.drawImage(img, imageX, imageY, imageWidth, imageHeight);
                
                onLoadedImage();
                self.imageCounter--;
                if (self.imageCounter === 0) {
                    onComplete();
                }
            };
            img.onerror = function() {
                self.imageCounter--;
                if (self.imageCounter === 0) {
                    onComplete();
                }
            };

            var src = element.attributes[tagName === 'image' ? "xlink:href" : "src"].value;
                if (src.substr(0, 10) == 'data:image') {
                    self.imageCounter--;
                    if (self.imageCounter === 0) {
                        onComplete();
                    }
                    return;
                }
            img.src = src;
        } else {
            if (index > 0 && element.previousElementSibling && element.previousElementSibling.tagName.toLowerCase() === 'image') return;
            var X = Number(element.attributes["x"].value) + Number(parentTransformX);
            var Y = Number(element.attributes["y"].value) + Number(parentTransformY) + 5;
            var fontSize;
            fontSize = (fontSize=element.getAttributeNode('font-size').value) && fontSize.value || window.getComputedStyle(element, null).getPropertyValue('font-size') || "15px";
            ctx.font = "bold "+fontSize+" Arial";
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "center";
            ctx.shadowColor = '#000000';
            ctx.shadowBlur = 2;
            ctx.fillText(element.textContent.trim(), X, Y);
        }
    }
    self.AddIHSLogo = function () {
        var footer = $('<div style="bottom: 0;position: absolute;z-index: 1;background: #fff;border-top: 1px solid rgb(127,128,128);padding: 0.3em 1em;"></div>');
        footer.text($('footer').text());
        $('#map').append(footer);
        self.cleanUp.push(footer);
    };
}
