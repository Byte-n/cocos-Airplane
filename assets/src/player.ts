import {
  _decorator, Animation, Collider2D, Component, Contact2DType, EventTouch, Input, input, instantiate, IPhysics2DContact,
  Node, Prefab, UITransform, Vec2,
} from 'cc';
import { EventCenter } from 'db://assets/src/EventCenter';


const { ccclass, property } = _decorator;

enum ShootType {
  one = 1,
  two = 2,
  three = 3,
}

@ccclass('Player')
export class Player extends Component {
  private isDragging: boolean = false;
  private lastTouchPos: Vec2 = new Vec2();
  private canvasSize: { width: number, height: number } = { width: 0, height: 0 };

  @property
  shootRate: number = 0.5;
  private shootTimer: number = 0;

  @property(Prefab)
  bulletPrefab: Prefab = null;

  @property(Prefab)
  bulletPrefab2: Prefab = null;

  @property(Node)
  bulletParent: Node = null;

  @property(Node)
  bulletCenter: Node = null;

  @property(Node)
  bulletLeft: Node = null;

  @property(Node)
  bulletRight: Node = null;
  @property(Node)
  canvas: Node = null;

  shootType: ShootType = ShootType.three;

  private animation: Animation = null;

  @property(Node)
  bodyImage: Node;

  collider: Collider2D;

  @property
  hp = 3;

  start() {
    this.animation = this.bodyImage.getComponent(Animation);
    // 获取画布尺寸
    const uiTransform = this.canvas.getComponent(UITransform);
    this.canvasSize.width = uiTransform.contentSize.width;
    this.canvasSize.height = uiTransform.contentSize.height;
    // 监听触摸事件
    input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
    input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    input.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

    // 监听鼠标事件
    input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
    input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
    input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);


    this.collider = this.bodyImage.getComponent(Collider2D);
    if (this.collider) {
      this.collider.on(Contact2DType.BEGIN_CONTACT, this.onCollision, this);
    }
  }

  onCollision(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
    if (otherCollider.node.name.includes('bullet')) {
      return;
    }
    this.collider.enabled = false;
    this.playHitAnimation(() => {
      this.collider.enabled = true;
    });
    this.hp--;
    EventCenter.getInstance().emitPlayerHpDecr(this.hp);
    if (this.hp === 0) {
      this.playDieAnimation(() => {
        EventCenter.getInstance().emitPlayerDie();
        EventCenter.getInstance().emitGameOver();
      });
    }
  }

  onDestroy() {
    // 移除事件监听
    input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
    input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    input.off(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

    input.off(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
    input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
    input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);

    if (this.collider) {
      this.collider.off(Contact2DType.BEGIN_CONTACT, this.onCollision, this);
    }
  }

  onTouchStart(event: EventTouch) {
    this.isDragging = true;
    this.lastTouchPos = event.getUILocation();
  }

  onTouchMove(event: EventTouch) {
    if (!this.isDragging) return;

    const currentPos = event.getUILocation();
    const deltaX = currentPos.x - this.lastTouchPos.x;
    const deltaY = currentPos.y - this.lastTouchPos.y;

    this.moveNode(deltaX, deltaY);
    this.lastTouchPos = currentPos;
  }

  onTouchEnd(event: EventTouch) {
    this.isDragging = false;
  }

  onMouseDown(event: any) {
    this.isDragging = true;
    this.lastTouchPos = event.getUILocation();
  }

  onMouseMove(event: any) {
    if (!this.isDragging) return;

    const currentPos = event.getUILocation();
    const deltaX = currentPos.x - this.lastTouchPos.x;
    const deltaY = currentPos.y - this.lastTouchPos.y;

    this.moveNode(deltaX, deltaY);
    this.lastTouchPos = currentPos;
  }

  onMouseUp(event: any) {
    this.isDragging = false;
  }

  private moveNode(deltaX: number, deltaY: number) {
    const currentPos = this.node.position;
    let newX = currentPos.x + deltaX;
    let newY = currentPos.y + deltaY;

    // 获取节点本身的尺寸
    const nodeTransform = this.node.getComponent(UITransform);
    if (!nodeTransform) return;

    const nodeWidth = nodeTransform.contentSize.width;
    const nodeHeight = nodeTransform.contentSize.height;

    // 限制节点在画布范围内移动，确保贴图不超出边界
    const halfCanvasWidth = this.canvasSize.width / 2;
    const halfCanvasHeight = this.canvasSize.height / 2;
    const halfNodeHeight = nodeHeight / 2;

    // 计算边界限制
    const minX = -halfCanvasWidth;
    const maxX = halfCanvasWidth;
    // 上下完全限制在边界内
    const minY = -halfCanvasHeight + halfNodeHeight;
    const maxY = halfCanvasHeight - halfNodeHeight;

    newX = Math.max(minX, Math.min(maxX, newX));
    newY = Math.max(minY, Math.min(maxY, newY));

    this.node.setPosition(newX, newY, currentPos.z);
  }

  update(deltaTime: number) {
    this.shootTimer += deltaTime;
    if (this.shootTimer >= this.shootRate) {
      this.shootTimer = 0;
      this.shoot();
    }
  }

  private shoot() {
    if (this.shootType === ShootType.one) {
      this.shootCenter();
      return;
    }

    if (this.shootType === ShootType.two) {
      this.shootLeftAndRight();
      return;
    }

    if (this.shootType === ShootType.three) {
      this.shootCenter();
      this.shootLeftAndRight();
      return;
    }
  }

  private shootCenter() {
    const node = instantiate(this.bulletPrefab);
    this.bulletParent.addChild(node);
    node.setWorldPosition(this.bulletCenter.worldPosition);
  }

  private shootLeftAndRight() {
    let node = instantiate(this.bulletPrefab2);
    this.bulletParent.addChild(node);
    node.setWorldPosition(this.bulletLeft.worldPosition);
    node = instantiate(this.bulletPrefab2);
    this.bulletParent.addChild(node);
    node.setWorldPosition(this.bulletRight.worldPosition);
  }


  // 播放死亡动画
  playDieAnimation(finished: VoidFunction) {
    if (this.animation) {
      // 根据敌人类型播放不同的死亡动画
      const clips = this.animation.clips;
      const dieClip = clips.find(clip => {
        return clip.name.includes('die');
      });
      if (dieClip) {
        this.animation.on(Animation.EventType.FINISHED, () => {
          finished();
          this.destroyPlayer();
        }, this);
        this.animation.play(dieClip.name);
      }
    }
  }

  destroyPlayer() {
    if (this.node && this.node.isValid) {
      this.node.destroy();
      this.destroy();
    }
  }

  // 播放受伤动画
  playHitAnimation(finished: VoidFunction) {
    if (this.animation) {
      const clips = this.animation.clips;
      const hitClip = clips.find(clip => clip.name.includes('hit'));
      if (hitClip) {
        this.animation.on(Animation.EventType.FINISHED, finished, this);
        this.animation.play(hitClip.name);
      }
    }
  }
}


