/* Decode original HEIC bytes to pixels; no image files are converted or saved. */
'use strict';
importScripts('vendor/libheif/libheif-bundle.js');

self.onmessage = async function (event) {
  var images = [];
  try {
    var response = await fetch(event.data.url);
    if (!response.ok) throw new Error('Photo could not be loaded');
    var bytes = new Uint8Array(await response.arrayBuffer());
    var codec = await libheif();
    images = new codec.HeifDecoder().decode(bytes);
    if (!images.length) throw new Error('No image in HEIC file');
    var photo = images.find(function (item) { return item.is_primary(); }) || images[0];
    var width = photo.get_width();
    var height = photo.get_height();
    var pixels = await new Promise(function (resolve, reject) {
      photo.display({ width: width, height: height, data: new Uint8ClampedArray(width * height * 4) }, function (result) {
        if (result) resolve(result.data);
        else reject(new Error('HEIC decoding failed'));
      });
    });
    self.postMessage({ width: width, height: height, pixels: pixels }, [pixels.buffer]);
  } catch (error) {
    self.postMessage({ error: error.message });
  } finally {
    images.forEach(function (item) { item.free(); });
  }
};
