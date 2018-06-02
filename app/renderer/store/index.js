import { decorate, observable, action, computed, autorun } from "mobx";
import { ipcRenderer } from "electron";
import { OPEN_IMAGE, GET_COLOR, GET_COLOR_RETURN } from "common/channel";

class Store {
  currentImg = "";
  currentImgSize = { width: 0, height: 0 };
  currentPoint = { x: 0, y: 0, color: { r: 0, g: 0, b: 0 } };
  clickedPoints = [/* { x: 0, y: 0, color: { r: 0, g: 0, b: 0 } } */];

  getColor(x, y) {
    return new Promise((resolve, reject) => {
      ipcRenderer.send(GET_COLOR, { path: this.currentImg, point: { x, y } });
      ipcRenderer.once(GET_COLOR_RETURN, (event, { err, color: { r, g, b } }) => {
        if (err) {
          reject(err);
        } else {
          resolve({ r, g, b });
        }
      });
    });
  }

  async addPoint(x, y) {
    this.clickedPoints.push({ x, y, color: { r: 0, g: 0, b: 0 } });
    try {
      const { r, g, b } = await this.getColor(x, y);
      for (let i = 0; i < this.clickedPoints.length; i++) {
        if (this.clickedPoints[i].x === x && this.clickedPoints[i].y === y) {
          this.clickedPoints[i].color.r = r;
          this.clickedPoints[i].color.g = g;
          this.clickedPoints[i].color.b = b;
        }
      }
    } catch (err) {
      console.error(err);
    }
  }
}

decorate(Store, {
  currentImg: observable,
  currentPoint: observable,
  clickedPoints: observable

});

const store = new Store();

const urlRegexp = new RegExp("(https?|ftp|file)://[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]");

autorun(() => {
  if (urlRegexp.test(store.currentImg)) {
    const { ok, size: { width, height }, err } = ipcRenderer.sendSync(OPEN_IMAGE, { path: store.currentImg });
    if (!ok) {
      window.alert(err);
    } else {
      store.currentImgSize.height = height;
      store.currentImgSize.width = width;
    }
  }
});

// store.currentImg = "file://E:/QQ下载/MobileFile/-15df049f2e6fa240.jpg";

export default store;
