import { _decorator, Component, EventTouch, Node, Input, input, instantiate, Prefab, UITransform, Vec2 } from 'cc';

const { ccclass, property } = _decorator;

enum ShootType {
  one = 1,
  two = 2,
  three = 3,
}

@ccclass('player')
export class player extends Component {
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

  start() {
    // 获取画布尺寸
    const uiTransform = this.canvas.getComponent(UITransform);
    this.canvasSize.width = uiTransform.contentSize.width;
    this.canvasSize.height = uiTransform.contentSize.height;
    console.log('this.canvasSize:', this.canvasSize);
    // 监听触摸事件
    input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
    input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    input.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

    // 监听鼠标事件
    input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
    input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
    input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
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
}


