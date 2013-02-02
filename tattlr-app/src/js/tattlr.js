// Constants used for configuration
var config = {
  parseAppId: 'dxrgKDDp9U29Q9CyJUnwC7TNcGKraRRPiklQKoDz',
  parseRestKey: 'sna2kts2K077cHcifCcHUrDQBscZGbMZKuQQtnxr',
  streamName: 'tattlr'
};

// Step 1: Capture an image
var capturePhoto = function() {
  forge.file.getImage({width: 500, height: 500}, function (file) {
    forge.file.imageURL(file, function (url) {
      $('#photo-container').prepend($('<img>').attr('src', url));
    });
    uploadPhotoFile(file);
  });
};

// Step 2: Upload the image file to Parse
var uploadPhotoFile = function(file) {
  forge.request.ajax({
    url: 'https://api.parse.com/1/files/' + (new Date()).getTime() + '.jpg',
    headers: {
      'X-Parse-Application-Id': config.parseAppId,
      'X-Parse-REST-API-Key': config.parseRestKey
    },
    type: 'POST',
    files: [file],
    fileUploadMethod: 'raw',
    dataType: 'json',

    success: function (data) {
      uploadPhotoMetadata(data);
    },
    error: function () {
      alert('Problem uploading the photo');
    }
  });
};

// Step 3: Upload image metadata to Parse
var uploadPhotoMetadata = function(data) {
  forge.request.ajax({
    url: 'https://api.parse.com/1/classes/Photo',
    headers: {
      'X-Parse-Application-Id': config.parseAppId,
      'X-Parse-REST-API-Key': config.parseRestKey
    },
    type: 'POST',
    contentType: 'application/json',
    dataType: 'json',
    data: JSON.stringify({
      file: {
        '__type': 'File',
        name: data.name
      },
      stream: config.streamName
    }),
    success: function (file) {
      // Upload complete - do nothing
    },
    error: function () {
      alert('Problem uploading the metadata');
    }
  });
};

// Get images from Parse
var getPhotos = function() {
  forge.request.ajax({
    url: 'https://api.parse.com/1/classes/Photo',
    headers: {
      'X-Parse-Application-Id': config.parseAppId,
      'X-Parse-REST-API-Key': config.parseRestKey
    },
    type: 'GET',
    dataType: 'json',
    data: {
      'where': '{"stream": "' + config.streamName + '"}',
      'order': '-createdAt'
    },
    success: function (data) {
      $('#photo-container').children().remove();
      data.results.forEach(function (photo) {
        $('#photo-container').append($('<img>').attr('src', photo.file.url));
      })
    },
    error: function () {
      alert('Problem reading photos');
    }
  });
};

// Setup 'sensible' click/touch handling
var clickEvent = 'ontouchend' in document.documentElement ? 'tap' : 'click';
if (clickEvent == 'tap') {
  var currentTap = true;
  $('*').live('touchstart', function (e) {
    currentTap = true;
    e.stopPropagation();
  });
  $('*').live('touchmove', function (e) {
    currentTap = false;
  });
  $('*').live('touchend', function (e) {
    if (currentTap) {
      $(e.currentTarget).trigger('tap');
    }
    e.stopPropagation();
  });
}

$(document).ready(function() {
  $('#upload-photo').bind(clickEvent, capturePhoto);
  getPhotos();
  forge.event.messagePushed.addListener(function (msg) {
    alert(msg.alert);
  });
});