import { _decorator, Animation, Collider2D, Component, Contact2DType, EventTouch, Node, UITransform } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('enemy')
export class enemy extends Component {
  @property
  speed: number = 200; // 敌人移动速度

  private canvasSize: { width: number, height: number } = { width: 0, height: 0 };

  private animation: Animation = null;

  @property(Node)
  body: Node;

  collider:Collider2D

  start () {
    const uiTransform = this.node.parent.getComponent(UITransform);
    this.canvasSize.width = uiTransform.contentSize.width;
    this.canvasSize.height = uiTransform.contentSize.height;


    // 获取动画组件
    this.animation = this.body.getComponent(Animation);

    this.collider = this.body.getComponent(Collider2D);
    if (this.collider) {
      this.collider.on(Contact2DType.BEGIN_CONTACT, this.onCollision, this);
    }
  }

  protected onDestroy (): void {
    if (this.collider) {
      this.collider.off(Contact2DType.BEGIN_CONTACT, this.onCollision, this);
    }
  }

  onCollision (event: EventTouch, customEventData: string) {
    this.collider.enabled = false
    // this.playHitAnimation();
    console.log('1');
    this.playDieAnimation();
  }

  update (deltaTime: number) {
    const currentPos = this.node.position;

    // 直线向下移动
    const newY = currentPos.y - this.speed * deltaTime;

    this.node.setPosition(currentPos.x, newY, currentPos.z);

    // 如果敌人移动出屏幕底部，销毁敌人
    if (newY < -this.canvasSize.height / 2 - 100) {
      this.destroyEnemy();
    }
  }

  // 销毁敌人
  destroyEnemy () {
    if (this.node && this.node.isValid) {
      this.node.destroy();
    }
  }

  // 播放死亡动画
  playDieAnimation () {
    if (this.animation) {
      // 根据敌人类型播放不同的死亡动画
      const clips = this.animation.clips;
      const dieClip = clips.find(clip => {
        return clip.name.includes('die');
      });
      if (dieClip) {
        this.animation.play(dieClip.name);
      }
    }
  }

  // 播放受伤动画
  playHitAnimation () {
    if (this.animation) {
      const clips = this.animation.clips;
      const hitClip = clips.find(clip => clip.name.includes('hit'));
      if (hitClip) {
        this.animation.play(hitClip.name);
      }
    }
  }
}
