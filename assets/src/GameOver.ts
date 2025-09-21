import { _decorator, Component, director, Label, RichText } from 'cc';
import { EventCenter } from './EventCenter';

const { ccclass, property } = _decorator;

@ccclass('GameOver')
export class start extends Component {

  @property(Label)
  private scoreLabel: Label = null;

  @property(RichText)
  private scoreHistory: RichText = null;

  onLoad() {
    this.scoreLabel.string = EventCenter.getInstance().scoreTotal.toString();
    const scoreHistory = EventCenter.getInstance().getScoreHistory();
    this.scoreHistory.string = scoreHistory.map(item => {
      return `${formatTime(item.time)}: ${item.score}`
    }).join('\n');
  }


  public onStartGame() {
    EventCenter.getInstance().resetData();
    director.loadScene('game');
  }
}

function formatTime(time: number) {
  const date = new Date(time);
  return date.toLocaleString();
}

