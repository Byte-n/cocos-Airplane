import { _decorator, Collider2D, Component, Contact2DType, IPhysics2DContact } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('Bullet')
export class Bullet extends Component {
  @property
  speed: number = 300; // 子弹移动速度

  @property
  maxDistance: number = 500; // 子弹最大移动距离

  private hasStarted: boolean = false;

  collider: Collider2D;

  moveTotal = 0;

  start () {
    this.hasStarted = true;

    // 监听碰撞事件
    this.collider = this.node.getComponent(Collider2D);
    if (this.collider) {
      this.collider.on(Contact2DType.BEGIN_CONTACT, this.onCollision, this);
    }
  }

  onDestroy () {
    if (this.collider) {
      this.collider.off(Contact2DType.BEGIN_CONTACT, this.onCollision, this);
    }
  }

  onCollision (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
    this.collider.enabled = false;
    this.destroyBullet();
  }

  update (deltaTime: number) {
    if (!this.hasStarted) return;

    // 子弹向前移动（Y轴正方向）
    const currentPos = this.node.worldPosition;
    const newY = currentPos.y + this.speed * deltaTime;
    this.node.setWorldPosition(currentPos.x, newY, currentPos.z);
    this.moveTotal += this.speed * deltaTime;
    if (this.moveTotal > this.maxDistance) {
      this.destroyBullet();
    }
  }

  // 销毁子弹
  destroyBullet () {
    if (this.node && this.node.isValid) {
      this.node.destroy();
      this.destroy();
    }
  }
}

/*

默认的2d物理引擎是 “基于BOX2d的物理引擎系统”，在设置界面节点位置后，物理碰撞 有问题。
改成直接通过 RigidBody 修改位置的方式可以解决
this.rigidBody = this.node.getComponent(RigidBody2D);
// 使用物理引擎移动子弹
if (this.rigidBody) {
    this.rigidBody.linearVelocity = new Vec2(0, 10);
}

另外一种就是，将物理引擎改成 内置的2D... 就正常了。


 */

