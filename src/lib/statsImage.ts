import html2canvas from 'html2canvas';

export async function exportStatsPng(element: HTMLElement, debug = false): Promise<void> {
  await document.fonts.ready;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#d9c89e',
    logging: debug,
  });

  if (debug) {
    console.log('[stats-export] canvas size:', canvas.width, '×', canvas.height);
  }

  await new Promise<void>((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) { resolve(); return; }
      const url = URL.createObjectURL(blob);
      const date = new Date().toISOString().slice(0, 10);
      const link = document.createElement('a');
      link.download = `wukong-pilgrimage-${date}.png`;
      link.href = url;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      resolve();
    }, 'image/png');
  });
}
