import { toPng } from 'html-to-image';

export async function exportStatsPng(element: HTMLElement): Promise<void> {
  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: '#1a1410',
  });

  const date = new Date().toISOString().slice(0, 10);
  const link = document.createElement('a');
  link.download = `wukong-suffering-${date}.png`;
  link.href = dataUrl;
  link.click();
}
