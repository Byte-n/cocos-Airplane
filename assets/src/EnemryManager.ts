import { _decorator, Component, Node, Prefab, Size, UITransform, Vec2, Vec3, instantiate } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('EnemryManager')
export class EnemryManager extends Component {

    @property
    enemy0SpawnRate: number = 1;
    @property(Prefab)
    enemy0Prefab: Prefab = null;

    @property
    enemy1SpawnRate: number = 0.5;
    @property(Prefab)
    enemy1Prefab: Prefab = null;

    @property
    enemy2SpawnRate: number = 0.1;
    @property(Prefab)
    enemy2Prefab: Prefab = null;

    @property
    spawnInterval: number = 1; // 生成间隔（秒）
    @property
    minSpawnDistance: number = 30; // 最小生成距离

    private canvasSize: Size;
    private spawnTimer: number = 0;
    private activeEnemies: Node[] = []; // 当前活跃的敌人列表

    protected onLoad(): void {
        this.canvasSize = this.node.getComponent(UITransform).contentSize;
    }

    update(deltaTime: number) {
        this.spawnTimer += deltaTime;

        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnEnemy();
            this.spawnTimer = 0;
        }

        // 清理已销毁的敌人
        this.cleanupDestroyedEnemies();
    }

    // 生成敌人
    spawnEnemy() {
        const enemyType = this.selectEnemyType();
        const spawnPosition = this.calculateSpawnPosition();

        if (spawnPosition && enemyType) {
            const enemy = instantiate(enemyType);
            enemy.setPosition(spawnPosition);
            this.node.addChild(enemy);

            this.activeEnemies.push(enemy);
        }
    }

    // 根据几率选择敌人类型
    selectEnemyType(): Prefab | null {
        const random = Math.random();
        const totalRate = this.enemy0SpawnRate + this.enemy1SpawnRate + this.enemy2SpawnRate;

        if (random < this.enemy0SpawnRate / totalRate) {
            return this.enemy0Prefab;
        } else if (random < (this.enemy0SpawnRate + this.enemy1SpawnRate) / totalRate) {
            return this.enemy1Prefab;
        } else if (random < totalRate / totalRate) {
            return this.enemy2Prefab;
        }

        return null;
    }

    // 计算生成位置
    calculateSpawnPosition(): Vec3 | null {
        const maxAttempts = 10; // 最大尝试次数

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const x = this.getRandomXPosition();
            const y = this.canvasSize.height / 2 + 100; // 在屏幕顶部上方生成
            const spawnPos = new Vec3(x, y, 0);

            // 检查是否与现有敌人重叠
            if (!this.isPositionOverlapping(spawnPos)) {
                return spawnPos;
            }
        }

        // 如果找不到合适位置，返回null
        return null;
    }

    // 获取随机X位置
    getRandomXPosition(): number {
        const halfCanvasWidth = this.canvasSize.width / 2;
        const margin = 50; // 边距
        return Math.random() * (halfCanvasWidth * 2 - margin * 2) - halfCanvasWidth + margin;
    }

    // 检查位置是否与现有敌人重叠
    isPositionOverlapping(position: Vec3): boolean {
        for (const enemy of this.activeEnemies) {
            if (enemy && enemy.isValid) {
                const enemyPos = enemy.position;
                const distance = Vec3.distance(position, enemyPos);

                if (distance < this.minSpawnDistance) {
                    return true;
                }
            }
        }
        return false;
    }

    // 清理已销毁的敌人
    cleanupDestroyedEnemies() {
        this.activeEnemies = this.activeEnemies.filter(enemy =>
            enemy && enemy.isValid
        );
    }

    // 设置生成间隔
    setSpawnInterval(interval: number) {
        this.spawnInterval = interval;
    }

    // 设置最小生成距离
    setMinSpawnDistance(distance: number) {
        this.minSpawnDistance = distance;
    }

    // 设置敌人生成几率
    setEnemySpawnRates(rate0: number, rate1: number, rate2: number) {
        this.enemy0SpawnRate = rate0;
        this.enemy1SpawnRate = rate1;
        this.enemy2SpawnRate = rate2;
    }
}


