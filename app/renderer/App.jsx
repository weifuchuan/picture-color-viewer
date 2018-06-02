import React from "react";
import { observable, autorun } from "mobx";
import { observer, inject } from "mobx-react";
import { remote } from "electron";
import { Tabs, Input, Card, Button, InputNumber } from "antd";
import ModalLoading from "renderer/components/ModalLoading";
import Color from "common/model/ColorTS";

export default inject("store")(observer(
  class App extends React.Component {

    constructor(props) {
      super(props);

      this.state = observable({
        currentMousePoint: {
          x: 0,
          y: 0
        },
        currentMousePointColor: {
          r: 0,
          g: 0,
          b: 0
        },
        willMoveTo: {
          x: 0,
          y: 0
        },
        handling: false,
        twoColors: [],
        similarity: 1 // 不相似[0, 1]相识
      });

      autorun(() => {
        this.props.store.getColor(this.state.currentMousePoint.x, this.state.currentMousePoint.y)
          .then(({ r, g, b }) => {
            this.state.currentMousePointColor.r = r;
            this.state.currentMousePointColor.g = g;
            this.state.currentMousePointColor.b = b;
          })
          .catch(err => {
            console.error(err);
          });
      });

      autorun(() => {
        if (this.state.twoColors.length === 2) {
          const c1 = Color.fastLinearRbg(this.state.twoColors[0].r / 255, this.state.twoColors[0].g / 255, this.state.twoColors[0].b / 255);
          const c2 = Color.fastLinearRbg(this.state.twoColors[1].r / 255, this.state.twoColors[1].g / 255, this.state.twoColors[1].b / 255);
          this.state.similarity = 1 - Color.distanceLuv(c1, c2).toFixed(3);
        }
      });
    }

    render() {
      const { store } = this.props;

      return (
        <div className={"full"} style={{
          display: "flex"
        }}>
          <div
            style={{
              minWidth: "500px",
              width: "60%",
              height: "100%",
              overflow: "auto",
              backgroundColor: "#5e5e5e"
            }}
            ref={r => this.scrollArea = r}
          >
            <img ref={r => this.img = r} src={store.currentImg}/>
          </div>
          <div
            style={{
              flex: 1,
              maxWidth: "40%",
              display: "flex",
              flexDirection: "column"
            }}
          >
            <div className={"full"}
                 style={{ display: "flex", flexDirection: "column" }}>
              <Tabs style={{ width: "100%" }} defaultActiveKey="1">
                <Tabs.TabPane className={"full"} tab="从文件" key="1">
                  <div draggable={true} className={"border-of-drag-file"} style={{ color: "#3d27ff" }}
                       ref={r => this.dragImg = r}
                       onClick={this.addImg}
                  >
                    {
                      store.currentImg
                        ? store.currentImg
                        : "请点击或拖入图片"
                    }
                  </div>
                </Tabs.TabPane>
                <Tabs.TabPane className={"full"} tab="从网络" key="2">
                  <Input.Search
                    className={"full"}
                    placeholder="URL"
                    enterButton="载入"
                    size="large"
                    onSearch={this.loadImgFromUrl}
                  />
                </Tabs.TabPane>
              </Tabs>
              <div style={{
                padding: "1em",
                width: "100%",
                marginTop: "1em",
                border: "1px solid #D3D3D3",
                display: "flex",
                flexDirection: "column"
              }}>
                <div style={{
                  display: "flex"
                }}>
                  <div>
                    <p>图片大小：({store.currentImgSize.width}, {store.currentImgSize.height})</p>
                    <p>当前鼠标位置：(X, Y) = ({this.state.currentMousePoint.x}, {this.state.currentMousePoint.y})</p>
                    <p>颜色：(R, G, B) =
                      ({this.state.currentMousePointColor.r}, {this.state.currentMousePointColor.g}, {this.state.currentMousePointColor.b})</p>

                  </div>
                  <div style={{
                    backgroundColor: `rgb(${this.state.currentMousePointColor.r}, ${this.state.currentMousePointColor.g}, ${this.state.currentMousePointColor.b})`,
                    flex: 1,
                    marginLeft: "1em",
                    marginBottom: "1em"
                  }}>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span>x: </span>
                  <InputNumber min={0} max={store.currentImgSize.width}
                               defaultValue={0}
                               onChange={v => this.state.willMoveTo.x = v}/>
                  <span>y: </span>
                  <InputNumber min={0}
                               max={store.currentImgSize.height}
                               defaultValue={0}
                               onChange={v => this.state.willMoveTo.y = v}/>
                  <Button
                    onClick={() => {
                      this.scrollTo(this.state.willMoveTo.x, this.state.willMoveTo.y);
                    }}>移动</Button>
                </div>
                <div style={{ display: "flex", height: "2em" }}>
                  {this.state.twoColors.map((color, index) => {
                    return (
                      <div key={index}
                           style={{ flex: 1, backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})` }}>
                      </div>
                    );
                  })}
                  <span>相似度：{this.state.similarity.toString().substr(0, 5)}</span>
                </div>
              </div>
              <div
                ref={r => this.colorList = r}
                style={{
                  overflow: "auto",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column-reverse"
                }}>
                {
                  store.clickedPoints.map((point, index) => {
                    return (
                      <div
                        key={index}
                        style={{
                          padding: "1em",
                          display: "flex",
                          minHeight: "4em",
                          alignItems: "center"
                        }}
                        className={"clickable"}
                        onClick={() => this.clickClickedColor(point, index)}
                      >
                        <span>
                            {index + 1}
                        </span>
                        <div style={{
                          display: "flex",
                          flexDirection: "column",
                          marginLeft: "1em"
                        }}>
                          <span>(x = {point.x}, y = {point.y})</span>
                          <span>(R = {point.color.r}, G = {point.color.g}, B = {point.color.b})</span>
                        </div>
                        <div style={{
                          flex: 1,
                          backgroundColor: `rgb(${point.color.r}, ${point.color.g}, ${point.color.b})`,
                          height: "3em",
                          marginLeft: "1em"
                        }}>
                        </div>
                      </div>
                    );
                  })
                }
              </div>
            </div>
          </div>
          <ModalLoading loading={this.state.handling} title={"处理中..."}/>
        </div>
      );
    }

    clickClickedColor = (point, index) => {
      if (this.state.twoColors.length < 2) {
        this.state.twoColors.push(point.color);
      }else {
        this.state.twoColors[0] = this.state.twoColors[1];
        this.state.twoColors[1] = point.color;
      }
    };

    addImg = () => {
      const dialog = remote.dialog;
      dialog.showOpenDialog({
        title: "选择图片",
        buttonLabel: "选择",
        properties: ["openFile"],
        filters: [
          { name: "图片", extensions: ["jpg", "png", "gif"] }
        ]
      }, filePaths => {
        if (filePaths.length > 0) {
          const file = filePaths[0];
          this.props.store.currentImg = "file://" + file.replace(/\\{1,2}/g, "/");
        }
      });
    };

    urlRegexp = new RegExp("(https?|ftp|file)://[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]");

    loadImgFromUrl = (url) => {
      url = url.trim();
      if (this.urlRegexp.test(url)) {
        this.props.store.currentImg = url;
      } else {
        window.alert("请输入正确URL");
      }
    };

    scrollTo = (x, y) => {
      if (this.scrollArea) {
        this.scrollArea.scrollLeft = x;
        this.scrollArea.scrollTop = y;
      }
      this.props.store.addPoint(x, y).then(() => {
        this.colorList.scrollTop = 0;
      });
    };

    componentDidMount() {
      if (this.img) {
        this.img.onmousemove = (event) => {
          this.state.currentMousePoint.x = event.offsetX;
          this.state.currentMousePoint.y = event.offsetY;
        };
        this.img.onclick = event => {
          this.props.store.addPoint(event.offsetX, event.offsetY).then(() => {
            this.colorList.scrollTop = 0;
          });
        };
      }
      if (this.dragImg) {
        const img = this.dragImg;
        img.ondragover = () => {
          return false;
        };
        img.ondragleave = img.ondragend = () => {
          return false;
        };
        img.ondrop = (e) => {
          e.preventDefault();
          if (e.dataTransfer)
            for (let f of e.dataTransfer.files) {
              if ((f.type).indexOf("image/") === -1) {
                window.alert("请拖入图片！Please drag image! ");
              }
              else {
                this.props.store.currentImg = "file://" + f.path.replace(/\\{1,2}/g, "/");
              }
              return;
            }
          return false;
        };

      }
    }
  }));
