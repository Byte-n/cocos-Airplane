import { _decorator, Component, Node, Animation, Label } from 'cc';
import { EventCenter } from 'db://assets/src/EventCenter';

const { ccclass, property } = _decorator;

@ccclass('Topbar')
export class Topbar extends Component {

  @property(Node)
  hp: Node;

  @property(Label)
  scoreNumberNode: Label;

  private clearListeners = [];

  onLoad () {
    this.clearListeners = [];
    this.clearListeners.push(EventCenter.getInstance().onPlayerHpDecr(this.onPlayerHpDecr, this));
    this.clearListeners.push(EventCenter.getInstance().onEnemyDie(this.onEnemyDie, this));
  }


  onDestroy() {
    this.clearListeners.forEach(listener => listener());
  }

  onPlayerHpDecr (hp: number) {
    const ani = this.hp.children[hp].getComponent(Animation);
    ani.play('hp-decr');
  }

  onEnemyDie (score: number, totalScore: number) {
    this.scoreNumberNode.string = totalScore.toString();
  }
}


