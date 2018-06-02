import {} from "electron";
import Jimp from "jimp";
import { GET_COLOR_RETURN } from "common/channel";
import Color from "common/model/Color";

const openedImage = new Map();

export function openImage(event, { path='' }) {
  openedImage.delete(path);
  let filePath = '';
  if (path.startsWith("file://")){
    filePath = path.slice(7);
  }
  Jimp.read(filePath).then(function(image) {
    openedImage.set(path, image);
    event.returnValue = { ok: true, size: { width: image.bitmap.width, height: image.bitmap.height } };
  }).catch(function(err) {
    console.error(err);
    event.returnValue = { err: err.toString(), ok: false };
  });
}

export function getColor(event, { path, point: { x, y } }) {
  let image = openedImage.get(path);
  if (image) {
    const { r, g, b } = Jimp.intToRGBA(image.getPixelColor(x, y));
    const color = Color.fastLinearRbg(r / 255, g / 255, b / 255);
    event.sender.send(GET_COLOR_RETURN, { color: { r, g, b } });
  } else {
    event.sender.send(GET_COLOR_RETURN, { err: "不存在此图片" });
  }
}
