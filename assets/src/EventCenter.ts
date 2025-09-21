import { _decorator, Component, director, sys } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('EventCenter')
export class EventCenter extends Component {
  private static instance: EventCenter;
  public scoreTotal: number = 0;

  public static getInstance() {
    return this.instance;
  }

  private clearListeners = [];

  onLoad() {
    EventCenter.instance = this;

    this.clearListeners = [];
    this.clearListeners.push(
      this.onGameOver((scoreTotal) => {
        this.recordScoreTotal();
        director.loadScene('gameOver');
      }, this)
    );
  }

  recordScoreTotal() {
    const listString = sys.localStorage.getItem('scoreHistory') || '[]';
    let list = JSON.parse(listString);
    list.unshift({ score: this.scoreTotal, time: Date.now() });
    list = list.slice(0, 4);
    sys.localStorage.setItem('scoreHistory', JSON.stringify(list));
  }

  getScoreHistory() {
    const listString = sys.localStorage.getItem('scoreHistory') || '[]';
    return JSON.parse(listString);
  }

  public resetData() {
    this.scoreTotal = 0;
  }

  onDestroy() {
    this.clearListeners.forEach(listener => listener());
  }

  emitPlayerHpDecr(hp: number) {
    this.node.emit('onPlayerHpDecr', hp);
  }

  onPlayerHpDecr(callback: (hp: number) => void, target: any) {
    this.node.on('onPlayerHpDecr', callback, target);
    return () => {
      if (this.node) {
        this.node.off('onPlayerHpDecr', callback, target);
      }
    }
  }

  emitPlayerDie() {
    this.node.emit('onPlayerDie');
  }

  onPlayerDie(callback: () => void, target: any) {
    this.node.on('onPlayerDie', callback, target);
    return () => {
      if (this.node) {
        this.node.off('onPlayerDie', callback, target);
      }
    }
  }

  emitEnemyDie(score: number) {
    this.node.emit('onEnemyDie', score);
  }

  onEnemyDie(callback: (score: number, scoreTotal: number) => void, target: any) {
    const realCallback = (score) => {
      this.scoreTotal += score;
      callback.call(target, score, this.scoreTotal);
    }
    this.node.on('onEnemyDie', realCallback, target);
    return () => {
      if (this.node) {
        this.node.off('onEnemyDie', realCallback, target);
      }
    }
  }

  onGameOver(callback: (scoreTotal: number) => void, target: any) {
    const realCallback = () => {
      callback.call(target, this.scoreTotal);
    }
    this.node.on('onGameOver', realCallback, target);
    return () => {
      if (this.node) {
        this.node.off('onGameOver', realCallback, target);
      }
    }
  }

  emitGameOver() {
    this.node.emit('onGameOver');
  }
}


