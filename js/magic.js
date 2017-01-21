function DragGestureListener(element, handler) {
	var self = this;

  self.stopListening = function () {
      element.onmousemove = undefined;
  };

  self.startListening = function () {
    element.onmousemove = function (event) {
    	if (event.buttons != null && event.buttons != 1) {
      	self.stopListening();
      } else {
        handler(event);
      }
    };
  };

  self.initListener = function () {
  	element.onmouseup = self.stopListening;
		element.onmousedown = self.startListening;
  };

  self.initListener();
}

function OverlayedCanvasImage(canvas, baseImage, overlayImage) {
	var self = this;

  self.construct = function () {
    // properties
    self.canvas = canvas;
    self.context = self.canvas.getContext('2d');
    self.baseImage = baseImage;
    self.baseImage.onload = self._initScene;
    self.overlayImage = overlayImage;
    self.imageX = 0;
    self.imageY = 0;
    self.imageWidth = 0;
    self.imageHeight = 0;

    // listeners
    new DragGestureListener(canvas, function (event) {
      self.moveX(-event.movementX);
      self.moveY(-event.movementY);
    });

    canvas.onwheel = function (event) {
      self.zoom(event.deltaY * 0.5);
      event.preventDefault();
    }
  }

  self.render = function () {
	  self.context.clearRect(0, 0, self.canvas.width, self.canvas.height);

    self.context.drawImage(
    	self.baseImage,
      self.imageX,
      self.imageY,
      self.imageWidth,
      self.imageHeight,
      0,
      0,
      self.canvas.width,
      self.canvas.height
    );

    // TODO: render overlay
  };

  self.moveX = function (offset) {
  	self.imageX += offset;
    self.render();
  };

  self.moveY = function (offset) {
    self.imageY += offset;
    self.render();
  };

  self.zoom = function (offset) {
  	if (self.imageWidth - offset > 20 && self.imageHeight - offset > 20) {
    	self.imageX += offset;
      self.imageY += offset;
      self.imageWidth -= offset * 2;
      self.imageHeight -= offset * 2;

      self.render();
    }
  };

  self.download = function () {
  	return self.canvas.toDataURL('png');
  }

  self._initScene = function () {
    if (self.baseImage.width >= self.baseImage.height) {
    	self.imageX = (self.baseImage.width - self.baseImage.height) / 2;
      self.imageY = 0;
      self.imageWidth = self.baseImage.height;
      self.imageHeight = self.baseImage.height;
    } else {
    	self.imageX = 0;
      self.imageY = (self.baseImage.height - self.baseImage.width) / 2;
      self.imageWidth = self.baseImage.width;
      self.imageHeight = self.baseImage.width;
    }

    self.render();
  };

	self.construct();
}

function ImageUploadingManager(fileInputElement, fileUploadedHandler) {
  if (FileReader) {
    fileInputElement.onchange = function (event) {
      var target = event.target || window.event.srcElement;
      var files = target.files;

      if (files && files.length) {
        var fileReader = new FileReader();
        fileReader.onload = function () {
          fileUploadedHandler(fileReader);
        };
        fileReader.readAsDataURL(files[0]);
      }
    }
  } else {
    alert('Please go and get a modern Browser!');
  }
}

function init() {
	new ImageUploadingManager(
    document.getElementById('imageUpload'),
    function (fileReader) {
      var image = new Image();
      var imageCanvas = new OverlayedCanvasImage(
        document.getElementById('imageCropper'),
        image,
        null
      );

      document.getElementById('download').onclick = function () {
        var hiddenDownload = document.getElementById('hiddenDownloadAnchor');
        hiddenDownload.href = imageCanvas.download();
        hiddenDownload.click();
      }

      image.src = fileReader.result;
    }
  );
}

window.onload = init;
