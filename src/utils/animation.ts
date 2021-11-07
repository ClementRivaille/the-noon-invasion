export function yieldTimeout(time: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

export function promisifyTween(tween: Phaser.Tweens.Tween): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (tween.hasStarted && !tween.isPlaying()) {
      resolve();
    } else {
      tween.once('complete', resolve);
      tween.once('stop', reject);
    }
  });
}
