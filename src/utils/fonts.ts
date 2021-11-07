import uroobUrl from '../../assets/Uroob.ttf';

export enum Font {
  uroob = 'uroob',
}

export async function loadFonts() {
  const fonts = await document.fonts.ready;
  const fontFace = new FontFace(Font.uroob, `url(${uroobUrl}`);
  const loadedFont = await fontFace.load();
  fonts.add(loadedFont);
}
