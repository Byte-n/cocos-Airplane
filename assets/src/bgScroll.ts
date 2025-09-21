import { _decorator, Component, math, UITransform } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('BgScroll')
export class BgScroll extends Component {
  @property
  speed: number = 100;

  private boxSize: math.Size = null;

  start () {
  }

  onLoad () {
    this.boxSize = this.node.getComponent(UITransform).contentSize;
  }

  update (deltaTime: number) {
    const pos = this.node.position;
    let nextY = pos.y - this.speed * deltaTime;
    if (nextY < -(this.boxSize.height)) {
      nextY = 0;
    }
    this.node.setPosition(pos.x, nextY, pos.z);
  }
}


