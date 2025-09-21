import { _decorator, Animation, Collider2D, Component, Contact2DType, IPhysics2DContact, Node, UITransform } from 'cc';
import { EventCenter } from './EventCenter';

const { ccclass, property } = _decorator;

@ccclass('enemy')
export class enemy extends Component {
  @property
  speed: number = 200; // 敌人移动速度

  private canvasSize: { width: number, height: number } = { width: 0, height: 0 };

  private animation: Animation = null;

  @property(Node)
  body: Node;

  collider: Collider2D;

  @property
  hp: number = 1;

  private curHp: number;


  start() {
    this.curHp = this.hp;
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

  protected onDestroy(): void {
    if (this.collider) {
      this.collider.off(Contact2DType.BEGIN_CONTACT, this.onCollision, this);
    }
  }

  onCollision(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
    this.curHp--;
    if (!otherCollider.node.name.includes('bullet') && !otherCollider.node.name.includes('player')) {
      return;
    }
    if (this.curHp <= 0) {
      this.collider.enabled = false;
      this.playDieAnimation();
      EventCenter.getInstance().emitEnemyDie(this.hp);
      return;
    }
    this.playHitAnimation();
  }

  update(deltaTime: number) {
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
  destroyEnemy() {
    if (this.node && this.node.isValid) {
      this.node.destroy();
      this.destroy();
    }
  }

  // 播放死亡动画
  playDieAnimation() {
    if (this.animation) {
      // 根据敌人类型播放不同的死亡动画
      const clips = this.animation.clips;
      const dieClip = clips.find(clip => {
        return clip.name.includes('die');
      });
      if (dieClip) {
        this.animation.on(Animation.EventType.FINISHED, this.destroyEnemy, this);
        this.animation.play(dieClip.name);
      }
    }
  }

  // 播放受伤动画
  playHitAnimation() {
    if (this.animation) {
      const clips = this.animation.clips;
      const hitClip = clips.find(clip => clip.name.includes('hit'));
      if (hitClip) {
        this.animation.play(hitClip.name);
      }
    }
  }
}
